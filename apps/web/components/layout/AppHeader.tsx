"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isDashboard = pathname === "/dashboard";
  const isNewMatchExam = pathname === "/match-exam/new";

  return (
    <>
      <style>{`
        .app-header-shell {
          width: min(1280px, calc(100% - 40px));
          margin: 18px auto 0;
          font-family: var(--font-body);
          position: relative;
          z-index: 40;
        }

        .app-header-backdrop {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid rgba(18,24,38,0.08);
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(24px) saturate(1.2);
          -webkit-backdrop-filter: blur(24px) saturate(1.2);
          box-shadow:
            0 1px 3px rgba(18,24,38,0.04),
            0 8px 24px rgba(18,24,38,0.03);
        }

        .app-header-bar {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
        }

        /* ─── Brand ─── */
        .app-header-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: inherit;
          flex-shrink: 0;
        }

        .app-header-logo {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--brand, #2457ea);
          color: white;
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
        }

        .app-header-brand-title {
          font-size: 15px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--ink, #121826);
        }

        /* ─── Nav ─── */
        .app-header-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-left: auto;
        }

        .app-header-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          color: #64748b;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
        }

        .app-header-link:hover {
          color: var(--ink, #121826);
          background: rgba(18,24,38,0.04);
        }

        .app-header-link.active {
          color: var(--brand, #2457ea);
          background: rgba(36,87,234,0.08);
          font-weight: 600;
        }

        /* ─── Actions ─── */
        .app-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: 12px;
          flex-shrink: 0;
        }

        .app-header-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 34px;
          padding: 0 16px;
          border-radius: 999px;
          background: var(--brand, #2457ea);
          color: white;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s, transform 0.15s;
          white-space: nowrap;
        }

        .app-header-cta:hover {
          opacity: 0.92;
          transform: translateY(-0.5px);
        }

        .app-header-avatar {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(18,24,38,0.10);
          background: rgba(18,24,38,0.05);
          color: var(--ink, #121826);
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* ─── Responsive ─── */
        @media (max-width: 860px) {
          .app-header-bar {
            flex-wrap: wrap;
            gap: 8px;
          }

          .app-header-nav {
            order: 3;
            width: 100%;
            margin-left: 0;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding-bottom: 4px;
          }

          .app-header-nav::-webkit-scrollbar {
            display: none;
          }

          .app-header-actions {
            margin-left: auto;
          }
        }

        @media (max-width: 540px) {
          .app-header-shell {
            width: calc(100% - 24px);
          }

          .app-header-backdrop {
            border-radius: 16px;
          }

          .app-header-bar {
            padding: 10px 12px;
          }

          .app-header-link {
            padding: 0 10px;
            font-size: 12px;
          }
        }
      `}</style>

      <header className="app-header-shell">
        <div className="app-header-backdrop">
          <div className="app-header-bar">
            {/* Brand */}
            <Link href="/" className="app-header-brand">
              <div className="app-header-logo">L</div>
              <div className="app-header-brand-title">Lecta AI</div>
            </Link>

            {/* Navigation */}
            <nav className="app-header-nav">
              <Link
                href="/"
                className={`app-header-link ${isHome ? "active" : ""}`}
              >
                Home
              </Link>
              <Link href="/#product" className="app-header-link">
                Product
              </Link>
              <Link href="/#how-it-works" className="app-header-link">
                How it works
              </Link>
              <Link
                href="/dashboard"
                className={`app-header-link ${isDashboard ? "active" : ""}`}
              >
                Dashboard
              </Link>
            </nav>

            {/* Actions */}
            <div className="app-header-actions">
              <Link
                href="/match-exam/new"
                className={`app-header-cta`}
              >
                New Exam
              </Link>
              <div className="app-header-avatar">M</div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}