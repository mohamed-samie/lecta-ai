type QuestionReviewItemProps = {
  questionNumber: number;
  status: "correct" | "incorrect";
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  awardedScore?: number;
  maxScore?: number;
  weakTopicTags?: string[];
};

export function QuestionReviewItem({
  questionNumber,
  status,
  question,
  userAnswer,
  correctAnswer,
  explanation,
  awardedScore,
  maxScore,
  weakTopicTags = [],
}: QuestionReviewItemProps) {
  const isCorrect = status === "correct";

  return (
    <article className="frost rounded-[26px] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--rule)] bg-white/60 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
            Question {questionNumber}
          </span>

          {typeof awardedScore === "number" && typeof maxScore === "number" ? (
            <span className="rounded-full border border-[var(--rule)] bg-white/70 px-3 py-2 text-xs font-bold text-[var(--ink-2)]">
              {awardedScore}/{maxScore} marks
            </span>
          ) : null}
        </div>

        <span
          className={`rounded-full px-3 py-2 text-xs font-bold ${
            isCorrect
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {isCorrect ? "Correct" : "Incorrect"}
        </span>
      </div>

      <div className="mt-5 rounded-[22px] border border-[var(--rule)] bg-white/65 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
          Question
        </p>

        <p className="mt-2 text-base font-semibold leading-8 text-[var(--ink)]">
          {question}
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[22px] border border-[var(--rule)] bg-white/65 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
            Your answer
          </p>

          <p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">
            {userAnswer || "No answer submitted."}
          </p>
        </div>

        <div className="rounded-[22px] border border-green-200 bg-green-50/80 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">
            Correct answer
          </p>

          <p className="mt-2 text-sm leading-7 text-green-900">
            {correctAnswer}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-blue-600/10 bg-blue-50/70 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
          Explanation
        </p>

        <p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">
          {explanation}
        </p>
      </div>

      {weakTopicTags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {weakTopicTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}