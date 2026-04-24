"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ProcessingView } from "@/features/match-exam/components/ProcessingView";
import {
  generateExam,
  getMatchExamJob,
  type GenerateExamOptions,
} from "@/lib/api/match-exam";

type JobApiResponse = {
  status?: "pending" | "processing" | "completed" | "failed";
  progress_stage?: string;
  is_ready_for_exam_generation?: boolean;
  error_message?: string | null;
};

type TimelineStage = {
  key: string;
  label: string;
  status: "done" | "active" | "upcoming";
};

const STAGE_ORDER = [
  { key: "queued", label: "Queued" },
  { key: "parsing_files", label: "Parsing files" },
  { key: "processing_content", label: "Processing content" },
  { key: "ready_for_exam_generation", label: "Ready for exam generation" },
  { key: "generating_exam", label: "Generating final exam" },
] as const;

function normalizeProgressStage(stage?: string | null): string {
  if (!stage) return "queued";

  const value = stage.trim().toLowerCase();

  if (["queued", "pending", "queue"].includes(value)) return "queued";
  if (["parsing_files", "parsing", "parse_files"].includes(value)) {
    return "parsing_files";
  }
  if (
    [
      "processing_content",
      "processing",
      "embedding_lecture",
      "embedding_previous_exam",
      "analyzing_content",
      "analyzing_exam_style",
    ].includes(value)
  ) {
    return "processing_content";
  }
  if (["ready_for_exam_generation", "completed"].includes(value)) {
    return "ready_for_exam_generation";
  }
  if (["generating_exam", "generating_final_exam"].includes(value)) {
    return "generating_exam";
  }

  return "processing_content";
}

function getStageLabel(stage: string): string {
  switch (stage) {
    case "queued":
      return "Queued for processing";
    case "parsing_files":
      return "Parsing uploaded files";
    case "processing_content":
      return "Processing content and exam signals";
    case "ready_for_exam_generation":
      return "Ready for exam generation";
    case "generating_exam":
      return "Generating final exam";
    default:
      return "Processing your files";
  }
}

function getProgressLabel(stage: string, status?: JobApiResponse["status"]): string {
  if (status === "failed") return "The processing job failed.";

  switch (stage) {
    case "queued":
      return "Your files are in queue and will begin processing shortly.";
    case "parsing_files":
      return "We are reading the uploaded files and preparing them for analysis.";
    case "processing_content":
      return "We are analyzing the lecture content and previous exam patterns.";
    case "ready_for_exam_generation":
      return "Processing is complete. The exam generation step is ready.";
    case "generating_exam":
      return "We are generating the final grounded exam now.";
    default:
      return "Preparing the next step...";
  }
}

function getProgressValue(stage: string, isReady: boolean): number {
  if (isReady) return 100;

  switch (stage) {
    case "queued":
      return 10;
    case "parsing_files":
      return 30;
    case "processing_content":
      return 65;
    case "ready_for_exam_generation":
      return 90;
    case "generating_exam":
      return 96;
    default:
      return 0;
  }
}

function buildTimelineStages(
  currentStage: string,
  isReady: boolean,
  isGeneratingExam: boolean,
): TimelineStage[] {
  const activeKey = isGeneratingExam
    ? "generating_exam"
    : isReady
      ? "ready_for_exam_generation"
      : currentStage;

  const activeIndex = STAGE_ORDER.findIndex((stage) => stage.key === activeKey);

  return STAGE_ORDER.map((stage, index) => {
    let status: TimelineStage["status"] = "upcoming";
    if (index < activeIndex) status = "done";
    if (index === activeIndex) status = "active";

    return {
      key: stage.key,
      label: stage.label,
      status,
    };
  });
}

function getStoredGenerateConfig(sessionId: number): GenerateExamOptions {
  if (typeof window === "undefined") {
    return { question_count: 10, language: "english" };
  }

  const raw = sessionStorage.getItem(`match-exam-config:${sessionId}`);
  if (!raw) {
    return { question_count: 10, language: "english" };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      question_count:
        typeof parsed?.question_count === "number" && parsed.question_count > 0
          ? parsed.question_count
          : 10,
      language: parsed?.language === "arabic" ? "arabic" : "english",
    };
  } catch {
    return { question_count: 10, language: "english" };
  }
}

function ErrorState({
  title,
  message,
  primaryHref,
  primaryLabel,
  secondaryHref = "/dashboard",
  secondaryLabel = "Back to dashboard",
}: {
  title: string;
  message: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="mx-auto w-[min(1280px,calc(100%-40px))] py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <div className="space-y-4">
          <div className="inline-flex rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-700">
            Processing unavailable
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {message}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={primaryHref}
              className="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
            >
              {primaryLabel}
            </a>
            <a
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-accent"
            >
              {secondaryLabel}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function MatchExamJobPageInner() {
  const router = useRouter();
  const params = useParams<{ jobId: string }>();
  const searchParams = useSearchParams();

  const jobId = params?.jobId ?? "";
  const sessionIdParam = searchParams.get("sessionId");
  const sessionId = sessionIdParam ? Number(sessionIdParam) : NaN;

  const [job, setJob] = useState<JobApiResponse | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);

  const generateStartedRef = useRef(false);
  const pollTimeoutRef = useRef<number | null>(null);

  const normalizedStage = normalizeProgressStage(job?.progress_stage);
  const isReady = Boolean(job?.is_ready_for_exam_generation);
  const stageLabel = getStageLabel(
    isGeneratingExam ? "generating_exam" : normalizedStage,
  );
  const progressLabel = pageError
    ? pageError
    : isGeneratingExam
      ? "The files are ready. We are generating the final exam now."
      : getProgressLabel(normalizedStage, job?.status);
  const progressValue = pageError
    ? 100
    : isGeneratingExam
      ? 98
      : getProgressValue(normalizedStage, isReady);

  const stages = useMemo(
    () => buildTimelineStages(normalizedStage, isReady, isGeneratingExam),
    [normalizedStage, isReady, isGeneratingExam],
  );

  useEffect(() => {
    if (!jobId) return;
    if (!Number.isFinite(sessionId)) {
      setPageError("Missing sessionId in URL. Please create the Match Exam again.");
      return;
    }

    let cancelled = false;

    const clearTimer = () => {
      if (pollTimeoutRef.current !== null) {
        window.clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };

    const scheduleNextPoll = () => {
      clearTimer();
      pollTimeoutRef.current = window.setTimeout(() => {
        void poll();
      }, 2500);
    };

    const poll = async () => {
      try {
        const response = (await getMatchExamJob(jobId)) as JobApiResponse;
        if (cancelled) return;

        setJob(response);
        setPageError(null);

        if (response.status === "failed") {
          setPageError(response.error_message || "The processing job failed.");
          return;
        }

        if (response.is_ready_for_exam_generation) {
          if (generateStartedRef.current) return;

          generateStartedRef.current = true;
          setIsGeneratingExam(true);

          try {
            const config = getStoredGenerateConfig(sessionId);
            const examResponse = await generateExam(sessionId, config);
            if (cancelled) return;
            router.replace(`/match-exam/exams/${examResponse.exam_id}`);
            return;
          } catch (error) {
            if (cancelled) return;
            generateStartedRef.current = false;
            setIsGeneratingExam(false);

            const message =
              error instanceof Error
                ? error.message
                : "Failed to generate the exam after processing completed.";

            setPageError(message);
            scheduleNextPoll();
            return;
          }
        }

        scheduleNextPoll();
      } catch (error) {
        if (cancelled) return;

        const message =
          error instanceof Error ? error.message : "Failed to fetch job status.";
        setPageError(message);
        scheduleNextPoll();
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (pollTimeoutRef.current !== null) {
        window.clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [jobId, router, sessionId]);

  if (!jobId) {
    return (
      <ErrorState
        title="Missing job ID"
        message="This processing page was opened without a valid job ID."
        primaryHref="/match-exam/new"
        primaryLabel="Create new Match Exam"
      />
    );
  }

  if (!Number.isFinite(sessionId)) {
    return (
      <ErrorState
        title="Missing session information"
        message="We could not find the required sessionId in the page URL, so final exam generation cannot continue."
        primaryHref="/match-exam/new"
        primaryLabel="Create new Match Exam"
      />
    );
  }

  return (
    <div>
      {pageError && (
        <div
          style={{
            width: "min(1280px, calc(100% - 40px))",
            margin: "24px auto 0",
            borderRadius: 20,
            border: "1px solid #fecaca",
            background: "#fef2f2",
            padding: "14px 16px",
            color: "#b91c1c",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {pageError}
        </div>
      )}

      <ProcessingView
  title="Generating your exam..."
  description="Analyzing lecture and previous exam to build a realistic test."
/>
    </div>
  );
}

export default function MatchExamJobPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-[min(1280px,calc(100%-40px))] py-10">
          <div className="text-center text-sm text-gray-400">Loading…</div>
        </div>
      }
    >
      <MatchExamJobPageInner />
    </Suspense>
  );
}