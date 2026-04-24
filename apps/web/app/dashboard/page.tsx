"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LocalAttempt = {
  attemptId: string;
  score?: number;
  maxScore?: number;
  accuracy?: number;
};

export default function DashboardPage() {
  const [attempts, setAttempts] = useState<LocalAttempt[]>([]);

  useEffect(() => {
    const items: LocalAttempt[] = [];

    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);

      if (!key?.startsWith("lecta_attempt_")) continue;

      try {
        const value = sessionStorage.getItem(key);
        if (!value) continue;

        const data = JSON.parse(value);
        const attemptId = key.replace("lecta_attempt_", "");

        items.push({
          attemptId,
          score: data?.grading?.total_score,
          maxScore: data?.grading?.max_score,
          accuracy: data?.grading?.accuracy,
        });
      } catch {
        // ignore invalid local data
      }
    }

    setAttempts(items.reverse());
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="page">
        <div className="container py-8">
          <header className="mb-10 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div className="logo-mark">L</div>

              <div>
                <p className="font-display text-2xl leading-none text-[var(--ink)]">
                  Lecta AI
                </p>
                <p className="muted mt-1 text-sm">Dashboard</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/" className="btn-secondary liquid-glass">
                Home
              </Link>

              <Link href="/match-exam/new" className="btn-primary">
                Start Match Exam
              </Link>
            </div>
          </header>

          <section className="mb-8 frost rounded-[28px] p-7 md:p-10">
            <div className="pill">
              <span className="pill-dot" />
              Your exam workspace
            </div>

            <h1 className="hero-title mt-5 max-w-5xl">
              Continue your <em>exam preparation</em> with focused activity.
            </h1>

            <p className="section-copy mt-5 max-w-2xl">
              Start a new Match Exam, reopen recent results, and keep your
              revision flow organized from one calm workspace.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/match-exam/new" className="btn-primary">
                Start Match Exam
              </Link>

              <Link href="/" className="btn-secondary liquid-glass">
                Back to homepage
              </Link>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="frost rounded-[24px] p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
                    Recent attempts
                  </p>
                  <p className="stat-value mt-3">{attempts.length}</p>
                  <p className="body-copy mt-2">
                    Saved locally from this browser.
                  </p>
                </div>

                <div className="frost rounded-[24px] p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
                    Generated exams
                  </p>
                  <p className="stat-value mt-3">{attempts.length}</p>
                  <p className="body-copy mt-2">
                    Exams completed in this session.
                  </p>
                </div>

                <div className="frost rounded-[24px] p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
                    Latest result
                  </p>
                  <p className="stat-value mt-3">
                    {attempts[0]?.accuracy != null
                      ? `${Math.round(attempts[0].accuracy)}%`
                      : "—"}
                  </p>
                  <p className="body-copy mt-2">
                    Based on your latest submitted attempt.
                  </p>
                </div>
              </div>

              <div className="frost rounded-[28px] p-7">
                <div className="pill">
                  <span className="pill-dot" />
                  Recent results
                </div>

                <h2 className="section-title mt-5 !text-[clamp(30px,4vw,48px)]">
                  Review your latest attempts.
                </h2>

                <div className="mt-6 space-y-3">
                  {attempts.length > 0 ? (
                    attempts.map((attempt) => (
                      <Link
                        key={attempt.attemptId}
                        href={`/match-exam/attempts/${attempt.attemptId}`}
                        className="block rounded-[22px] border border-[var(--rule)] bg-white/65 p-5 no-underline transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_50px_rgba(18,24,38,0.06)]"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-[var(--ink)]">
                              Attempt #{attempt.attemptId}
                            </p>

                            <p className="mt-1 text-sm text-[var(--ink-3)]">
                              {attempt.score ?? "—"}/{attempt.maxScore ?? "—"} marks
                            </p>
                          </div>

                          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-[var(--brand)]">
                            {attempt.accuracy != null
                              ? `${Math.round(attempt.accuracy)}%`
                              : "Open"}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-[var(--rule)] bg-white/65 p-6">
                      <p className="font-bold text-[var(--ink)]">
                        No recent attempts yet.
                      </p>
                      <p className="section-copy mt-2">
                        Generate and submit your first Match Exam to see results
                        here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="frost h-fit rounded-[28px] p-6 lg:sticky lg:top-8">
              <div className="pill">
                <span className="pill-dot" />
                Core workflow
              </div>

              <h2 className="font-display mt-5 text-[42px] font-normal leading-[0.96] tracking-[-0.04em] text-[var(--ink)]">
                Start from your <em className="text-[var(--ink-2)]">real material</em>.
              </h2>

              <p className="section-copy mt-4">
                Upload a lecture and previous exam, generate a grounded practice
                exam, solve it, then review weak areas.
              </p>

              <div className="mt-6 space-y-3">
                {["Upload files", "Generate exam", "Solve questions", "Review weak areas"].map(
                  (item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-[20px] border border-[var(--rule)] bg-white/65 p-4"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--brand)] text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <p className="text-sm font-bold text-[var(--ink)]">
                        {item}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}