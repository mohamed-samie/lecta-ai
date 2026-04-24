type QuestionNavigatorProps = {
  totalQuestions: number;
  currentQuestionIndex: number;
  answeredQuestionIndexes?: number[];
  onQuestionChange: (index: number) => void;
};

export function QuestionNavigator({
  totalQuestions,
  currentQuestionIndex,
  answeredQuestionIndexes = [],
  onQuestionChange,
}: QuestionNavigatorProps) {
  return (
    <aside className="frost rounded-[28px] p-6">
      <div className="pill">
        <span className="pill-dot" />
        Navigator
      </div>

      <p className="section-copy mt-4">
        Move between questions and track your progress.
      </p>

      <div className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-4">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const isActive = index === currentQuestionIndex;
          const isAnswered = answeredQuestionIndexes.includes(index);

          return (
            <button
              key={index}
              type="button"
              onClick={() => onQuestionChange(index)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition ${
                isActive
                  ? "bg-[var(--brand)] text-white shadow-[0_12px_28px_var(--brand-glow)]"
                  : isAnswered
                    ? "bg-green-50 text-green-700 ring-1 ring-green-200 hover:bg-green-100"
                    : "bg-white/70 text-[var(--ink-3)] ring-1 ring-[var(--rule)] hover:bg-white hover:text-[var(--ink)]"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-2 text-xs font-semibold text-[var(--ink-3)]">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[var(--brand)]" />
          Current question
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-100 ring-1 ring-green-200" />
          Answered
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-white ring-1 ring-[var(--rule)]" />
          Not answered yet
        </div>
      </div>
    </aside>
  );
}