type StudyNextCardProps = {
  items?: string[];
};

export function StudyNextCard({ items = [] }: StudyNextCardProps) {
  return (
    <section className="frost rounded-[28px] p-7">
      <div className="pill">
        <span className="pill-dot" />
        Study next
      </div>

      <h2 className="section-title mt-5 !text-[clamp(30px,3.6vw,46px)]">
        What to revise next.
      </h2>

      <p className="section-copy mt-4">
        Use this as your short revision checklist before generating another
        Match Exam.
      </p>

      <div className="mt-6 grid gap-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-[24px] border border-[var(--rule)] bg-white/65 p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-[var(--brand)]">
                  {index + 1}
                </div>

                <p className="text-sm leading-7 text-[var(--ink-2)]">
                  {item}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-blue-600/10 bg-blue-50/70 p-5">
            <p className="text-sm font-bold text-[var(--ink)]">
              No specific study-next actions yet.
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--ink-3)]">
              Review the question explanations below and generate another exam
              after revising.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}