import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import { ArrowLeft, ArrowRight, Inbox, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "The data — why so many emails end up in spam | Inboxed",
  description:
    "Real, cited statistics on email deliverability: how many emails never reach the inbox, how much of all email is spam, and what actually trips filters.",
};

const HEADLINE_STATS = [
  {
    big: "~1 in 6",
    label: "emails never reaches the inbox",
    detail:
      "Average inbox-placement rates sit around 83–85% globally — meaning roughly one in six legitimate emails lands in spam or vanishes.",
    source: "Validity / Return Path Deliverability Benchmark",
  },
  {
    big: "45%+",
    label: "of all email sent is spam",
    detail:
      "Nearly half of global email traffic is spam — which is exactly why providers filter so aggressively, and why real senders get caught in the net.",
    source: "Statista / Kaspersky, 2023",
  },
  {
    big: "~1 in 5",
    label: "marketing emails goes missing or to spam",
    detail:
      "Independent deliverability tests repeatedly find 15–20% of commercial emails never make it to the inbox across major providers.",
    source: "EmailTooltester deliverability studies",
  },
  {
    big: "0.10%",
    label: "spam complaints can hurt your reputation",
    detail:
      "Google advises keeping your spam-complaint rate below 0.10%. Cross it and your future emails are far more likely to be filtered — for everyone on your domain.",
    source: "Google Postmaster Tools guidance",
  },
];

const TRIGGERS = [
  "Spam-trigger words in the subject or body (“guaranteed”, “risk-free”, “act now”)",
  "Too many links, or links to unfamiliar / shortened domains",
  "ALL-CAPS, excessive punctuation, and urgency phrasing",
  "Missing unsubscribe link or physical address (CAN-SPAM)",
  "Poor HTML-to-text balance and image-heavy messages",
  "Low sender reputation from past complaints or bounces",
];

export default function StatsPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* hero */}
        <section className="bg-grain border-b border-line">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-24">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-coral transition-colors hover:text-coral-deep"
            >
              <ArrowLeft className="h-4 w-4" /> Back home
            </a>
            <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-coral">
              The data
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              A lot of good email never gets read.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              We think you deserve the real numbers before you trust a tool with
              your outreach. Here’s what the industry’s own deliverability
              research shows — with sources, so you can check us.
            </p>
          </div>
        </section>

        {/* headline stats */}
        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-6 sm:grid-cols-2">
            {HEADLINE_STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-[var(--radius-2xl)] border border-line bg-paper p-8 shadow-soft">
                  <div className="font-display text-6xl font-extrabold leading-none text-coral">
                    {s.big}
                  </div>
                  <p className="mt-4 font-display text-xl font-bold text-ink">
                    {s.label}
                  </p>
                  <p className="mt-3 flex-1 text-base leading-relaxed text-ink-soft">
                    {s.detail}
                  </p>
                  <p className="mt-5 border-t border-line pt-4 text-xs font-medium uppercase tracking-wide text-muted">
                    Source · {s.source}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* why it happens */}
        <section className="border-y border-line bg-cream-deep/40">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="grid gap-10 md:grid-cols-2">
              <Reveal>
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-soft text-danger">
                    <AlertTriangle className="h-6 w-6" strokeWidth={2.2} />
                  </div>
                  <h2 className="mt-5 font-display text-2xl font-bold text-ink">
                    The worst part? You never find out.
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-ink-soft">
                    When an email is filtered to spam, there’s no bounce, no
                    error, no notice. It just silently disappears. You assume the
                    prospect wasn’t interested — when the truth is they never saw
                    it. Filters score every message in milliseconds against
                    hundreds of signals, and one or two bad ones is all it takes.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-coral-soft text-coral">
                    <Inbox className="h-6 w-6" strokeWidth={2.2} />
                  </div>
                  <h2 className="mt-5 font-display text-2xl font-bold text-ink">
                    What actually trips the filters
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {TRIGGERS.map((t) => (
                      <li
                        key={t}
                        className="flex gap-2.5 text-base leading-relaxed text-ink-soft"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* transparency / sources */}
        <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-ink">
              Where these numbers come from
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">
              Deliverability figures vary by study, year, industry, and mailbox
              provider — anyone quoting a single “exact” number is guessing. We
              round conservatively and point you to the primary research so you
              can judge for yourself:
            </p>
            <ul className="mt-5 space-y-3">
              {[
                "Validity (Return Path) — annual Email Deliverability Benchmark reports on global inbox-placement rates.",
                "Statista & Kaspersky — global spam share of total email traffic.",
                "EmailTooltester — independent, repeated deliverability tests across major providers.",
                "Google Postmaster Tools — official sender guidance on spam-complaint thresholds.",
                "The Radicati Group — email volume and usage statistics.",
              ].map((src) => (
                <li
                  key={src}
                  className="flex gap-2.5 text-base leading-relaxed text-ink-soft"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />
                  <span>{src}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-muted">
              Inboxed isn’t affiliated with any of these organizations. If you
              spot a figure you think is off, tell us at hello@inboxed.app and
              we’ll correct it.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-14 rounded-[var(--radius-2xl)] border border-line bg-ink p-8 text-center text-cream">
              <h3 className="font-display text-2xl font-bold">
                Don’t become a statistic.
              </h3>
              <p className="mx-auto mt-2 max-w-md text-cream/70">
                Check your next cold email before you send it — free, in seconds.
              </p>
              <a
                href="/#try"
                className="group mt-6 inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-base font-semibold text-paper transition-transform hover:-translate-y-0.5 hover:bg-coral-deep"
              >
                Check my email
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
