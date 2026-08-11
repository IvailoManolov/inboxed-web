"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Check, ShieldCheck, Lock, Sparkles, Loader2, PartyPopper } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { connectExtension, fetchProStatus, type HandoffState } from "@/lib/extension";
import { PRICE_LABEL } from "@/lib/config";

const FEATURES = [
  "One-click fixes on every flagged phrase",
  "The full findings list, not just the top 5",
  "Unlimited checks — no trial expiry",
  "100% private — no email content ever leaves your browser",
];

function UpgradeInner() {
  const params = useSearchParams();
  const extId = params.get("ext_id") ?? undefined;
  const canceled = params.get("canceled") === "1";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  // Pro status of the signed-in user: null = still checking (Stripe read).
  const [pro, setPro] = useState<boolean | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectState, setConnectState] = useState<HandoffState>("idle");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      setLoading(false);
      // Only paying users matter here; check entitlement once we know who they are.
      if (data.user) setPro(await fetchProStatus());
    });
  }, []);

  async function connect() {
    setConnecting(true);
    setConnectState(await connectExtension(extId));
    setConnecting(false);
  }

  const nextPath = `/upgrade${extId ? `?ext_id=${encodeURIComponent(extId)}` : ""}`;

  async function signIn() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
  }

  async function checkout() {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ extId }),
      });
      const { url } = (await res.json()) as { url?: string };
      if (url) window.location.href = url;
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  }

  return (
    <main className="bg-grain flex min-h-screen flex-col items-center justify-center px-5 py-16">
      <a
        href="/"
        className="mb-8 font-display text-lg font-extrabold tracking-tight text-ink"
      >
        Inboxed
      </a>

      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-coral-deep shadow-soft">
            <Sparkles className="h-3.5 w-3.5" /> Inboxed Pro
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink">
            {pro ? "You're already Pro 🎉" : "Keep the full spam checker"}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-ink-soft">
            {pro
              ? extId
                ? "Connect the extension to unlock Pro in Gmail — no need to pay again."
                : "Your subscription is active. Manage it any time."
              : "Score, every flagged phrase, and one-click fixes on every draft — for less than one recovered reply a month."}
          </p>
        </div>

        {canceled && (
          <p className="mt-6 rounded-[var(--radius-xl)] border border-amber/30 bg-amber/10 px-4 py-3 text-center text-sm text-ink-soft">
            Checkout canceled — no charge was made. You can try again any time.
          </p>
        )}

        <div className="mt-8 rounded-[var(--radius-2xl)] border border-line bg-paper p-8 shadow-lift">
          {pro !== true && (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-extrabold text-ink">
                  {PRICE_LABEL}
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-soft">
                      <Check className="h-3.5 w-3.5 text-green" strokeWidth={3} />
                    </span>
                    <span className="text-ink-soft">{f}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className={pro === true ? "" : "mt-8"}>
            {loading || (user && pro === null) ? (
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ink/10 py-3.5 font-medium text-ink-soft"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                {loading ? "Loading…" : "Checking your subscription…"}
              </button>
            ) : !user ? (
              <button
                onClick={signIn}
                className="flex w-full items-center justify-center gap-2.5 rounded-full border border-line bg-paper py-3.5 font-semibold text-ink shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-cream-deep"
              >
                <GoogleGlyph /> Sign in with Google to continue
              </button>
            ) : pro ? (
              // Already Pro — never route a paying user back through checkout.
              extId ? (
                connectState === "sent" ? (
                  <div className="rounded-[var(--radius-xl)] border border-green/20 bg-green-soft px-4 py-3.5 text-center text-sm font-medium text-green">
                    ✓ Connected. Head back to Gmail — Pro is unlocked.
                  </div>
                ) : (
                  <>
                    <button
                      onClick={connect}
                      disabled={connecting}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3.5 font-semibold text-paper shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-coral-deep disabled:translate-y-0 disabled:opacity-60"
                    >
                      {connecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Connecting…
                        </>
                      ) : (
                        "Connect extension"
                      )}
                    </button>
                    {connectState === "unavailable" && (
                      <p className="mt-3 text-center text-xs text-ink-soft">
                        Couldn&apos;t reach the extension. Make sure Inboxed is
                        installed in this browser, then try again.
                      </p>
                    )}
                  </>
                )
              ) : (
                <a
                  href="/account"
                  className="flex w-full items-center justify-center rounded-full bg-coral py-3.5 font-semibold text-paper shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-coral-deep"
                >
                  Manage subscription
                </a>
              )
            ) : (
              <button
                onClick={checkout}
                disabled={busy}
                className="w-full rounded-full bg-coral py-3.5 font-semibold text-paper shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-coral-deep disabled:translate-y-0 disabled:opacity-60"
              >
                {busy ? "Redirecting to checkout…" : `Go Pro — ${PRICE_LABEL}`}
              </button>
            )}
          </div>

          {user && (
            <p className="mt-4 text-center text-xs text-muted">
              {pro && (
                <span className="mr-1 inline-flex items-center gap-1 font-semibold text-green">
                  <PartyPopper className="h-3.5 w-3.5" /> You&apos;re Pro ·
                </span>
              )}
              Signed in as <span className="font-medium text-ink-soft">{user.email}</span>
            </p>
          )}
        </div>

        {pro !== true && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-green" /> Secure checkout by Stripe
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-coral" /> Cancel anytime
            </span>
          </div>
        )}
      </div>
    </main>
  );
}

/** Google "G" mark, inlined so the button needs no extra asset. */
function GoogleGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.67 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={null}>
      <UpgradeInner />
    </Suspense>
  );
}
