import { Reveal } from "./reveal";
import { Check } from "lucide-react";

const TIERS: {
  name: string;
  price: string;
  original: string | null;
  cadence: string;
  note: string | null;
  tagline: string;
  features: string[];
  cta: string;
  highlight: boolean;
}[] = [
  {
    name: "Free",
    price: "$0",
    original: null,
    cadence: "forever",
    note: null,
    tagline: "See what a filter sees.",
    features: [
      "Web checker — score any email",
      "Line-by-line spam findings",
      "1 check / day",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    original: "$19.99",
    cadence: "/ month",
    note: "Launch price — until the end of 2026",
    tagline: "The Gmail sidekick you'll actually keep.",
    features: [
      "Real-time checks inside Gmail",
      "One-click fixes & rewrites",
      "Unlimited emails + history",
      "Subject-line suggestions",
    ],
    cta: "Get Pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "$15",
    original: null,
    cadence: "/ seat / mo",
    note: null,
    tagline: "For agencies sending at scale.",
    features: [
      "Everything in Pro",
      "Shared rule presets",
      "Team billing & seats",
      "Priority support",
    ],
    cta: "Talk to us",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-coral">
          Pricing
        </p>
        <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          One recovered reply pays for a year.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          Start free. Upgrade when you're tired of guessing why nobody wrote
          back.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {TIERS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.1}>
            <div
              className={`relative flex h-full flex-col rounded-[var(--radius-2xl)] border p-8 ${
                t.highlight
                  ? "border-coral bg-ink text-cream shadow-lift"
                  : "border-line bg-paper text-ink shadow-soft"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-coral px-3 py-1 text-xs font-semibold uppercase tracking-wide text-paper">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold">{t.name}</h3>
              <p
                className={`mt-1 text-sm ${
                  t.highlight ? "text-cream/70" : "text-muted"
                }`}
              >
                {t.tagline}
              </p>
              <div className="mt-6 flex items-baseline gap-2">
                {t.original && (
                  <span
                    className={`font-display text-2xl font-bold line-through ${
                      t.highlight ? "text-cream/40" : "text-muted/60"
                    }`}
                  >
                    {t.original}
                  </span>
                )}
                <span className="font-display text-4xl font-extrabold">
                  {t.price}
                </span>
                <span
                  className={`text-sm ${
                    t.highlight ? "text-cream/70" : "text-muted"
                  }`}
                >
                  {t.cadence}
                </span>
              </div>
              {t.note && (
                <p
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    t.highlight
                      ? "bg-coral/20 text-coral"
                      : "bg-coral-soft text-coral-deep"
                  }`}
                >
                  🎉 {t.note}
                </p>
              )}

              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        t.highlight ? "text-coral" : "text-green"
                      }`}
                      strokeWidth={3}
                    />
                    <span className={t.highlight ? "text-cream/90" : "text-ink-soft"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#try"
                className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                  t.highlight
                    ? "bg-coral text-paper hover:bg-coral-deep"
                    : "border border-ink bg-transparent text-ink hover:bg-cream-deep"
                }`}
              >
                {t.cta}
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15}>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[var(--radius-xl)] border-2 border-dashed border-amber bg-amber/10 p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-display text-lg font-bold text-ink">
              🚀 Founding deal — first 100 customers
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Lock in <span className="font-semibold">$99 once</span> for
              lifetime Pro. When they're gone, they're gone.
            </p>
          </div>
          <a
            href="#try"
            className="shrink-0 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
          >
            Claim lifetime access
          </a>
        </div>
      </Reveal>
    </section>
  );
}
