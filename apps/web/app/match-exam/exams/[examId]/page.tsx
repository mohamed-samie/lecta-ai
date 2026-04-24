"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AnswerInput } from "@/features/match-exam/components/AnswerInput";
import { ExamFooterBar } from "@/features/match-exam/components/ExamFooterBar";
import { ExamLayout } from "@/features/match-exam/components/ExamLayout";
import { QuestionCard } from "@/features/match-exam/components/QuestionCard";
import { QuestionNavigator } from "@/features/match-exam/components/QuestionNavigator";

type PageProps = {
  params: {
    examId: string;
  };
};

type ExamQuestion = {
  id?: string | number;
  type?: string;
  question?: string;
  question_text?: string;
  choices?: string[];
  options?: string[];
  answer?: string;
};

type ExamResponse = {
  exam_id?: number;
  id?: number;
  session_id?: number;
  exam?: {
    questions?: ExamQuestion[];
  };
  questions?: ExamQuestion[];
  exam_json?: {
    questions?: ExamQuestion[];
  };
};

async function readApiError(response: Response) {
  const text = await response.text();

  try {
    const json = JSON.parse(text);
    return typeof json.detail === "string"
      ? json.detail
      : JSON.stringify(json.detail ?? json, null, 2);
  } catch {
    return text || `Request failed with status ${response.status}`;
  }
}

async function fetchExam(examId: string): Promise<ExamResponse> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const urls = [
    `${apiBaseUrl}/exam/${examId}`,
    `${apiBaseUrl}/exams/${examId}`,
    `${apiBaseUrl}/exam/get/${examId}`,
  ];

  let lastError = "";

  for (const url of urls) {
    const response = await fetch(url);

    if (response.ok) {
      return response.json();
    }

    lastError = await response.text();
  }

  throw new Error(lastError || "Could not load exam.");
}

function extractQuestions(data: ExamResponse): ExamQuestion[] {
  return data.exam?.questions ?? data.questions ?? data.exam_json?.questions ?? [];
}

function isAnswered(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export default function MatchExamPage({ params }: PageProps) {
  const { examId } = params;

  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get("session_id");

  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedSessionId = sessionIdFromUrl ?? String(exam?.session_id ?? "");

  useEffect(() => {
    let mounted = true;

    async function loadExam() {
      try {
        const data = await fetchExam(examId);

        if (mounted) {
          setExam(data);
        }
      } catch (error) {
        console.error(error);
        alert(error instanceof Error ? error.message : "Failed to load exam.");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadExam();

    return () => {
      mounted = false;
    };
  }, [examId]);

  const questions = useMemo(() => {
    return exam ? extractQuestions(exam) : [];
  }, [exam]);

  const currentQuestion = questions[currentQuestionIndex];

  const answeredQuestionIndexes = Object.entries(answers)
    .filter(([, value]) => isAnswered(value))
    .map(([index]) => Number(index));

  const unansweredIndexes = questions
    .map((_, index) => index)
    .filter((index) => !isAnswered(answers[index]));

  const canSubmit = questions.length > 0 && unansweredIndexes.length === 0;

  function handleNext() {
    setCurrentQuestionIndex((index) =>
      Math.min(index + 1, questions.length - 1),
    );
  }

  function handlePrev() {
    setCurrentQuestionIndex((index) => Math.max(index - 1, 0));
  }

  async function handleSubmit() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      alert("NEXT_PUBLIC_API_BASE_URL is not defined");
      return;
    }

    if (!resolvedSessionId) {
      alert("Missing session_id. Please regenerate the exam.");
      return;
    }

    const firstUnansweredIndex = questions.findIndex(
      (_, index) => !isAnswered(answers[index]),
    );

    if (firstUnansweredIndex !== -1) {
      setCurrentQuestionIndex(firstUnansweredIndex);
      alert(`Please answer question ${firstUnansweredIndex + 1} before submitting.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        session_id: Number(resolvedSessionId),
        exam_id: Number(examId),
        answers: questions.map((_, index) => ({
          question_index: index,
          answer: String(answers[index] ?? "").trim(),
        })),
      };

      const response = await fetch(`${apiBaseUrl}/exam/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = await response.json();

      if (!data.attempt_id) {
        throw new Error("Submit response did not include attempt_id.");
      }

      sessionStorage.setItem(
        `lecta_attempt_${data.attempt_id}`,
        JSON.stringify(data),
      );

      window.location.href = `/match-exam/attempts/${data.attempt_id}`;
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Submit failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <ExamLayout>
        <div className="frost rounded-[28px] p-7">
          <div className="pill">
            <span className="pill-dot" />
            Loading
          </div>
          <p className="section-copy mt-4">Loading exam questions...</p>
        </div>
      </ExamLayout>
    );
  }

  if (!currentQuestion || questions.length === 0) {
    return (
      <ExamLayout>
        <div className="frost rounded-[28px] p-7">
          <div className="pill">
            <span className="pill-dot" />
            Empty exam
          </div>
          <h1 className="section-title mt-5">No questions found.</h1>
          <p className="section-copy mt-4">
            The exam loaded, but no questions were found in the response.
          </p>
        </div>
      </ExamLayout>
    );
  }

  const questionText =
    currentQuestion.question ??
    currentQuestion.question_text ??
    "Untitled question";

  const choices = currentQuestion.choices ?? currentQuestion.options ?? [];

  return (
    <ExamLayout>
      <div className="mb-6 frost rounded-[28px] p-7">
        <div className="pill">
          <span className="pill-dot" />
          Exam session
        </div>

        <h1 className="section-title mt-5">Match Exam</h1>

        <p className="section-copy mt-4 max-w-2xl">
          Answer all questions before submitting. Missing answers will be highlighted.
        </p>

        <div className="mt-5 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-[var(--brand)] w-fit">
          {answeredQuestionIndexes.length}/{questions.length} answered
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <QuestionCard
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            questionText={questionText}
            questionType={currentQuestion.type ?? "Practice question"}
          >
            {choices.length > 0 ? (
              <div className="grid gap-3">
                {choices.map((choice, index) => (
                  <button
                    key={`${choice}-${index}`}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [currentQuestionIndex]: choice,
                      }))
                    }
                    className={`rounded-[20px] border p-4 text-left text-sm font-semibold transition ${
                      answers[currentQuestionIndex] === choice
                        ? "border-[var(--brand)] bg-blue-50 text-[var(--brand)]"
                        : "border-[var(--rule)] bg-white/70 text-[var(--ink)] hover:bg-white"
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            ) : (
              <AnswerInput
                value={answers[currentQuestionIndex] ?? ""}
                onChange={(value) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestionIndex]: value,
                  }))
                }
              />
            )}

            {!isAnswered(answers[currentQuestionIndex]) ? (
              <div className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-800">
                  This question is not answered yet.
                </p>
              </div>
            ) : null}
          </QuestionCard>
        </div>

        <div className="space-y-4">
          <QuestionNavigator
            totalQuestions={questions.length}
            currentQuestionIndex={currentQuestionIndex}
            answeredQuestionIndexes={answeredQuestionIndexes}
            onQuestionChange={setCurrentQuestionIndex}
          />

          {unansweredIndexes.length > 0 ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                Missing answers
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                {unansweredIndexes.length} question
                {unansweredIndexes.length === 1 ? "" : "s"} still need an answer.
              </p>
            </div>
          ) : (
            <div className="rounded-[24px] border border-green-200 bg-green-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">
                Ready to submit
              </p>
              <p className="mt-2 text-sm leading-6 text-green-800">
                All questions are answered.
              </p>
            </div>
          )}
        </div>
      </div>

      <ExamFooterBar
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </ExamLayout>
  );
}