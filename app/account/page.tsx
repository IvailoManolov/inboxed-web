"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    createSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        setUser(data.user);
        setLoading(false);
      });
  }, []);

  async function manage() {
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      if (res.ok) {
        const { url } = (await res.json()) as { url?: string };
        // Keep the button in its loading state through the redirect — resetting
        // busy here would flash the button back before the page navigates away.
        if (url) {
          window.location.href = url;
          return;
        }
        setMsg("Couldn't open the billing portal. Please try again.");
      } else if (res.status === 404) {
        setMsg("No active subscription found on this account.");
      } else {
        setMsg("Couldn't open the billing portal. Please try again.");
      }
    } catch {
      setMsg("Couldn't reach the billing portal. Please try again.");
    }
    setBusy(false);
  }

  async function signIn() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/account")}`,
      },
    });
  }

  async function signOut() {
    await createSupabaseBrowserClient().auth.signOut();
    setUser(null);
  }

  return (
    <main className="bg-grain flex min-h-screen flex-col items-center justify-center px-5 py-16">
      <a
        href="/"
        className="mb-8 font-display text-lg font-extrabold tracking-tight text-ink"
      >
        BeSeen
      </a>

      <div className="w-full max-w-md">
        <h1 className="text-center font-display text-3xl font-extrabold tracking-tight text-ink">
          Your account
        </h1>

        {loading ? (
          <p className="mt-6 text-center text-ink-soft">Loading…</p>
        ) : user ? (
          <div className="mt-8 rounded-[var(--radius-2xl)] border border-line bg-paper p-8 shadow-lift">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-coral-soft font-display text-xl font-bold text-coral-deep">
                {(user.email ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Signed in as
                </p>
                <p className="truncate font-medium text-ink">{user.email}</p>
              </div>
            </div>

            {msg && (
              <p className="mt-5 rounded-[var(--radius-xl)] border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-ink-soft">
                {msg}
              </p>
            )}

            <div className="mt-7 space-y-3">
              <button
                onClick={manage}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3.5 font-semibold text-paper shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-coral-deep disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening billing portal…
                  </>
                ) : (
                  "Manage subscription"
                )}
              </button>
              <button
                onClick={signOut}
                disabled={busy}
                className="w-full rounded-full border border-line py-3.5 font-medium text-ink-soft transition hover:bg-cream-deep disabled:opacity-50"
              >
                Sign out
              </button>
            </div>

            <p className="mt-5 text-center text-xs text-muted">
              Billing is handled securely by Stripe. Cancel anytime.
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-[var(--radius-2xl)] border border-line bg-paper p-8 text-center shadow-lift">
            <p className="text-ink-soft">
              Sign in to manage your BeSeen subscription.
            </p>
            <button
              onClick={signIn}
              className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full border border-line bg-paper py-3.5 font-semibold text-ink shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-cream-deep"
            >
              <GoogleGlyph /> Sign in with Google
            </button>
            <p className="mt-4 text-xs text-muted">
              Don&apos;t have Pro yet?{" "}
              <a href="/upgrade" className="font-medium text-coral underline">
                Start your free trial
              </a>
            </p>
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
