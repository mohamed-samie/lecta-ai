type FAQ = {
  question: string;
  answer: string;
};

type FAQSectionProps = {
  faqs: FAQ[];
};

export default function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="section-kicker">FAQ</div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="glass-card group rounded-[24px] px-6 py-5"
          >
            <summary className="cursor-pointer list-none text-base font-semibold text-gray-950">
              {faq.question}
            </summary>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}