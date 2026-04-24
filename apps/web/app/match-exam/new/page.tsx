"use client";

import Link from "next/link";
import { useState } from "react";

import { ConfigureSection } from "../../../features/match-exam/components/ConfigureSection";
import { FlowInfoCard } from "../../../features/match-exam/components/FlowInfoCard";
import { GenerationSummaryCard } from "../../../features/match-exam/components/GenerationSummaryCard";
import { ProcessingView } from "../../../features/match-exam/components/ProcessingView";
import { UploadSection } from "../../../features/match-exam/components/UploadSection";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readApiError(response: Response) {
  const text = await response.text();

  try {
    const json = JSON.parse(text);
    return typeof json.detail === "string"
      ? json.detail
      : JSON.stringify(json.detail ?? json, null, 2);
  } catch {
    return text || `Request failed with status ${response.status}`;
  }
}

export default function NewMatchExamPage() {
  const [lectureFile, setLectureFile] = useState<File | null>(null);
  const [previousExamFile, setPreviousExamFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [language, setLanguage] = useState("english");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);

  const isReady = Boolean(lectureFile && previousExamFile);

  async function handleGenerate() {
    if (!lectureFile || !previousExamFile || isSubmitting) return;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      alert("NEXT_PUBLIC_API_BASE_URL is not defined");
      return;
    }

    setIsSubmitting(true);
    setProcessingMessage("Uploading your files...");

    try {
      // ✅ STEP 1: CREATE SESSION (correct fields)
      const formData = new FormData();

      formData.append(
        "title",
        lectureFile.name.replace(/\.[^/.]+$/, "")
      );
      formData.append("lecture_file", lectureFile);
      formData.append("previous_exam_file", previousExamFile);

      const createResponse = await fetch(
        `${apiBaseUrl}/match-exam/create`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!createResponse.ok) {
        throw new Error(await readApiError(createResponse));
      }

      const created = await createResponse.json();
      const sessionId = created.session_id;
      const jobId = created.job_id;

      if (!sessionId || !jobId) {
        throw new Error("Invalid create response");
      }

      // ✅ STEP 2: POLL JOB
      setProcessingMessage("Processing files...");

      let job;

      for (let i = 0; i < 60; i++) {
        const jobRes = await fetch(`${apiBaseUrl}/jobs/${jobId}`);

        if (!jobRes.ok) {
          throw new Error(await readApiError(jobRes));
        }

        job = await jobRes.json();

        if (job.status === "failed") {
          throw new Error("Processing failed");
        }

        if (
          job.is_ready_for_exam_generation ||
          job.progress_stage === "ready_for_exam_generation"
        ) {
          break;
        }

        setProcessingMessage(
          `Processing... ${job.progress_stage || ""}`
        );

        await sleep(2000);
      }

      // ✅ STEP 3: GENERATE (correct body, no options nesting)
      setProcessingMessage("Generating exam...");

      const generateResponse = await fetch(
        `${apiBaseUrl}/exam/generate?session_id=${sessionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question_count: questionCount,
            language: language,
          }),
        }
      );

      if (!generateResponse.ok) {
        throw new Error(await readApiError(generateResponse));
      }

      const generated = await generateResponse.json();
      const examId = generated.exam_id;

      if (!examId) {
        throw new Error("No exam_id returned");
      }

      // ✅ STEP 4: NAVIGATE
      window.location.href = `/match-exam/exams/${examId}?session_id=${sessionId}`;
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
      setProcessingMessage(null);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="page">
        <div className="container py-8">
          {/* HEADER */}
          <header className="mb-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="logo-mark">L</div>
              <div>
                <p className="font-display text-2xl">Lecta AI</p>
                <p className="muted text-sm">New Match Exam</p>
              </div>
            </Link>

            <Link href="/dashboard" className="btn-secondary liquid-glass">
              Dashboard
            </Link>
          </header>

          {/* HERO */}
          <section className="mb-8">
            <div className="pill">
              <span className="pill-dot" />
              Start the workflow
            </div>

            <h1 className="hero-title mt-5 max-w-4xl">
              Build a practice exam from your <em>real course files</em>.
            </h1>

            <p className="section-copy mt-5 max-w-2xl">
              Upload your lecture and previous exam, then generate a grounded
              Match Exam tailored to your course.
            </p>
          </section>

          {/* PROCESSING */}
          {isSubmitting ? (
            <ProcessingView
              title="Preparing your Match Exam..."
              description={processingMessage || ""}
            />
          ) : (
            <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                <UploadSection
                  lectureFile={lectureFile}
                  previousExamFile={previousExamFile}
                  onLectureFileChange={setLectureFile}
                  onPreviousExamFileChange={setPreviousExamFile}
                />

                <ConfigureSection
                  questionCount={questionCount}
                  language={language}
                  onQuestionCountChange={setQuestionCount}
                  onLanguageChange={setLanguage}
                />

                <GenerationSummaryCard
                  lectureFile={lectureFile}
                  previousExamFile={previousExamFile}
                  isReady={isReady}
                  isSubmitting={isSubmitting}
                  onGenerate={handleGenerate}
                />
              </div>

              <div className="sticky top-8">
                <FlowInfoCard />
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}