"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Mail, Link2, CaseUpper, Type, Inbox, Check, X } from "lucide-react";

/* ------------------------------------------------------------------ *
 * The Gauntlet — an email runs the spam-filter gauntlet, gets caught,
 * gets fixed in one click, then sails into the inbox. Loops forever.
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
  | "scan1"
  | "scan2"
  | "scan3"
  | "rejected"
  | "fixing"
  | "travel"
  | "landed";

const TIMELINE: { id: Phase; dur: number }[] = [
  { id: "intro", dur: 1100 },
  { id: "scan1", dur: 750 },
  { id: "scan2", dur: 750 },
  { id: "scan3", dur: 1050 },
  { id: "rejected", dur: 1150 },
  { id: "fixing", dur: 1300 },
  { id: "travel", dur: 1500 },
  { id: "landed", dur: 1700 },
];

const CAPTION: Record<Phase, string> = {
  intro: "Watching you write…",
  scan1: "Scanning for spam triggers",
  scan2: "Scanning for spam triggers",
  scan3: "3 issues found",
  rejected: "This one's headed for spam",
  fixing: "Fixing all 3 — one click",
  travel: "Clean. Sending…",
  landed: "Landed in the inbox",
};

function gatesFor(phase: Phase): GateState[] {
  switch (phase) {
    case "intro":
      return ["idle", "idle", "idle"];
    case "scan1":
      return ["bad", "idle", "idle"];
    case "scan2":
      return ["bad", "bad", "idle"];
    case "scan3":
    case "rejected":
      return ["bad", "bad", "bad"];
    default:
      return ["good", "good", "good"];
  }
}

function envelopeLeft(phase: Phase): number {
  switch (phase) {
    case "intro":
    case "rejected":
    case "fixing":
      return START_LEFT;
    case "scan1":
      return GATES[0].left;
    case "scan2":
      return GATES[1].left;
    case "scan3":
      return GATES[2].left;
    case "travel":
    case "landed":
      return INBOX_LEFT;
  }
}

function scoreFor(phase: Phase): number {
  switch (phase) {
    case "intro":
      return 0;
    case "scan1":
      return 61;
    case "scan2":
      return 72;
    case "scan3":
    case "rejected":
      return 78;
    default:
      return 19;
  }
}

function bandColor(score: number) {
  if (score >= 60) return { fg: "var(--danger)", soft: "var(--danger-soft)", label: "Spam" };
  if (score >= 30) return { fg: "var(--amber)", soft: "#fdf0d9", label: "Risky" };
  return { fg: "var(--green)", soft: "var(--green-soft)", label: "Inbox" };
}

function AnimatedScore({ target }: { target: number }) {
  const mv = useMotionValue(target);
  const [value, setValue] = useState(target);
  useEffect(() => {
    const controls = animate(mv, target, {
      duration: 0.7,
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

  const phase: Phase = reduced ? "landed" : TIMELINE[i].id;
  const gates = gatesFor(phase);
  const score = scoreFor(phase);
  const band = bandColor(score);
  const isTravel = phase === "travel";
  const landed = phase === "landed";
  const rejected = phase === "scan3" || phase === "rejected";

  return (
    <div className="relative w-full rounded-[var(--radius-2xl)] border border-line bg-paper p-5 shadow-soft sm:p-7">
      {/* header row */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-coral" />
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-muted">
            Live check
          </span>
        </div>

        {/* score badge */}
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors duration-500"
          style={{ background: band.soft }}
        >
          <span
            className="font-mono text-lg font-bold tabular-nums transition-colors duration-500"
            style={{ color: band.fg }}
          >
            {score === 0 ? "—" : <AnimatedScore target={score} />}
          </span>
          <span
            className="text-xs font-semibold uppercase tracking-wide transition-colors duration-500"
            style={{ color: band.fg }}
          >
            {score === 0 ? "Ready" : band.label}
          </span>
        </div>
      </div>

      {/* the rail */}
      <div className="relative h-[220px] sm:h-[240px]">
        {/* base rail line */}
        <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-cream-deep" />
        {/* progress fill on the rail (green when clean) */}
        <motion.div
          className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
          style={{ background: "var(--green)" }}
          animate={{
            width: isTravel || landed ? `${INBOX_LEFT}%` : "0%",
            opacity: isTravel || landed ? 1 : 0,
          }}
          transition={{ duration: isTravel ? 1.4 : 0.4, ease: "easeInOut" }}
        />

        {/* gates */}
        {GATES.map((gate, idx) => {
          const state = gates[idx];
          const isBad = state === "bad";
          const isGood = state === "good";
          const stroke = isBad
            ? "var(--danger)"
            : isGood
              ? "var(--green)"
              : "var(--line)";
          const fill = isBad
            ? "var(--danger-soft)"
            : isGood
              ? "var(--green-soft)"
              : "var(--paper)";
          return (
            <div
              key={gate.id}
              className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${gate.left}%` }}
            >
              <motion.div
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 sm:h-16 sm:w-16"
                animate={{
                  borderColor: stroke,
                  backgroundColor: fill,
                  scale: isBad ? [1, 1.12, 1] : 1,
                }}
                transition={{
                  duration: 0.45,
                  delay: isGood ? idx * 0.18 : 0,
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
                      transition={{ delay: isGood ? idx * 0.18 : 0 }}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-paper"
                      style={{ background: isBad ? "var(--danger)" : "var(--green)" }}
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
              <span className="mt-3 whitespace-nowrap text-[11px] font-medium text-muted sm:text-xs">
                {gate.label}
              </span>
            </div>
          );
        })}

        {/* inbox tray */}
        <div
          className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: `${INBOX_LEFT}%` }}
        >
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 sm:h-[4.5rem] sm:w-[4.5rem]"
            animate={{
              borderColor: landed ? "var(--green)" : "var(--line)",
              backgroundColor: landed ? "var(--green-soft)" : "var(--paper)",
              boxShadow: landed
                ? "0 0 0 8px rgba(47,164,106,0.12)"
                : "0 0 0 0px rgba(47,164,106,0)",
              scale: landed ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.5 }}
          >
            <Inbox
              className="h-7 w-7 transition-colors duration-300"
              style={{ color: landed ? "var(--green)" : "var(--muted)" }}
              strokeWidth={2.2}
            />
          </motion.div>
          <span
            className="mt-3 text-[11px] font-semibold sm:text-xs"
            style={{ color: landed ? "var(--green)" : "var(--muted)" }}
          >
            Inbox
          </span>
        </div>

        {/* the travelling envelope */}
        <motion.div
          className="absolute top-1/2 z-10"
          initial={false}
          animate={{
            left: `${envelopeLeft(phase)}%`,
            x: "-50%",
            y: rejected ? ["-50%", "-58%", "-50%"] : "-50%",
            rotate: rejected ? [0, -6, 6, -3, 0] : 0,
          }}
          transition={{
            left: { duration: isTravel ? 1.4 : 0.55, ease: isTravel ? "easeInOut" : "easeOut" },
            rotate: { duration: 0.5 },
            y: { duration: 0.5 },
          }}
        >
          <motion.div
            className="relative flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-lift sm:h-14 sm:w-14"
            animate={{
              borderColor:
                landed || isTravel ? "var(--green)" : rejected ? "var(--danger)" : "var(--coral)",
              backgroundColor:
                landed || isTravel ? "var(--green-soft)" : "var(--paper)",
            }}
            transition={{ duration: 0.4 }}
          >
            <Mail
              className="h-6 w-6 transition-colors duration-300"
              style={{
                color:
                  landed || isTravel
                    ? "var(--green)"
                    : rejected
                      ? "var(--danger)"
                      : "var(--coral)",
              }}
              strokeWidth={2.2}
            />
            {/* SPAM stamp */}
            <AnimatePresence>
              {rejected && (
                <motion.span
                  initial={{ scale: 1.6, opacity: 0, rotate: -14 }}
                  animate={{ scale: 1, opacity: 1, rotate: -14 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 rounded-md border-2 border-danger px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-danger"
                  style={{ background: "rgba(253,227,220,0.9)" }}
                >
                  Spam
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* caption */}
      <div className="mt-5 h-6 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={CAPTION[phase]}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium"
            style={{
              color: landed ? "var(--green)" : rejected ? "var(--danger)" : "var(--ink-soft)",
            }}
          >
            {CAPTION[phase]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
