"use client";

import { motion } from "motion/react";
import { Reveal } from "./reveal";

/* Founder-story section: a human, first-person origin note beside an animated
 * "journey" chart. The chart is anchored honestly to the two endpoints the
 * founder stands behind ("a handful" -> "1,000+"), showing the shape of the
 * journey rather than inventing precise datapoints. */

function JourneyChart() {
  const line =
    "M40,184 C95,183 135,185 178,176 C230,164 270,112 322,82 C346,68 368,54 384,44";
  const area = `${line} L384,204 L40,204 Z`;

  return (
    <svg
      viewBox="0 0 400 240"
      className="h-auto w-full"
      role="img"
      aria-label="My signups over time: flat at first, then climbing past 1,000 after I started checking every email before sending."
    >
      <defs>
        <linearGradient id="journeyFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--green-soft)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--green-soft)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* baseline */}
      <line x1="40" y1="204" x2="384" y2="204" stroke="var(--line)" strokeWidth="1" />

      {/* filled area under the curve */}
      <motion.path
        d={area}
        fill="url(#journeyFill)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.6 }}
      />

      {/* the moment everything changed */}
      <motion.line
        x1="178"
        y1="40"
        x2="178"
        y2="204"
        stroke="var(--muted)"
        strokeWidth="1"
        strokeDasharray="4 3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 1 }}
      />

      {/* the growth line */}
      <motion.path
        d={line}
        fill="none"
        stroke="var(--coral)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* inflection + endpoint dots */}
      <motion.circle
        cx="178"
        cy="176"
        r="3.5"
        fill="var(--coral)"
        stroke="var(--paper)"
        strokeWidth="1.5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 1.05 }}
      />
      <motion.circle
        cx="384"
        cy="44"
        r="4"
        fill="var(--coral)"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 1.3 }}
      />

      {/* labels */}
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 1.2 }}
        style={{ fontFamily: "inherit" }}
      >
        <text x="44" y="170" fontSize="10" fill="var(--ink-soft)">
          a handful
        </text>
        <text
          x="380"
          y="62"
          fontSize="11"
          fontWeight="700"
          textAnchor="end"
          fill="var(--coral-deep)"
        >
          1,000+ signups
        </text>
        <text x="178" y="24" fontSize="9" textAnchor="middle" fill="var(--ink-soft)">
          started checking
        </text>
        <text x="178" y="34" fontSize="9" textAnchor="middle" fill="var(--ink-soft)">
          every email
        </text>
        <text x="212" y="222" fontSize="9" textAnchor="middle" fill="var(--muted)">
          time
        </text>
      </motion.g>
    </svg>
  );
}

export function FounderStory() {
  return (
    <section id="story" className="border-y border-line bg-cream-deep/40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-coral">
            From the founder
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            I built this because my own emails kept vanishing.
          </h2>
          <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-soft">
            <p>
              A while back I started my first company,{" "}
              <a
                href="https://clashy.net"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-coral underline underline-offset-2 hover:text-coral-deep"
              >
                Clashy
              </a>
              . I did what everyone says to do - I cold emailed. A lot. And I got…
              nothing. No replies, no bounces, no clue why. My emails weren&apos;t
              being ignored. They were never being seen - quietly sent to spam.
            </p>
            <p>
              I almost quit. Instead I changed one thing: I stopped guessing and
              started learning what actually trips Gmail&apos;s filters - the
              words, the links, the rules Google publishes but nobody reads. I
              built a little tool to check my drafts before I hit send.
            </p>
            <p>
              That one change moved everything. Clashy went from a handful of
              signups to over a thousand. Same product, same me - the emails just
              finally started landing.
            </p>
            <p>
              I&apos;m still building, honestly. HitSend is that tool, cleaned up
              so you don&apos;t have to learn this the hard way like I did. If your
              emails feel like they&apos;re disappearing into a void - they
              probably are. Let&apos;s fix that.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-coral-soft font-display text-lg font-bold text-coral-deep">
              I
            </span>
            <p className="text-sm text-ink-soft">
              <span className="font-semibold text-ink">Ivo</span> - founder ·{" "}
              <a
                href="https://clashy.net"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-coral underline underline-offset-2 hover:text-coral-deep"
              >
                clashy.net
              </a>
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <figure className="rounded-[var(--radius-2xl)] border border-line bg-paper p-6 shadow-lift">
            <JourneyChart />
            <figcaption className="mt-4 text-center text-sm text-ink-soft">
              My own signups - before and after I started respecting the rules.
              Same product, same me.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
