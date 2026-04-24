type ProcessingViewProps = {
  title?: string;
  description?: string;
};

const processingSteps = [
  {
    title: "Reading files",
    description: "Lecta is extracting the useful academic content.",
  },
  {
    title: "Finding exam signals",
    description: "The system is checking structure, tone, and question style.",
  },
  {
    title: "Building your exam",
    description: "A grounded Match Exam is being prepared for solving.",
  },
];

export function ProcessingView({
  title = "Generating your Match Exam...",
  description = "Lecta is analyzing your files, extracting exam signals, and building a grounded practice experience.",
}: ProcessingViewProps) {
  return (
    <section className="frost rounded-[28px] p-7 md:p-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-200 border-t-[var(--brand)]" />
        </div>

        <div className="pill mt-7">
          <span className="pill-dot" />
          Processing
        </div>

        <h2 className="section-title mt-5 !text-[clamp(34px,4.5vw,56px)]">
          {title}
        </h2>

        <p className="section-copy mt-4 max-w-2xl">
          {description}
        </p>
      </div>

      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {processingSteps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-[24px] border border-[var(--rule)] bg-white/65 p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-soft)] text-sm font-bold text-[var(--brand)]">
              {index + 1}
            </div>

            <h3 className="mt-4 text-base font-bold text-[var(--ink)]">
              {step.title}
            </h3>

            <p className="mt-2 text-sm leading-7 text-[var(--ink-3)]">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-7 overflow-hidden rounded-full bg-slate-200">
        <div className="h-2 w-2/3 animate-pulse rounded-full bg-[var(--brand)]" />
      </div>
    </section>
  );
}