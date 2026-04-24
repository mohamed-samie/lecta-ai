type AnswerInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function AnswerInput({
  value,
  onChange,
  placeholder = "Write your answer here...",
}: AnswerInputProps) {
  return (
    <div className="frost rounded-[28px] p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
          Your Answer
        </p>

        <span className="text-xs text-[var(--ink-3)]">
          {value.length} characters
        </span>
      </div>

      <div className="mt-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none rounded-[20px] border border-[var(--rule)] bg-white/70 p-4 text-sm leading-7 text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          rows={6}
        />
      </div>

      <div className="mt-5 rounded-[20px] border border-blue-600/10 bg-blue-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">
          Tip
        </p>

        <p className="mt-2 text-sm leading-6 text-[var(--ink-2)]">
          Answer as if you are in a real exam. Keep it structured and clear.
        </p>
      </div>
    </div>
  );
}