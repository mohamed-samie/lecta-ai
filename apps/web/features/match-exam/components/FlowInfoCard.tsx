export function FlowInfoCard() {
  const steps = [
    {
      title: "Upload",
      description: "Add your lecture and previous exam.",
    },
    {
      title: "Analyze",
      description: "Lecta reads topics and exam style.",
    },
    {
      title: "Generate",
      description: "Create a grounded Match Exam.",
    },
    {
      title: "Review",
      description: "Turn mistakes into revision guidance.",
    },
  ];

  return (
    <aside className="frost rounded-[28px] p-6">
      <div className="pill">
        <span className="pill-dot" />
        Workflow
      </div>

      <h2 className="font-display mt-5 text-[42px] font-normal leading-[0.96] tracking-[-0.04em] text-[var(--ink)]">
        From files to <em className="text-[var(--ink-2)]">focused revision</em>.
      </h2>

      <p className="section-copy mt-4">
        A clear academic workflow from upload to exam practice.
      </p>

      <div className="mt-7 space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="group rounded-[22px] border border-[var(--rule)] bg-white/65 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_50px_rgba(18,24,38,0.06)]"
          >
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)] text-sm font-bold text-white shadow-[0_10px_24px_var(--brand-glow)]">
                {index + 1}
              </div>

              <div>
                <p className="text-sm font-bold text-[var(--ink)]">
                  {step.title}
                </p>

                <p className="mt-1 text-sm leading-6 text-[var(--ink-3)]">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[22px] border border-blue-600/10 bg-blue-50/70 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
          Better inputs, better exam
        </p>

        <p className="mt-2 text-sm leading-6 text-[var(--ink-2)]">
          A good previous exam helps Lecta match your professor’s question style.
        </p>
      </div>
    </aside>
  );
}