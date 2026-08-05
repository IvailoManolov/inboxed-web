import { Reveal } from "./reveal";

const BANDS = [
  {
    range: "0–29",
    label: "Inbox",
    color: "var(--green)",
    soft: "var(--green-soft)",
    body: "Clean. Nothing worth worrying about — hit send.",
  },
  {
    range: "30–59",
    label: "Risky",
    color: "var(--amber)",
    soft: "#fbedd4",
    body: "A few things could tip this into spam. Worth a quick look.",
  },
  {
    range: "60–100",
    label: "Spam",
    color: "var(--danger)",
    soft: "var(--danger-soft)",
    body: "Likely to be filtered. Fix the flagged items before you send.",
  },
];

export function ScoreGuide() {
  return (
    <section id="score" className="border-y border-line bg-cream-deep/40">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-coral">
            The score
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            A number you can actually read.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Every email gets a <strong>0–100 spam-risk score</strong>. It isn't a
            percentage — it's a points system. Each risk we spot (a spam word, a
            shortened link, a missing unsubscribe) adds a few points, weighted by
            how much filters actually care. Fewer points → lower score →{" "}
            <strong>more likely to land in the inbox.</strong>
          </p>
          <p className="mt-3 text-lg font-semibold text-ink">
            So the rule is simple: the lower, the better.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-[var(--radius-2xl)] border border-line bg-paper p-6 shadow-soft sm:p-8">
            {/* the meter */}
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
              <span>0 · best</span>
              <span>lower is better ←</span>
              <span>100 · worst</span>
            </div>
            <div className="flex h-4 overflow-hidden rounded-full">
              <div style={{ width: "30%", background: "var(--green)" }} />
              <div style={{ width: "30%", background: "var(--amber)" }} />
              <div style={{ width: "40%", background: "var(--danger)" }} />
            </div>

            {/* bands */}
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {BANDS.map((b) => (
                <div key={b.label}>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-md px-2 py-0.5 font-mono text-sm font-bold"
                      style={{ background: b.soft, color: b.color }}
                    >
                      {b.range}
                    </span>
                    <span
                      className="text-sm font-bold uppercase tracking-wide"
                      style={{ color: b.color }}
                    >
                      {b.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {b.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
