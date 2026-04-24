import { QuestionReviewItem } from "@/features/match-exam/components/QuestionReviewItem";
import type { AttemptData } from "@/lib/api/match-exam";

type ResultsSummaryProps = {
  attempt: AttemptData;
};

function getPerformanceLabel(percentage: number) {
  if (percentage >= 85) return "Excellent";
  if (percentage >= 70) return "Strong";
  if (percentage >= 50) return "Needs improvement";
  return "Needs work";
}

export function ResultsSummary({ attempt }: ResultsSummaryProps) {
  const percentage =
    attempt.totalMarks > 0
      ? Math.round((attempt.score / attempt.totalMarks) * 100)
      : Math.round(attempt.accuracy);

  const correctCount = attempt.reviews.filter((review) => review.isCorrect).length;
  const incorrectCount = attempt.reviews.length - correctCount;
  const performanceLabel = getPerformanceLabel(percentage);

  return (
    <section className="space-y-7">
      <div className="frost rounded-[28px] p-7 md:p-9">
        <div className="pill">
          <span className="pill-dot" />
          Attempt results
        </div>

        <h1 className="section-title mt-5 !text-[clamp(38px,5vw,68px)]">
          Your result is <em>{performanceLabel.toLowerCase()}</em>.
        </h1>

        <p className="section-copy mt-4 max-w-3xl">
          A score alone is not enough. Review your performance, inspect weak
          areas, and use the explanations below to decide what to study next.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-[var(--rule)] bg-white/65 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
              Score
            </p>
            <p className="stat-value mt-3">
              {attempt.score}/{attempt.totalMarks}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--rule)] bg-white/65 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
              Accuracy
            </p>
            <p className="stat-value mt-3">{percentage}%</p>
          </div>

          <div className="rounded-[24px] border border-[var(--rule)] bg-white/65 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
              Correct
            </p>
            <p className="stat-value mt-3">{correctCount}</p>
          </div>

          <div className="rounded-[24px] border border-[var(--rule)] bg-white/65 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
              Incorrect
            </p>
            <p className="stat-value mt-3">{incorrectCount}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-blue-600/10 bg-blue-50/70 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
            Performance summary
          </p>

          <p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">
            <strong className="text-[var(--ink)]">{performanceLabel}.</strong>{" "}
            {attempt.performanceSummary}
            {attempt.encouragement ? ` ${attempt.encouragement}` : ""}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-5">
          <div className="pill">
            <span className="pill-dot" />
            Question review
          </div>

          <h2 className="section-title mt-4 !text-[clamp(30px,4vw,48px)]">
            Review every answer clearly.
          </h2>

          <p className="section-copy mt-3 max-w-3xl">
            Compare your answer to the correct one and use the explanations to
            understand where the reasoning broke down.
          </p>
        </div>

        <div className="space-y-4">
          {attempt.reviews.map((review, index) => (
            <QuestionReviewItem
              key={review.questionId}
              questionNumber={index + 1}
              status={review.isCorrect ? "correct" : "incorrect"}
              question={review.question}
              userAnswer={review.userAnswer}
              correctAnswer={review.correctAnswer}
              explanation={review.explanation}
              awardedScore={review.awardedScore}
              maxScore={review.maxScore}
              weakTopicTags={review.weakTopicTags}
            />
          ))}
        </div>
      </div>
    </section>
  );
}