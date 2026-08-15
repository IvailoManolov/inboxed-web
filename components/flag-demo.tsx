"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { Reveal } from "./reveal";

/**
 * "It flags spam as you write" - a faithful HTML mock of a Gmail compose with
 * the live HitSend panel beside it. On scroll-into-view a scan sweeps the
 * draft, the risky phrases highlight one-by-one in sync with the findings
 * populating the panel, and the score climbs from green toward amber.
 * Hovering a flag (or a finding row) links the two - mirroring the real
 * "Find in text" feature. Everything is real DOM, so it's crisp at any size.
 */

type Run = { t: string; fid?: string };
const P = (t: string): Run => ({ t });
const F = (fid: string, t: string): Run => ({ t, fid });

const BODY: Run[][] = [
  [P("Hi there,")],
  [
    P("I wanted to reach out about a "),
    F("guaranteed", "Guaranteed"),
    P(" opportunity to increase your revenue by 100%."),
  ],
  [F("limited", "Limited time"), P(" offer - our seats are filling up rather quickly!")],
  [P("It's about our system that can increase profit by 100% in the next 3 months.")],
  [P("Every client we work with is absolutely thrilled with the results.")],
  [F("clickhere", "Click here"), P(" to mark your seat: https://get-more-leads.co")],
  [P("It's free, "), F("norisk", "no risk"), P(" and no obligation!!")],
  [P("Best regards,")],
  [P("Ivo")],
];

type Finding = { id: string; pen: number; msg: string; tag: string };
const FINDINGS: Finding[] = [
  { id: "guaranteed", pen: 8, msg: "“Guaranteed” is a known spam-trigger phrase", tag: "trigger" },
  { id: "limited", pen: 6, msg: "“Limited time” reads like a sales blast", tag: "trigger" },
  { id: "clickhere", pen: 6, msg: "“Click here” is a known spam-trigger phrase", tag: "trigger" },
  { id: "norisk", pen: 6, msg: "“no risk” is a known spam-trigger phrase", tag: "trigger" },
  { id: "unsub", pen: 7, msg: "Reads like outreach but has no unsubscribe line", tag: "hygiene" },
];

const TARGET = 48; // final spam-risk score
const STAGGER = 0.55; // seconds between each flag

function band(s: number) {
  if (s >= 60) return { label: "SPAM", color: "#e24d34", dot: "#e24d34" };
  if (s >= 30) return { label: "RISKY", color: "#d98a1f", dot: "#f4a52b" };
  return { label: "INBOX", color: "#2fa46a", dot: "#2fa46a" };
}

const TAG_STYLE: Record<string, { bg: string; fg: string }> = {
  trigger: { bg: "#ffe0d8", fg: "#d94a26" },
  hygiene: { bg: "#fbeccd", fg: "#b9791a" },
};

export function FlagDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [revealed, setRevealed] = useState(0);
  const [score, setScore] = useState(0);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= FINDINGS.length) clearInterval(id);
    }, STAGGER * 1000);
    const controls = animate(0, TARGET, {
      duration: FINDINGS.length * STAGGER,
      ease: "easeOut",
      onUpdate: (v: number) => setScore(Math.round(v)),
    });
    return () => {
      clearInterval(id);
      controls.stop();
    };
  }, [inView]);

  const done = revealed >= FINDINGS.length;
  const b = band(score);
  const revealedIds = new Set(FINDINGS.slice(0, revealed).map((f) => f.id));

  return (
    <section id="in-gmail" className="bg-grain relative overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-coral">
            See it inside Gmail
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            It flags spam as you write.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            HitSend reads your draft against the rules real spam filters use and
            flags exactly what puts you at risk - live, as you type.{" "}
            <span className="font-semibold text-ink">Hover a flag</span> to spot
            it in the email.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            ref={ref}
            className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-line bg-paper shadow-lift"
          >
            {/* browser chrome */}
            <div className="flex items-center gap-2 border-b border-line bg-cream-deep/60 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 hidden rounded-md bg-paper px-3 py-1 text-xs font-medium text-muted shadow-soft sm:inline">
                mail.google.com
              </span>
            </div>

            <div className="grid md:grid-cols-[1.55fr_1fr]">
              {/* ---- Gmail compose ---- */}
              <div className="flex flex-col border-b border-line bg-white md:border-b-0 md:border-r">
                <div className="bg-[#404040] px-4 py-2 text-sm font-semibold text-white">
                  New Message
                </div>
                <div className="border-b border-line px-4 py-2 text-sm text-muted">
                  To: alex@northwind.co
                </div>
                <div className="border-b border-line px-4 py-2 text-sm font-semibold text-ink">
                  Action towards Profit Increase
                </div>

                {/* body with scan sweep */}
                <div className="relative min-h-[300px] flex-1 px-4 py-4 text-[15px] leading-7 text-ink">
                  {BODY.map((line, li) => (
                    <p key={li} className={line.length === 1 && line[0].t === "" ? "h-4" : "mb-2"}>
                      {line.map((run, ri) => {
                        if (!run.fid) return <span key={ri}>{run.t}</span>;
                        const shown = revealedIds.has(run.fid);
                        const isActive = active === run.fid;
                        return (
                          <mark
                            key={ri}
                            onMouseEnter={() => shown && setActive(run.fid!)}
                            onMouseLeave={() => setActive((a) => (a === run.fid ? null : a))}
                            className="rounded-[3px] px-0.5 transition-all duration-500"
                            style={{
                              backgroundColor: shown
                                ? isActive
                                  ? "#f0603a"
                                  : "#ffd0c2"
                                : "transparent",
                              color: isActive ? "#fff" : "inherit",
                              boxShadow: isActive ? "0 0 0 2px rgba(240,96,58,.35)" : "none",
                              cursor: shown ? "pointer" : "text",
                            }}
                          >
                            {run.t}
                          </mark>
                        );
                      })}
                    </p>
                  ))}

                  {inView && !done && (
                    <motion.div
                      className="pointer-events-none absolute inset-x-0 h-10"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent, rgba(240,96,58,.14), transparent)",
                        borderTop: "1px solid rgba(240,96,58,.55)",
                      }}
                      initial={{ top: "-12%", opacity: 0 }}
                      animate={{ top: "104%", opacity: [0, 1, 1, 0] }}
                      transition={{ duration: FINDINGS.length * STAGGER, ease: "easeInOut" }}
                    />
                  )}
                </div>

                {/* toolbar */}
                <div className="flex items-center gap-3 border-t border-line px-4 py-3">
                  <span className="rounded-full bg-[#0b57d0] px-5 py-2 text-sm font-semibold text-white">
                    Send
                  </span>
                  <span
                    className="inline-flex items-center gap-2 rounded-full border bg-paper px-3 py-1.5 text-sm font-bold shadow-soft transition-colors duration-500"
                    style={{ borderColor: b.color }}
                  >
                    <span
                      className="h-2 w-2 rounded-full transition-colors duration-500"
                      style={{ background: b.dot }}
                    />
                    <span className="tabular-nums" style={{ color: b.color }}>
                      {score}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-muted">{b.label}</span>
                  </span>
                </div>
              </div>

              {/* ---- HitSend panel ---- */}
              <div className="bg-cream p-5">
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-display text-4xl font-extrabold tabular-nums transition-colors duration-500"
                    style={{ color: b.color }}
                  >
                    {score}
                  </span>
                  <span className="text-lg font-bold text-muted">/100</span>
                  {score > 0 && (
                    <span
                      className="ml-1 text-sm font-bold uppercase tracking-wider transition-colors duration-500"
                      style={{ color: b.color }}
                    >
                      {b.label}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Spam-risk score · lower is better
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  {done
                    ? "A few things could tip this into spam."
                    : "Checking your draft against filter rules…"}
                </p>

                <div className="mt-4 mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">
                  {!done && (
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-coral"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                    />
                  )}
                  <span>{done ? `${FINDINGS.length} issues found` : "Scanning…"}</span>
                </div>

                <div className="space-y-1">
                  {FINDINGS.slice(0, revealed).map((f) => {
                    const ts = TAG_STYLE[f.tag];
                    const isActive = active === f.id;
                    const locatable = f.id !== "unsub";
                    return (
                      <motion.div
                        key={f.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        onMouseEnter={() => locatable && setActive(f.id)}
                        onMouseLeave={() => setActive((a) => (a === f.id ? null : a))}
                        className="flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors"
                        style={{
                          background: isActive ? "var(--cream-deep)" : "transparent",
                          cursor: locatable ? "pointer" : "default",
                        }}
                      >
                        <span
                          className="mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums"
                          style={{ background: ts.bg, color: ts.fg }}
                        >
                          −{f.pen}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] leading-snug text-ink">{f.msg}</p>
                          <p className="text-[10.5px] uppercase tracking-wide text-muted">
                            {f.tag}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center gap-1.5 border-t border-line pt-3 text-[11px] text-muted">
                  <span>🔒</span>
                  <span>
                    Runs privately in your browser · <b className="text-ink-soft">HitSend</b>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <p className="mt-4 text-center text-sm text-muted">
          Real rules, running live. Your email never leaves the browser.
        </p>
      </div>
    </section>
  );
}
