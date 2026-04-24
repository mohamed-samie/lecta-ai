import type { ReactNode } from "react";

type QuestionCardProps = {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  questionType?: string;
  children?: ReactNode;
};

export function QuestionCard({
  questionNumber,
  totalQuestions,
  questionText,
  questionType = "Practice question",
  children,
}: QuestionCardProps) {
  return (
    <section className="frost rounded-[28px] p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="pill">
          <span className="pill-dot" />
          Question {questionNumber} of {totalQuestions}
        </div>

        <span className="rounded-full border border-[var(--rule)] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">
          {questionType}
        </span>
      </div>

      <div className="mt-7 rounded-[24px] border border-[var(--rule)] bg-white/70 p-6">
        <p className="text-xl font-semibold leading-9 text-[var(--ink)]">
          {questionText}
        </p>
      </div>

      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}