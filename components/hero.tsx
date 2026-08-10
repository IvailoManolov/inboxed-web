"use client";

import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";
import Gauntlet from "./gauntlet";

export function Hero() {
  return (
    <section id="top" className="bg-grain relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            No AI guesswork — just the rules spam filters actually use
          </span>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Your best cold email is
            <br className="hidden sm:block" />{" "}
            <span className="relative whitespace-nowrap text-coral">
              worthless in spam.
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M2 8C60 3 120 3 180 6C220 8 260 9 298 4"
                  stroke="var(--amber)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: 0.5, ease: "easeInOut" }}
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Inboxed checks every email before you hit send, flags exactly what
            trips spam filters, and shows you the one-click fix. Land in the
            inbox — not the folder no one opens.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#try"
              className="group inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-base font-semibold text-paper shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-coral-deep"
            >
              Check my email — free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-6 py-3 text-base font-semibold text-ink transition-colors hover:bg-cream-deep"
            >
              See how it works
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-coral" /> Free for 7 days — no
              credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber" /> Instant, runs as you type
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-green" /> Your emails never
              leave your browser
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-10 max-w-3xl"
        >
          <Gauntlet />
        </motion.div>
      </div>
    </section>
  );
}
