import Link from "next/link";

const valuePoints = [
  {
    title: "Grounded by your own material",
    description:
      "Lecta uses your lecture and previous exam to build a practice flow that actually reflects your course.",
  },
  {
    title: "Exam-style, not generic AI",
    description:
      "The generated questions follow the tone, structure, and depth of your professor’s exams.",
  },
  {
    title: "Clear revision direction",
    description:
      "After solving, you see weak areas and what to study next — not just a score.",
  },
];

const workflowRows = [
  {
    icon: "L",
    title: "Upload",
    description: "Lecture + previous exam",
  },
  {
    icon: "G",
    title: "Generate",
    description: "Realistic practice exam",
  },
  {
    icon: "R",
    title: "Review",
    description: "Weak areas + next steps",
  },
];

export default function HomePage() {
  return (
    <main className="page grain">
      <div className="container">
        {/* NAV */}
      <header className="nav-shell">
  <Link href="/" className="brand-lockup">
    <div className="brand-mark">L</div>

    <div>
      <p className="brand-title">Lecta AI</p>
      <p className="brand-subtitle">Built from your
actual lecture.</p>
    </div>
  </Link>

  <nav className="nav-center">
    <a href="#" className="nav-item nav-item-active">
      Home
    </a>
    <a href="#product" className="nav-item">
      Product
    </a>
    <a href="#how-it-works" className="nav-item">
      How it works
    </a>
    <Link href="/dashboard" className="nav-item">
      Dashboard
    </Link>
  </nav>

  <div className="nav-cta">
    <Link href="/dashboard" className="nav-button-secondary">
      Dashboard
    </Link>

    <Link href="/match-exam/new" className="nav-button-primary">
      Start Match Exam
    </Link>
  </div>
</header>
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-grid">
            <div>
              <div className="pill">
                <span className="pill-dot" />
                Grounded AI exam prep
              </div>

              <h1 className="hero-title mt-6">
                Your exam,
                <br />
                built from
                <br />
                your actual <em>lecture</em>.
              </h1>

              <p className="section-copy mt-6 max-w-xl">
                Lecta turns your lecture and previous exam into one focused flow:
                generate a realistic exam, solve it, then understand what to study next.
              </p>

              <div className="flex gap-4 mt-8">
                <Link href="/match-exam/new" className="btn-primary">
                  Start Match Exam
                </Link>

                <a href="#how-it-works" className="btn-secondary liquid-glass">
                  See how it works
                </a>
              </div>

              <div className="stats-grid mt-10">
                <div className="stat-card">
                  <p className="stat-value">Lecture + exam</p>
                  <p className="body-copy mt-2">in, grounded practice test out</p>
                </div>

                <div className="stat-card">
                  <p className="stat-value">Solve + review</p>
                  <p className="body-copy mt-2">inside one focused flow</p>
                </div>

                <div className="stat-card">
                  <p className="stat-value">Weak areas</p>
                  <p className="body-copy mt-2">turned into study guidance</p>
                </div>
              </div>
            </div>

            {/* WORKFLOW CARD */}
            <div className="workflow-shell">
              <div className="workflow-card frost">
                <div className="workflow-inner">
                  <div className="workflow-head">
                    <div>
                      <p className="font-semibold">Lecta workflow</p>
                      <p className="muted text-sm">From upload to revision</p>
                    </div>

                    <span className="live-badge">Live</span>
                  </div>

                  <div className="workflow-grid">
                    {workflowRows.map((row) => (
                      <div key={row.title} className="workflow-row">
                        <div className="workflow-icon">{row.icon}</div>

                        <div>
                          <p className="font-semibold">{row.title}</p>
                          <p className="body-copy">{row.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY */}
        <section id="product" className="section-block">
          <div className="why-grid">
            <div className="sticky-copy">
              <div className="pill">
                <span className="pill-dot" />
                Why Lecta
              </div>

              <h2 className="section-title mt-4">
                Built around how you actually study.
              </h2>

              <p className="section-copy mt-4 max-w-md">
                Instead of generic AI questions, Lecta grounds everything in your
                course — so your practice actually matches your exam.
              </p>
            </div>

            <div className="value-grid">
              {valuePoints.map((point) => (
                <div key={point.title} className="value-card">
                  <h3 className="value-title">{point.title}</h3>
                  <p className="body-copy">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section id="how-it-works" className="section-block">
          <div className="max-w-xl mb-8">
            <div className="pill">
              <span className="pill-dot" />
              How it works
            </div>

            <h2 className="section-title mt-4">
              One clear path from files to revision.
            </h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-num">01</span>
              <h3 className="step-title">Upload your materials</h3>
              <p className="body-copy">
                Add your lecture and a previous exam as a reference.
              </p>
            </div>

            <div className="step-card">
              <span className="step-num">02</span>
              <h3 className="step-title">Generate the exam</h3>
              <p className="body-copy">
                Lecta creates a grounded practice exam from your files.
              </p>
            </div>

            <div className="step-card">
              <span className="step-num">03</span>
              <h3 className="step-title">Solve and review</h3>
              <p className="body-copy">
                Answer, then see what to revise and improve next.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-block">
          <div className="cta-panel frost">
            <h2 className="cta-title">
              Turn your <em>lectures</em> into a <em>clear study path</em>.
            </h2>

            <div className="flex justify-center gap-4 mt-6">
              <Link href="/match-exam/new" className="btn-primary">
                Start Match Exam
              </Link>

              <Link href="/dashboard" className="btn-secondary liquid-glass">
                Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer-wrap">
          <p className="muted">Lecta AI</p>

          <div className="flex gap-6">
            <a href="#how-it-works" className="footer-link">
              How it works
            </a>

            <Link href="/dashboard" className="footer-link">
              Dashboard
            </Link>

            <Link href="/match-exam/new" className="footer-link">
              Start
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}