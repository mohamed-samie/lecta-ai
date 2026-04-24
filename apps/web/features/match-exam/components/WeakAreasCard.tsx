type WeakAreasCardProps = {
  weakAreas?: string[];
};

export function WeakAreasCard({ weakAreas = [] }: WeakAreasCardProps) {
  return (
    <section className="frost rounded-[28px] p-7">
      <div className="pill">
        <span className="pill-dot" />
        Weak areas
      </div>

      <h2 className="section-title mt-5 !text-[clamp(30px,3.6vw,46px)]">
        Topics that need more attention.
      </h2>

      <p className="section-copy mt-4">
        These are the areas that appeared most often in your mistakes or weaker
        answers.
      </p>

      <div className="mt-6 grid gap-3">
        {weakAreas.length > 0 ? (
          weakAreas.map((area, index) => (
            <div
              key={`${area}-${index}`}
              className="rounded-[24px] border border-[var(--rule)] bg-white/65 p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-sm font-bold text-amber-700">
                  {index + 1}
                </div>

                <div>
                  <p className="text-base font-bold text-[var(--ink)]">
                    {area}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[var(--ink-3)]">
                    Revisit this topic before your next practice attempt.
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-green-200 bg-green-50 p-5">
            <p className="text-sm font-bold text-green-700">
              No major weak areas detected.
            </p>

            <p className="mt-2 text-sm leading-6 text-green-800">
              Keep practicing to confirm consistency across more questions.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}