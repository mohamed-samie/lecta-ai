import type { ReactNode } from "react";
import Link from "next/link";

type ExamLayoutProps = {
  children: ReactNode;
};

export function ExamLayout({ children }: ExamLayoutProps) {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="page">
        <div className="container py-8">
          {/* ================= HEADER ================= */}
          <header className="mb-10 flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 no-underline"
            >
              <div className="logo-mark">L</div>

              <div>
                <p className="font-display text-[22px] leading-none text-[var(--ink)] tracking-tight">
                  Lecta AI
                </p>
                <p className="muted mt-1 text-xs tracking-wide">
                  Match Exam
                </p>
              </div>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="btn-secondary liquid-glass px-5 py-2 text-sm"
              >
                Dashboard
              </Link>
            </div>
          </header>

          {/* ================= CONTENT ================= */}
          <section className="pb-24">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}