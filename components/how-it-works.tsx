import { Reveal } from "./reveal";
import { PenLine, ScanSearch, SendHorizonal } from "lucide-react";

const STEPS = [
  {
    Icon: PenLine,
    title: "Write like you always do",
    body: "Draft your cold email in Gmail. HitSend reads along quietly in the background - no new tab, no copy-paste, no send-a-test-and-wait.",
  },
  {
    Icon: ScanSearch,
    title: "See exactly what's risky",
    body: "The moment a phrase trips a spam filter, HitSend flags it - with the reason and the exact point cost. Trigger words, ALL-CAPS, too many links, a missing unsubscribe, and more.",
  },
  {
    Icon: SendHorizonal,
    title: "Fix it and hit send",
    body: "One click rewrites the flagged phrase to safer wording - or trims it when there's no clean swap - and your score slides toward green. Then hit send, knowing it'll actually land.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-coral">
          How it works
        </p>
        <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          Three steps. No dashboards to learn.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          It feels like spell-check - except instead of typos, it catches the
          things that send you to spam.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.12}>
            <div className="group relative h-full overflow-hidden rounded-[var(--radius-xl)] border border-line bg-paper p-8 shadow-soft transition-transform hover:-translate-y-1">
              <span className="absolute right-6 top-6 font-display text-5xl font-extrabold text-cream-deep transition-colors group-hover:text-coral-soft">
                {i + 1}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-coral-soft text-coral">
                <s.Icon className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-ink">
                {s.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                {s.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
