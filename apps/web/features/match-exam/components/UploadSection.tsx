"use client";

type UploadSectionProps = {
  lectureFile: File | null;
  previousExamFile: File | null;
  onLectureFileChange: (file: File | null) => void;
  onPreviousExamFileChange: (file: File | null) => void;
};

function FileCard({
  label,
  description,
  file,
  onChange,
}: {
  label: string;
  description: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--rule)] bg-white/70 p-5">
      {/* Title */}
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
          {label}
        </p>
        <p className="mt-2 text-sm text-[var(--ink-3)] leading-6">
          {description}
        </p>
      </div>

      {/* Upload Area */}
      <label className="group flex cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[var(--rule)] bg-white/60 p-6 text-center transition hover:border-[var(--brand)] hover:bg-white">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-[var(--brand)] transition group-hover:bg-blue-100">
  ↑
</div>

        <span className="text-sm font-semibold text-[var(--ink)]">
          {file ? file.name : "Click to upload"}
        </span>

        <span className="mt-1 text-xs text-[var(--ink-3)]">
          PDF, DOC, DOCX
        </span>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0] ?? null;
            onChange(selected);
          }}
        />
      </label>

      {/* File selected state */}
      {file && (
        <div className="mt-4 flex items-center justify-between rounded-[16px] border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-semibold text-green-700 truncate">
            {file.name}
          </p>

          <button
            onClick={() => onChange(null)}
            className="text-xs font-bold text-red-500 hover:underline"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

export function UploadSection({
  lectureFile,
  previousExamFile,
  onLectureFileChange,
  onPreviousExamFileChange,
}: UploadSectionProps) {
  return (
    <section className="space-y-6">
      <div className="pill">
        <span className="pill-dot" />
        Upload materials
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FileCard
          label="Lecture file"
          description="Upload your lecture slides, notes, or textbook chapters."
          file={lectureFile}
          onChange={onLectureFileChange}
        />

        <FileCard
          label="Previous exam"
          description="Upload a past exam so Lecta learns the question style."
          file={previousExamFile}
          onChange={onPreviousExamFileChange}
        />
      </div>
    </section>
  );
}