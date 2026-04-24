type Feature = {
  title: string;
  description: string;
};

type FeatureSectionProps = {
  features: Feature[];
};

export default function FeatureSection({ features }: FeatureSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20" id="product">
      <div className="section-kicker">Product Highlights</div>

      <div className="grid gap-5 md:grid-cols-3">
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className="glass-card rounded-[28px] p-6 transition duration-200 hover:-translate-y-1"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/10 text-sm font-bold text-blue-700">
              0{index + 1}
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-gray-950">
              {feature.title}
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}