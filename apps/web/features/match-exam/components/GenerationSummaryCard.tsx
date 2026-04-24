type GenerationSummaryCardProps = {
  lectureFile: File | null;
  previousExamFile: File | null;
  isReady: boolean;
  isSubmitting: boolean;
  onGenerate: () => void;
};

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function GenerationSummaryCard({
  lectureFile,
  previousExamFile,
  isReady,
  isSubmitting,
  onGenerate,
}: GenerationSummaryCardProps) {
  const files = [
    {
      label: "Lecture file",
      file: lectureFile,
    },
    {
      label: "Previous exam",
      file: previousExamFile,
    },
  ];

  return (
    <section className="frost rounded-[28px] p-7">
      <div className="pill">
        <span className="pill-dot" />
        Step 3 · Generate
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <h2 className="section-title !text-[clamp(30px,3.8vw,48px)]">
            Ready to generate your Match Exam?
          </h2>

          <p className="section-copy mt-4">
            Review your setup before Lecta turns your materials into a grounded
            practice exam.
          </p>
        </div>

        <div className="space-y-4">
          {files.map((item) => {
            const hasFile = Boolean(item.file);

            return (
              <div
                key={item.label}
                className="rounded-[24px] border border-[var(--rule)] bg-white/65 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
                      {item.label}
                    </p>

                    <p className="mt-2 break-words text-sm font-bold leading-6 text-[var(--ink)]">
                      {item.file ? item.file.name : "Not selected yet"}
                    </p>

                    <p className="mt-1 text-sm text-[var(--ink-3)]">
                      {item.file
                        ? formatFileSize(item.file.size)
                        : "Required before generation"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      hasFile
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {hasFile ? "Ready" : "Missing"}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="rounded-[24px] border border-blue-600/10 bg-blue-50/70 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
              Generation status
            </p>

            <p className="mt-2 text-sm leading-7 text-[var(--ink-2)]">
              {isReady
                ? "Both files are ready. Start generation to create your practice exam."
                : "Upload the lecture and previous exam before generating."}
            </p>

            <button
              type="button"
              onClick={onGenerate}
              disabled={!isReady || isSubmitting}
              className={`mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 text-sm font-bold transition ${
                isReady && !isSubmitting
                  ? "bg-[var(--brand)] text-white shadow-[0_12px_28px_var(--brand-glow)] hover:-translate-y-0.5"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              {isSubmitting ? "Generating..." : "Generate Match Exam"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}