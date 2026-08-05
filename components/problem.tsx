import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

const STATS = [
  {
    stat: "1 in 6",
    line: "cold emails never reach the inbox — they're silently filtered to spam.",
  },
  {
    stat: "0",
    line: "warnings you get when it happens. No bounce, no notice. Just silence.",
  },
  {
    stat: "60 sec",
    line: "is all it takes to catch the triggers before you send to your whole list.",
  },
];

export function Problem() {
  return (
    <section className="border-y border-line bg-cream-deep/40">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-coral">
            The quiet killer
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            You didn't get ignored. You never got seen.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
            One spammy word in the subject. Three links in a short email. A
            sneaky ALL-CAPS. That's all it takes for a filter to bury your
            outreach — and you'll blame your copy, your list, or your luck.
          </p>
          <a
            href="/stats"
            className="group mt-6 inline-flex items-center gap-1.5 text-base font-semibold text-coral transition-colors hover:text-coral-deep"
          >
            See the deliverability data
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.stat} delay={i * 0.1}>
              <div className="h-full rounded-[var(--radius-xl)] border border-line bg-paper p-7 shadow-soft">
                <div className="font-display text-4xl font-extrabold text-coral">
                  {s.stat}
                </div>
                <p className="mt-3 text-base leading-relaxed text-ink-soft">
                  {s.line}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
