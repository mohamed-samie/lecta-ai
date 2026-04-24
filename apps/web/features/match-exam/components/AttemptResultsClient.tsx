"use client";

import { useEffect, useState } from "react";
import { ExamLayout } from "@/features/match-exam/components/ExamLayout";
import {
  getAttemptById,
  getAttemptFromSessionStorage,
  mapSubmitResponseToAttemptData,
  type AttemptData,
} from "@/lib/api/match-exam";

import { ResultsSummary } from "@/features/match-exam/components/ResultsSummary";
import { WeakAreasCard } from "@/features/match-exam/components/WeakAreasCard";
import { StudyNextCard } from "@/features/match-exam/components/StudyNextCard";

type AttemptResultsClientProps = {
  attemptId: string;
};

export function AttemptResultsClient({ attemptId }: AttemptResultsClientProps) {
  const [attempt, setAttempt] = useState<AttemptData | null | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadAttempt = async () => {
      try {
        setErrorMessage(null);

        const stored = getAttemptFromSessionStorage(attemptId);
        if (stored && !isCancelled) {
          setAttempt(mapSubmitResponseToAttemptData(stored));
        }

        const fetched = await getAttemptById(attemptId);
        if (isCancelled) return;

        setAttempt(mapSubmitResponseToAttemptData(fetched));
      } catch (err) {
        if (isCancelled) return;

        const message =
          err instanceof Error ? err.message : "Failed to load attempt.";

        setErrorMessage(message);

        if (!getAttemptFromSessionStorage(attemptId)) {
          setAttempt(null);
        }
      }
    };

    if (!attemptId) {
      setAttempt(null);
      setErrorMessage("Missing attempt ID");
      return;
    }

    void loadAttempt();

    return () => {
      isCancelled = true;
    };
  }, [attemptId]);

  // Loading
  if (attempt === undefined) {
    return (
      <ExamLayout>
        <p className="text-muted-foreground px-6">Loading results...</p>
      </ExamLayout>
    );
  }

  // Error
  if (errorMessage && attempt === null) {
    return (
      <ExamLayout>
        <p className="text-red-500 px-6">{errorMessage}</p>
      </ExamLayout>
    );
  }

  // Empty
  if (!attempt) {
    return (
      <ExamLayout>
        <p className="px-6">No results found.</p>
      </ExamLayout>
    );
  }

  // ✅ Final UI
  return (
    <ExamLayout>
      <div className="mx-auto max-w-4xl space-y-6 px-6">
        <ResultsSummary attempt={attempt} />
        <WeakAreasCard weakAreas={attempt.weakAreas ?? []} />
        <StudyNextCard items={attempt.studyNext ?? []} />
      </div>
    </ExamLayout>
  );
}