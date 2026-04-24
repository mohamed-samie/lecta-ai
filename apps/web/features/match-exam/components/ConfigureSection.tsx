type ConfigureSectionProps = {
  questionCount?: number;
  language?: string;
  onQuestionCountChange?: (value: number) => void;
  onLanguageChange?: (value: string) => void;
};

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20];

const LANGUAGE_OPTIONS = [
  { value: "english", label: "English" },
  { value: "arabic", label: "Arabic" },
];

export function ConfigureSection({
  questionCount = 10,
  language = "english",
  onQuestionCountChange,
  onLanguageChange,
}: ConfigureSectionProps) {
  const selectedLanguage =
    LANGUAGE_OPTIONS.find((item) => item.value === language)?.label ?? "English";

  return (
    <section className="frost rounded-[28px] p-7">
      <div className="pill">
        <span className="pill-dot" />
        Step 2 · Configure
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="section-title !text-[clamp(30px,3.8vw,48px)]">
            Tune the exam before generation.
          </h2>

          <p className="section-copy mt-4">
            Choose the size and language so the practice session fits your study
            time and course context.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[24px] border border-[var(--rule)] bg-white/65 p-5">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
              Question count
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              {QUESTION_COUNT_OPTIONS.map((count) => {
                const isActive = questionCount === count;

                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => onQuestionCountChange?.(count)}
                    className={`rounded-full px-5 py-3 text-sm font-bold transition ${
                      isActive
                        ? "bg-[var(--brand)] text-white shadow-[0_12px_28px_var(--brand-glow)]"
                        : "border border-[var(--rule)] bg-white/70 text-[var(--ink)] hover:bg-white"
                    }`}
                  >
                    {count} questions
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--rule)] bg-white/65 p-5">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
              Language
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              {LANGUAGE_OPTIONS.map((option) => {
                const isActive = language === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onLanguageChange?.(option.value)}
                    className={`rounded-full px-5 py-3 text-sm font-bold transition ${
                      isActive
                        ? "bg-[var(--brand)] text-white shadow-[0_12px_28px_var(--brand-glow)]"
                        : "border border-[var(--rule)] bg-white/70 text-[var(--ink)] hover:bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[22px] border border-blue-600/10 bg-blue-50/70 p-5">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
              Current setup
            </div>

            <p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">
              The next generated exam will use{" "}
              <strong className="text-[var(--ink)]">{questionCount} questions</strong>{" "}
              in <strong className="text-[var(--ink)]">{selectedLanguage}</strong>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}