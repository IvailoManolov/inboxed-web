"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { animate, motion, useInView } from "motion/react";
import { ChevronsLeftRight } from "lucide-react";
import { Reveal } from "./reveal";

/**
 * Before/After comparison slider showing the SAME cold email inside Gmail
 * before Inboxed (score 48, RISKY / red) and after its fixes (score 9,
 * INBOX / green). Drag the handle to wipe between them.
 *
 * UX notes:
 * - On first scroll-into-view it auto-sweeps once, so it's obvious the
 *   handle is draggable. The sweep cancels the instant the user grabs it.
 * - Pointer events cover mouse + touch; arrow keys move it too (a11y).
 */
export function BeforeAfter() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-120px" });

  const [pos, setPos] = useState(58); // % of width showing the "before" side
  const [dragging, setDragging] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const demoRef = useRef<ReturnType<typeof animate> | null>(null);

  const clamp = (p: number) => Math.max(3, Math.min(97, p));

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(clamp(((clientX - r.left) / r.width) * 100));
  }, []);

  const stopDemo = useCallback(() => {
    demoRef.current?.stop();
    demoRef.current = null;
    if (!interacted) setInteracted(true);
  }, [interacted]);

  // Auto-demo sweep the first time the slider scrolls into view.
  useEffect(() => {
    if (!inView || interacted) return;
    const controls = animate(58, [82, 22, 50], {
      duration: 3,
      delay: 0.35,
      ease: "easeInOut",
      onUpdate: (v: number) => setPos(v),
    });
    demoRef.current = controls;
    return () => controls.stop();
  }, [inView, interacted]);

  const onPointerDown = (e: ReactPointerEvent) => {
    stopDemo();
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (dragging) setFromClientX(e.clientX);
  };
  const onPointerUp = () => setDragging(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    stopDemo();
    setPos((p) => clamp(p + (e.key === "ArrowRight" ? 4 : -4)));
  };

  return (
    <section id="in-gmail" className="bg-grain relative overflow-hidden py-20 sm:py-28">
      <div ref={sectionRef} className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-coral">
            See it inside Gmail
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            Watch a spammy draft turn inbox-safe.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            Same email, before and after Inboxed&rsquo;s fixes.{" "}
            <span className="font-semibold text-ink">Drag the handle</span> and
            watch the score fall from red to green.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto mt-12 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-lift">
            {/* fake browser chrome */}
            <div className="flex items-center gap-2 border-b border-line bg-cream-deep/60 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 hidden rounded-md bg-paper px-3 py-1 text-xs font-medium text-muted shadow-soft sm:inline">
                mail.google.com
              </span>
            </div>

            {/* comparison surface */}
            <div
              ref={wrapRef}
              role="slider"
              aria-label="Drag to compare the email before and after Inboxed's fixes"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pos)}
              tabIndex={0}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onKeyDown={onKeyDown}
              className="relative aspect-[4/3] w-full touch-none select-none outline-none [cursor:ew-resize] focus-visible:ring-4 focus-visible:ring-coral/40"
            >
              {/* base: AFTER (green / inbox-safe) */}
              <img
                src="/demo/after.png"
                alt="The same email after Inboxed's fixes, scoring 9 — Inbox"
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />
              {/* overlay: BEFORE (red / risky), clipped to the left of the handle */}
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
              >
                <img
                  src="/demo/before.png"
                  alt="A spammy cold email before Inboxed, scoring 48 — Risky"
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
              </div>

              {/* corner labels */}
              <span
                className="pointer-events-none absolute left-3 top-3 rounded-full bg-coral px-3 py-1 text-xs font-bold uppercase tracking-wide text-paper shadow-lift transition-opacity"
                style={{ opacity: pos > 12 ? 1 : 0.25 }}
              >
                Before
              </span>
              <span
                className="pointer-events-none absolute right-3 top-3 rounded-full bg-green px-3 py-1 text-xs font-bold uppercase tracking-wide text-paper shadow-lift transition-opacity"
                style={{ opacity: pos < 88 ? 1 : 0.25 }}
              >
                After
              </span>

              {/* divider + handle */}
              <div
                className="pointer-events-none absolute inset-y-0"
                style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
              >
                <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-paper shadow-[0_0_0_1px_rgba(36,31,24,0.12)]" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  {/* pulse ring — a "grab me" cue until first interaction */}
                  {!interacted && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-coral/40"
                      animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-paper text-ink shadow-lift ring-1 ring-line">
                    <ChevronsLeftRight className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* drag hint, fades after first interaction */}
              <motion.div
                className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-cream backdrop-blur"
                animate={{ opacity: interacted ? 0 : 1, y: interacted ? 6 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ← Drag to compare →
              </motion.div>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-muted">
            Real screenshots. Inboxed runs entirely in your browser — nothing is sent to a server.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
