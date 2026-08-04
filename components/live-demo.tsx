"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Sparkles, ScanSearch, RotateCcw } from "lucide-react";
import { Reveal } from "./reveal";

/* A scripted result-screen preview. The real scoring engine lives in the
   product, server-side — this section only demonstrates the experience.
   One-click fixes are intentionally gated to show the free→paid line. */

const SUBJECT = [
  { t: "GUARANTEED", bad: true },
  { t: " results — ", bad: false },
  { t: "act now!!!", bad: true },
];

const BODY = [
  { t: "Hey, I want to give you a ", bad: false },
  { t: "100% risk-free", bad: true },
  { t: " offer you can't refuse. ", bad: false },
  { t: "Click here", bad: true },
  { t: ", ", bad: false },
  { t: "click here", bad: true },
  { t: ", or ", bad: false },
  { t: "click here", bad: true },
  { t: " to claim it before it's gone!", bad: false },
];

const FINDINGS = [
  { penalty: 18, text: '"GUARANTEED" in caps in the subject', tag: "Spam word" },
  { penalty: 14, text: "3 links inside a 40-word email", tag: "Link overload" },
  { penalty: 12, text: '"act now" + "risk-free" urgency phrases', tag: "Spam phrase" },
  { penalty: 8, text: "No unsubscribe link (CAN-SPAM)", tag: "Hygiene" },
];

export function LiveDemo() {
  const [scanned, setScanned] = useState(false);

  return (
    <section id="try" className="bg-grain border-y border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-coral">
            See it in action
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            Here's a real email a filter would eat alive.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Hit the button and watch Inboxed pull it apart line by line.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 grid max-w-4xl overflow-hidden rounded-[var(--radius-2xl)] border border-line bg-paper shadow-soft md:grid-cols-2">
            {/* email side */}
            <div className="border-b border-line p-7 md:border-b-0 md:border-r">
              <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted">
                <span className="h-2 w-2 rounded-full bg-coral" /> Cold email
                draft
              </div>

              <div className="space-y-4 font-mono text-sm leading-relaxed">
                <div>
                  <span className="text-muted">Subject: </span>
                  {SUBJECT.map((s, i) => (
                    <Token key={i} bad={s.bad} scanned={scanned}>
                      {s.t}
                    </Token>
                  ))}
                </div>
                <div className="text-ink-soft">
                  {BODY.map((s, i) => (
                    <Token key={i} bad={s.bad} scanned={scanned}>
                      {s.t}
                    </Token>
                  ))}
                </div>
              </div>

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
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Result
                </span>
                <ScoreBadge scanned={scanned} />
              </div>

              <AnimatePresence mode="wait">
                {scanned ? (
                  <motion.ul
                    key="findings"
                    className="space-y-3"
                    initial="hidden"
                    animate="show"
                    variants={{
                      show: { transition: { staggerChildren: 0.09 } },
                    }}
                  >
                    {FINDINGS.map((f) => (
                      <motion.li
                        key={f.text}
                        variants={{
                          hidden: { opacity: 0, x: 12 },
                          show: { opacity: 1, x: 0 },
                        }}
                        className="flex items-start gap-3 rounded-xl border border-line bg-cream/60 p-3"
                      >
                        <span className="mt-0.5 shrink-0 rounded-md bg-danger-soft px-2 py-0.5 font-mono text-xs font-bold text-danger">
                          −{f.penalty}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {f.text}
                          </p>
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
                    transition={{ delay: 0.5 }}
                    className="mt-5 overflow-hidden rounded-xl border border-dashed border-coral/40 bg-coral-soft/50 p-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-coral-deep">
                      <Lock className="h-4 w-4" /> One-click fixes ready
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">
                      Inboxed can rewrite all 4 issues and lift this to{" "}
                      <span className="font-semibold text-green">green</span>{" "}
                      instantly.
                    </p>
                    <button className="mt-3 inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5 hover:bg-coral-deep">
                      <Sparkles className="h-4 w-4" /> Unlock fixes — free
                      account
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
}: {
  children: string;
  bad: boolean;
  scanned: boolean;
}) {
  if (!bad) return <span>{children}</span>;
  return (
    <span
      className="rounded px-0.5 transition-all duration-500"
      style={
        scanned
          ? {
              backgroundColor: "var(--danger-soft)",
              boxShadow: "inset 0 -2px 0 var(--danger)",
              color: "var(--danger)",
            }
          : {}
      }
    >
      {children}
    </span>
  );
}

function ScoreBadge({ scanned }: { scanned: boolean }) {
  const score = scanned ? 78 : 0;
  const color = scanned ? "var(--danger)" : "var(--muted)";
  const soft = scanned ? "var(--danger-soft)" : "var(--cream-deep)";
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors duration-500"
      style={{ background: soft }}
    >
      <span
        className="font-mono text-lg font-bold tabular-nums"
        style={{ color }}
      >
        {scanned ? score : "—"}
      </span>
      <span
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color }}
      >
        {scanned ? "Spam" : "Ready"}
      </span>
    </div>
  );
}
