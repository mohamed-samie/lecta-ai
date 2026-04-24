type Testimonial = {
  name: string;
  feedback: string;
  meta?: string;
};

type TestimonialsSectionProps = {
  testimonials: Testimonial[];
};

export default function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12" id="how-it-works">
      <div className="section-kicker">Student Voices</div>

      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <article key={item.name} className="glass-card rounded-[28px] p-6">
            <p className="text-sm leading-7 text-gray-700">
              &ldquo;{item.feedback}&rdquo;
            </p>

            <div className="mt-6 border-t border-gray-900/10 pt-4">
              <p className="text-sm font-semibold text-gray-950">{item.name}</p>
              {item.meta ? (
                <p className="mt-1 text-xs text-gray-500">{item.meta}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}