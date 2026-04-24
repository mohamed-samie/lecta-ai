type ExamFooterBarProps = {
  currentQuestionIndex: number;
  totalQuestions: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

export function ExamFooterBar({
  currentQuestionIndex,
  totalQuestions,
  onNext,
  onPrev,
  onSubmit,
  isSubmitting = false,
}: ExamFooterBarProps) {
  const isFirst = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--rule)] bg-white/72 backdrop-blur-xl">
      <div className="container flex items-center justify-between gap-4 py-4">
        <div className="hidden sm:block">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
            Progress
          </p>

          <p className="mt-1 text-sm font-bold text-[var(--ink)]">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
        </div>

        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 sm:max-w-xs">
          <div
            className="h-full rounded-full bg-[var(--brand)] transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className={`rounded-full px-5 py-3 text-sm font-bold transition ${
              isFirst
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "border border-[var(--rule)] bg-white/70 text-[var(--ink)] hover:-translate-y-0.5 hover:bg-white"
            }`}
          >
            Previous
          </button>

          {!isLast ? (
            <button
              type="button"
              onClick={onNext}
              className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_var(--brand-glow)] transition hover:-translate-y-0.5"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`rounded-full px-6 py-3 text-sm font-bold transition ${
                isSubmitting
                  ? "cursor-not-allowed bg-slate-300 text-slate-500"
                  : "bg-green-600 text-white shadow-[0_12px_28px_rgba(22,163,74,0.22)] hover:-translate-y-0.5"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}