"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PRICE_LABEL } from "@/lib/config";

function UpgradeInner() {
  const params = useSearchParams();
  const extId = params.get("ext_id") ?? undefined;
  const canceled = params.get("canceled") === "1";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-ink">Upgrade to Inboxed Pro</h1>
      <p className="mt-3 text-ink-soft">
        Unlock one-click fixes and the full findings list on every draft — unlimited.
      </p>

      {canceled && (
        <p className="mt-4 rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900">
          Checkout canceled — no charge was made. You can try again any time.
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-line bg-paper p-6">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-ink">{PRICE_LABEL}</span>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-ink-soft">
          <li>✓ One-click fixes on every flagged phrase</li>
          <li>✓ Full findings list (not just the top 5)</li>
          <li>✓ Unlimited checks — no daily cap</li>
          <li>✓ 100% private — no email content ever leaves your browser</li>
        </ul>

        <div className="mt-6">
          {loading ? (
            <button
              disabled
              className="w-full rounded-xl bg-ink/10 py-3 font-medium text-ink-soft"
            >
              Loading…
            </button>
          ) : user ? (
            <button
              onClick={checkout}
              disabled={busy}
              className="w-full rounded-xl bg-coral py-3 font-semibold text-white transition hover:bg-coral-deep disabled:opacity-60"
            >
              {busy ? "Redirecting to checkout…" : `Go Pro — ${PRICE_LABEL}`}
            </button>
          ) : (
            <button
              onClick={signIn}
              className="w-full rounded-xl bg-ink py-3 font-semibold text-white transition hover:bg-ink/90"
            >
              Sign in with Google to continue
            </button>
          )}
        </div>

        {user && (
          <p className="mt-3 text-center text-xs text-muted">Signed in as {user.email}</p>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Secure checkout by Stripe. Cancel anytime.
      </p>
    </main>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={null}>
      <UpgradeInner />
    </Suspense>
  );
}
