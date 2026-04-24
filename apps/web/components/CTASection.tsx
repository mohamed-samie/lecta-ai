import Link from "next/link";

type CTASectionProps = {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
};

export default function CTASection({
  title,
  description,
  buttonText,
  buttonLink,
}: CTASectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-gray-950 px-8 py-14 text-center shadow-2xl shadow-blue-950/10 md:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(80,120,255,0.38),transparent_36rem)]" />

        <div className="relative z-10">
          <h2 className="font-serif text-4xl font-normal tracking-tight text-white md:text-5xl">
            {title}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-300 md:text-base">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={buttonLink} className="btn-primary">
              {buttonText}
            </Link>

            <Link href="/dashboard" className="btn-secondary !text-white">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}