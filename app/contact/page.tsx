"use client";

import { useState } from "react";
import { Loader2, Send, Check, Users, ShieldCheck, Zap } from "lucide-react";

const POINTS = [
  { Icon: Users, text: "Team billing, shared rule presets, and seats" },
  { Icon: Zap, text: "Volume pricing for agencies sending at scale" },
  { Icon: ShieldCheck, text: "Priority support, straight from the makers" },
];

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name, message }),
      });
      if (res.ok) {
        setState("success");
        return;
      }
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Something went wrong. Please try again.");
      setState("idle");
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setState("idle");
    }
  }

  return (
    <main className="bg-grain flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <a
        href="/"
        className="mb-8 font-display text-lg font-extrabold tracking-tight text-ink"
      >
        HitSend
      </a>

      <div className="grid w-full max-w-4xl overflow-hidden rounded-[var(--radius-2xl)] border border-line bg-paper shadow-lift md:grid-cols-2">
        {/* Left: pitch */}
        <div className="border-b border-line bg-cream/60 p-8 md:border-b-0 md:border-r">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-coral-deep shadow-soft">
            Talk to us
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink">
            Let&apos;s get your team seen.
          </h1>
          <p className="mt-3 text-ink-soft">
            Sending at scale, or want something custom? Leave your email and
            we&apos;ll reach out — a real person, not a drip sequence.
          </p>

          <ul className="mt-7 space-y-4">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-coral-soft text-coral">
                  <p.Icon className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span className="text-ink-soft">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form / success */}
        <div className="p-8">
          {state === "success" ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-soft">
                <Check className="h-7 w-7 text-green" strokeWidth={3} />
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-ink">
                Got it — thank you!
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                We&apos;ll be in touch at{" "}
                <span className="font-medium text-ink">{email}</span> soon.
              </p>
              <a
                href="/"
                className="mt-8 rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft transition hover:bg-cream-deep"
              >
                Back to home
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <h2 className="font-display text-xl font-bold text-ink">
                Send us a note
              </h2>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink-soft">
                  Email <span className="text-coral">*</span>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  placeholder="you@company.com"
                  className="rounded-[var(--radius-xl)] border border-line bg-paper px-4 py-3 text-ink outline-none transition focus:border-coral focus:ring-1 focus:ring-coral"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink-soft">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  placeholder="Your name"
                  className="rounded-[var(--radius-xl)] border border-line bg-paper px-4 py-3 text-ink outline-none transition focus:border-coral focus:ring-1 focus:ring-coral"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink-soft">
                  What do you need? <span className="text-muted">(optional)</span>
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.currentTarget.value)}
                  rows={4}
                  placeholder="Tell us a little about your team or use case…"
                  className="resize-none rounded-[var(--radius-xl)] border border-line bg-paper px-4 py-3 text-ink outline-none transition focus:border-coral focus:ring-1 focus:ring-coral"
                />
              </label>

              {error && (
                <p className="rounded-[var(--radius-xl)] border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-ink-soft">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={state === "submitting"}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3.5 font-semibold text-paper shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-coral-deep disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send
                  </>
                )}
              </button>

              <p className="text-center text-xs text-muted">
                One message per email — we&apos;ll only reach out about your
                inquiry.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
