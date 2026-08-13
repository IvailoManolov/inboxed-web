"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Sparkles, ScanSearch, RotateCcw } from "lucide-react";
import { Reveal } from "./reveal";

/* A scripted result-screen preview. The real scoring engine lives in the
   product, server-side — this section only demonstrates the experience.
   One-click fixes are intentionally gated to show the free→paid line. */

type Tok = { t: string; bad?: boolean };
type Finding = { penalty: number; text: string; tag: string };
type Example = {
  id: string;
  tab: string;
  hint: string;
  score: number;
  subject: Tok[];
  body: Tok[];
  findings: Finding[];
};

const EXAMPLES: Example[] = [
  {
    id: "aggressive",
    tab: "Obvious spam",
    hint: "The kind of email a filter eats alive.",
    score: 78,
    subject: [
      { t: "GUARANTEED", bad: true },
      { t: " results — " },
      { t: "act now!!!", bad: true },
    ],
    body: [
      { t: "Hey, I want to give you a " },
      { t: "100% risk-free", bad: true },
      { t: " offer you can't refuse. " },
      { t: "Click here", bad: true },
      { t: ", " },
      { t: "click here", bad: true },
      { t: ", or " },
      { t: "click here", bad: true },
      { t: " to claim it before it's gone!" },
    ],
    findings: [
      { penalty: 18, text: '"GUARANTEED" in caps in the subject', tag: "Spam word" },
      { penalty: 14, text: "3 links inside a 40-word email", tag: "Link overload" },
      { penalty: 12, text: '"act now" + "risk-free" urgency phrases', tag: "Spam phrase" },
      { penalty: 8, text: "No unsubscribe link (CAN-SPAM)", tag: "Hygiene" },
    ],
  },
  {
    id: "realistic",
    tab: "Looks fine — still risky",
    hint: "A normal cold email that quietly still trips filters.",
    score: 41,
    subject: [{ t: "Quick question", bad: true }, { t: " about your hiring" }],
    body: [
      { t: "Hi Sarah, I noticed you're growing the sales team. I help reps book more demos — open to a quick 15-min call this week? Grab a time here: " },
      { t: "book.me/alex-x9f2", bad: true },
      { t: ". No worries if not!" },
    ],
    findings: [
      { penalty: 12, text: '"Quick question" — an overused cold-open filters learn to flag', tag: "Subject" },
      { penalty: 10, text: "Link uses a shortener / unfamiliar domain", tag: "Link trust" },
      { penalty: 9, text: "No unsubscribe line or physical address", tag: "Hygiene" },
      { penalty: 7, text: "Sent as HTML with almost no plain-text balance", tag: "Structure" },
    ],
  },
];

function band(score: number) {
  if (score >= 60)
    return { fg: "var(--danger)", soft: "var(--danger-soft)", label: "Spam" };
  if (score >= 30)
    return { fg: "var(--amber)", soft: "#fdf0d9", label: "Risky" };
  return { fg: "var(--green)", soft: "var(--green-soft)", label: "Inbox" };
}

export function LiveDemo() {
  const [idx, setIdx] = useState(0);
  const [scanned, setScanned] = useState(false);
  const ex = EXAMPLES[idx];
  const b = band(ex.score);

  const switchTo = (i: number) => {
    setIdx(i);
    setScanned(false);
  };

  return (
    <section id="try" className="bg-grain border-y border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-coral">
            See it in action
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            Not just the obvious ones.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            The dangerous emails are the ones that <em>look</em> fine. Try both.
          </p>
        </Reveal>

        {/* example switcher */}
        <Reveal delay={0.05}>
          <div className="mx-auto mt-8 flex max-w-md items-center gap-1 rounded-full border border-line bg-paper p-1 shadow-soft">
            {EXAMPLES.map((e, i) => (
              <button
                key={e.id}
                onClick={() => switchTo(i)}
                className={`relative flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  idx === i ? "text-paper" : "text-ink-soft hover:text-ink"
                }`}
              >
                {idx === i && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{e.tab}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-8 grid max-w-4xl overflow-hidden rounded-[var(--radius-2xl)] border border-line bg-paper shadow-soft md:grid-cols-2">
            {/* email side */}
            <div className="border-b border-line p-7 md:border-b-0 md:border-r">
              <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted">
                <span className="h-2 w-2 rounded-full bg-coral" /> Cold email
                draft
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 font-mono text-sm leading-relaxed"
                >
                  <div>
                    <span className="text-muted">Subject: </span>
                    {ex.subject.map((s, i) => (
                      <Token key={i} bad={s.bad} scanned={scanned} fg={b.fg} soft={b.soft}>
                        {s.t}
                      </Token>
                    ))}
                  </div>
                  <div className="text-ink-soft">
                    {ex.body.map((s, i) => (
                      <Token key={i} bad={s.bad} scanned={scanned} fg={b.fg} soft={b.soft}>
                        {s.t}
                      </Token>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <button
                onClick={() => setScanned((v) => !v)}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
              >
                {scanned ? (
                  <>
                    <RotateCcw className="h-4 w-4" /> Reset
                  </>
                ) : (
                  <>
                    <ScanSearch className="h-4 w-4" /> Run the check
                  </>
                )}
              </button>
            </div>

            {/* results side */}
            <div className="relative p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest text-muted">
                    Result
                  </span>
                  <p className="mt-0.5 text-[11px] text-muted">
                    0–100 · lower is better
                  </p>
                </div>
                <div
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors duration-500"
                  style={{ background: scanned ? b.soft : "var(--cream-deep)" }}
                >
                  <span
                    className="font-mono text-lg font-bold tabular-nums"
                    style={{ color: scanned ? b.fg : "var(--muted)" }}
                  >
                    {scanned ? ex.score : "—"}
                  </span>
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: scanned ? b.fg : "var(--muted)" }}
                  >
                    {scanned ? b.label : "Ready"}
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {scanned ? (
                  <motion.ul
                    key={"findings-" + ex.id}
                    className="space-y-3"
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                  >
                    {ex.findings.map((f) => (
                      <motion.li
                        key={f.text}
                        variants={{
                          hidden: { opacity: 0, x: 12 },
                          show: { opacity: 1, x: 0 },
                        }}
                        className="flex items-start gap-3 rounded-xl border border-line bg-cream/60 p-3"
                      >
                        <span
                          className="mt-0.5 shrink-0 rounded-md px-2 py-0.5 font-mono text-xs font-bold"
                          style={{ background: b.soft, color: b.fg }}
                        >
                          −{f.penalty}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-ink">{f.text}</p>
                          <p className="text-xs text-muted">{f.tag}</p>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-40 flex-col items-center justify-center text-center text-sm text-muted"
                  >
                    <ScanSearch className="mb-2 h-7 w-7 text-line" />
                    Run the check to see what a spam filter sees.
                  </motion.div>
                )}
              </AnimatePresence>

              {/* gated fixes */}
              <AnimatePresence>
                {scanned && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="mt-5 overflow-hidden rounded-xl border border-dashed border-coral/40 bg-coral-soft/50 p-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-coral-deep">
                      <Lock className="h-4 w-4" /> One-click fixes ready
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">
                      BeSeen can rewrite every issue and lift this to{" "}
                      <span className="font-semibold text-green">green</span>{" "}
                      instantly.
                    </p>
                    <button className="mt-3 inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5 hover:bg-coral-deep">
                      <Sparkles className="h-4 w-4" /> Unlock fixes
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Token({
  children,
  bad,
  scanned,
  fg,
  soft,
}: {
  children: string;
  bad?: boolean;
  scanned: boolean;
  fg: string;
  soft: string;
}) {
  if (!bad) return <span>{children}</span>;
  return (
    <span
      className="rounded px-0.5 transition-all duration-500"
      style={
        scanned
          ? { backgroundColor: soft, boxShadow: `inset 0 -2px 0 ${fg}`, color: fg }
          : {}
      }
    >
      {children}
    </span>
  );
}
