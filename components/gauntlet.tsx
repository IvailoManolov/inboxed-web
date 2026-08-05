"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import {
  Mail,
  Link2,
  CaseUpper,
  Type,
  Inbox,
  Check,
  X,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 * The Gauntlet — an email docks at each spam-filter gate, the gate
 * expands and analyzes, a spam score climbs (67 → 74 → 78), then one
 * click fixes everything and it's SENT into the inbox, all green.
 * ------------------------------------------------------------------ */

type GateState = "idle" | "bad" | "good";

const GATES = [
  { id: "words", label: "Spam words", Icon: Type, left: 30 },
  { id: "links", label: "Link overload", Icon: Link2, left: 50 },
  { id: "caps", label: "ALL CAPS", Icon: CaseUpper, left: 70 },
] as const;

const START_LEFT = 8;
const INBOX_LEFT = 91;

type Phase =
  | "intro"
  | "dock1"
  | "scan1"
  | "dock2"
  | "scan2"
  | "dock3"
  | "scan3"
  | "fixing"
  | "sent";

const TIMELINE: { id: Phase; dur: number }[] = [
  { id: "intro", dur: 1100 },
  { id: "dock1", dur: 700 },
  { id: "scan1", dur: 950 },
  { id: "dock2", dur: 700 },
  { id: "scan2", dur: 950 },
  { id: "dock3", dur: 700 },
  { id: "scan3", dur: 1050 },
  { id: "fixing", dur: 1300 },
  { id: "sent", dur: 1900 },
];

const CAPTION: Record<Phase, string> = {
  intro: "Watching you write…",
  dock1: "Analyzing the subject line…",
  scan1: 'Spam word: “GUARANTEED”',
  dock2: "Analyzing your links…",
  scan2: "3 links in a short email",
  dock3: "Analyzing formatting…",
  scan3: "ALL CAPS + urgency phrases",
  fixing: "Fixing all 3 — one click",
  sent: "Sent — landed in the inbox",
};

function activeGate(phase: Phase): number {
  switch (phase) {
    case "dock1":
    case "scan1":
      return 0;
    case "dock2":
    case "scan2":
      return 1;
    case "dock3":
    case "scan3":
      return 2;
    default:
      return -1;
  }
}

const ANALYZING: Phase[] = ["dock1", "dock2", "dock3"];

function gatesFor(phase: Phase): GateState[] {
  switch (phase) {
    case "intro":
    case "dock1":
      return ["idle", "idle", "idle"];
    case "scan1":
    case "dock2":
      return ["bad", "idle", "idle"];
    case "scan2":
    case "dock3":
      return ["bad", "bad", "idle"];
    case "scan3":
      return ["bad", "bad", "bad"];
    default:
      return ["good", "good", "good"];
  }
}

function envelopeLeft(phase: Phase): number {
  switch (phase) {
    case "intro":
      return START_LEFT;
    case "dock1":
    case "scan1":
      return GATES[0].left;
    case "dock2":
    case "scan2":
      return GATES[1].left;
    case "dock3":
    case "scan3":
    case "fixing":
      return GATES[2].left;
    case "sent":
      return INBOX_LEFT;
  }
}

function scoreFor(phase: Phase): number {
  switch (phase) {
    case "intro":
    case "dock1":
      return 0;
    case "scan1":
    case "dock2":
      return 67;
    case "scan2":
    case "dock3":
      return 74;
    case "scan3":
      return 78;
    default:
      return 19;
  }
}

function bandColor(score: number) {
  if (score >= 60)
    return { fg: "var(--danger)", soft: "var(--danger-soft)", label: "Spam" };
  if (score >= 30)
    return { fg: "var(--amber)", soft: "#fdf0d9", label: "Risky" };
  return { fg: "var(--green)", soft: "var(--green-soft)", label: "Inbox" };
}

function AnimatedScore({ target }: { target: number }) {
  const mv = useMotionValue(target);
  const [value, setValue] = useState(target);
  useEffect(() => {
    const controls = animate(mv, target, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, mv]);
  return <>{value}</>;
}

export default function Gauntlet() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(
      () => setI((p) => (p + 1) % TIMELINE.length),
      TIMELINE[i].dur,
    );
    return () => clearTimeout(t);
  }, [i, reduced]);

  const phase: Phase = reduced ? "sent" : TIMELINE[i].id;
  const gates = gatesFor(phase);
  const score = scoreFor(phase);
  const band = bandColor(score);
  const analyzing = ANALYZING.includes(phase);
  const active = activeGate(phase);
  const sent = phase === "sent";
  const clean = phase === "fixing" || phase === "sent";

  return (
    <div className="relative w-full rounded-[var(--radius-2xl)] border border-line bg-paper p-5 shadow-soft sm:p-7">
      {/* header row */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-coral" />
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-muted">
            Live check
          </span>
        </div>

        {/* score badge — fixed size so swapping states never resizes the pill */}
        <div
          className="relative flex h-9 w-[140px] items-center justify-center rounded-full transition-colors duration-500"
          style={{ background: score === 0 ? "var(--cream-deep)" : band.soft }}
        >
          <AnimatePresence mode="wait">
            {analyzing ? (
              <motion.span
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-soft"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing…
              </motion.span>
            ) : score === 0 ? (
              <motion.span
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center gap-2"
              >
                <span className="font-mono text-lg font-bold text-muted">—</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Ready
                </span>
              </motion.span>
            ) : (
              <motion.span
                key="score"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center gap-2"
              >
                <span
                  className="font-mono text-lg font-bold tabular-nums"
                  style={{ color: band.fg }}
                >
                  <AnimatedScore target={score} />
                </span>
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: band.fg }}
                >
                  {band.label}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* the rail */}
      <div className="relative h-[210px] sm:h-[230px]">
        {/* base rail line */}
        <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-cream-deep" />
        {/* green progress fill when clean */}
        <motion.div
          className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
          style={{ background: "var(--green)" }}
          animate={{
            width: sent ? `${INBOX_LEFT}%` : clean ? `${GATES[2].left}%` : "0%",
            opacity: clean ? 1 : 0,
          }}
          transition={{ duration: sent ? 1.3 : 0.5, ease: "easeInOut" }}
        />

        {/* gates */}
        {GATES.map((gate, idx) => {
          const state = gates[idx];
          const isBad = state === "bad";
          const isGood = state === "good";
          const isActive = active === idx;
          const stroke = isBad
            ? "var(--danger)"
            : isGood
              ? "var(--green)"
              : isActive
                ? "var(--coral)"
                : "var(--line)";
          const fill = isBad
            ? "var(--danger-soft)"
            : isGood
              ? "var(--green-soft)"
              : "var(--paper)";
          return (
            <div
              key={gate.id}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${gate.left}%` }}
            >
              {/* expanding pulse ring while analyzing */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    className="absolute left-1/2 top-1/2 -z-0 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-16 sm:w-16"
                    style={{ border: "2px solid var(--coral)" }}
                    initial={{ scale: 1, opacity: 0.7 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border-2 sm:h-16 sm:w-16"
                animate={{
                  borderColor: stroke,
                  backgroundColor: fill,
                  scale: isActive ? 1.14 : isBad ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 0.4,
                  delay: isGood ? idx * 0.16 : 0,
                }}
              >
                <gate.Icon
                  className="h-6 w-6 transition-colors duration-300"
                  style={{ color: stroke }}
                  strokeWidth={2.2}
                />
                <AnimatePresence>
                  {(isBad || isGood) && (
                    <motion.span
                      key={state}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ delay: isGood ? idx * 0.16 : 0 }}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-paper"
                      style={{
                        background: isBad ? "var(--danger)" : "var(--green)",
                      }}
                    >
                      {isBad ? (
                        <X className="h-3 w-3" strokeWidth={3} />
                      ) : (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      )}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* label pinned below the circle (doesn't shift centering) */}
              <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-muted sm:text-xs">
                {gate.label}
              </span>

              {/* floating score chip when this gate scored bad */}
              <AnimatePresence>
                {isBad && isActive && (
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg bg-danger px-2 py-1 font-mono text-xs font-bold text-paper shadow-lift"
                  >
                    {score} spam
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* inbox tray */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${INBOX_LEFT}%` }}
        >
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 sm:h-[4.5rem] sm:w-[4.5rem]"
            animate={{
              borderColor: sent ? "var(--green)" : "var(--line)",
              backgroundColor: sent ? "var(--green-soft)" : "var(--paper)",
              boxShadow: sent
                ? "0 0 0 8px rgba(47,164,106,0.12)"
                : "0 0 0 0px rgba(47,164,106,0)",
              scale: sent ? [1, 1.12, 1] : 1,
            }}
            transition={{ duration: 0.5 }}
          >
            <Inbox
              className="h-7 w-7 transition-colors duration-300"
              style={{ color: sent ? "var(--green)" : "var(--muted)" }}
              strokeWidth={2.2}
            />
          </motion.div>
          <span
            className="absolute left-1/2 top-full mt-3 -translate-x-1/2 text-[11px] font-semibold sm:text-xs"
            style={{ color: sent ? "var(--green)" : "var(--muted)" }}
          >
            Inbox
          </span>
        </div>

        {/* the travelling envelope */}
        <motion.div
          className="absolute top-1/2 z-20 -translate-y-1/2"
          initial={false}
          animate={{ left: `${envelopeLeft(phase)}%`, x: "-50%" }}
          transition={{
            left: {
              duration: sent ? 1.3 : 0.55,
              ease: sent ? "easeInOut" : "easeOut",
            },
          }}
        >
          <motion.div
            className="relative flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-lift sm:h-14 sm:w-14"
            animate={{
              borderColor: clean
                ? "var(--green)"
                : gates.some((g) => g === "bad")
                  ? "var(--danger)"
                  : "var(--coral)",
              backgroundColor: clean ? "var(--green-soft)" : "var(--paper)",
              scale: analyzing ? [1, 0.92, 1] : 1,
            }}
            transition={{
              scale: { duration: 0.7, repeat: analyzing ? Infinity : 0 },
              default: { duration: 0.4 },
            }}
          >
            <Mail
              className="h-6 w-6 transition-colors duration-300"
              style={{
                color: clean
                  ? "var(--green)"
                  : gates.some((g) => g === "bad")
                    ? "var(--danger)"
                    : "var(--coral)",
              }}
              strokeWidth={2.2}
            />
            {/* SENT stamp */}
            <AnimatePresence>
              {sent && (
                <motion.span
                  initial={{ scale: 1.6, opacity: 0, rotate: -12 }}
                  animate={{ scale: 1, opacity: 1, rotate: -12 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 rounded-md border-2 border-green px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-green"
                  style={{ background: "rgba(226,244,234,0.95)" }}
                >
                  Sent
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* caption */}
      <div className="mt-6 h-6 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={CAPTION[phase]}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium"
            style={{
              color: sent
                ? "var(--green)"
                : gates.some((g) => g === "bad")
                  ? "var(--danger)"
                  : "var(--ink-soft)",
            }}
          >
            {CAPTION[phase]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
