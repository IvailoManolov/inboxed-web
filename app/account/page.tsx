"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import {
  Loader2,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getStripe } from "@/lib/stripe-browser";

type Sub = {
  active: boolean;
  status?: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  card?: { brand: string; last4: string } | null;
};

const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#f0603a",
    colorText: "#241f18",
    colorTextSecondary: "#4a4137",
    colorBackground: "#fffdf9",
    colorDanger: "#e24d34",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "12px",
    spacingUnit: "3px",
  },
  rules: {
    ".Input": { border: "1px solid #e9dfce", boxShadow: "none" },
    ".Input:focus": { border: "1px solid #f0603a", boxShadow: "0 0 0 1px #f0603a" },
  },
};

function fmtDate(ms?: number) {
  if (!ms) return "";
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Inline card-update form (Payment Element on a SetupIntent). */
function UpdateCardForm({ onDone }: { onDone: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });
    if (error) {
      setError(error.message ?? "Could not save the card. Please try again.");
      setBusy(false);
      return;
    }
    const pm = setupIntent?.payment_method;
    if (typeof pm === "string") {
      await fetch("/api/subscription/payment-method", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentMethodId: pm }),
      });
    }
    onDone();
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && (
        <p className="rounded-[var(--radius-xl)] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || busy}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-coral py-3 font-semibold text-paper shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-coral-deep disabled:translate-y-0 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save card"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-line px-5 py-3 font-medium text-ink-soft transition hover:bg-cream-deep"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<Sub | null>(null);
  const [busy, setBusy] = useState<null | "cancel" | "resume">(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [editCard, setEditCard] = useState<string | null>(null); // SetupIntent client secret

  const loadSub = useCallback(async () => {
    const res = await fetch("/api/subscription/status");
    if (res.ok) setSub((await res.json()) as Sub);
    else setSub({ active: false });
  }, []);

  useEffect(() => {
    createSupabaseBrowserClient()
      .auth.getUser()
      .then(async ({ data }) => {
        setUser(data.user);
        setLoading(false);
        if (data.user) await loadSub();
      });
  }, [loadSub]);

  async function setCancel(action: "cancel" | "resume") {
    setBusy(action);
    setMsg(null);
    const res = await fetch("/api/subscription/update", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      await loadSub();
      setMsg(
        action === "cancel"
          ? "Your subscription will end at the close of this billing period."
          : "Welcome back - your subscription will keep renewing.",
      );
    } else {
      setMsg("Something went wrong. Please try again.");
    }
    setBusy(null);
  }

  async function startCardUpdate() {
    setMsg(null);
    const res = await fetch("/api/subscription/payment-method", { method: "POST" });
    if (res.ok) {
      const { clientSecret } = (await res.json()) as { clientSecret?: string };
      if (clientSecret) setEditCard(clientSecret);
    }
  }

  async function signIn() {
    await createSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/account")}`,
      },
    });
  }

  async function signOut() {
    await createSupabaseBrowserClient().auth.signOut();
    setUser(null);
    setSub(null);
  }

  return (
    <main className="bg-grain flex min-h-screen flex-col items-center justify-center px-5 py-16">
      <a
        href="/"
        className="mb-8 font-display text-lg font-extrabold tracking-tight text-ink"
      >
        HitSend
      </a>

      <div className="w-full max-w-md">
        <h1 className="text-center font-display text-3xl font-extrabold tracking-tight text-ink">
          Your account
        </h1>

        {loading ? (
          <p className="mt-6 text-center text-ink-soft">Loading…</p>
        ) : !user ? (
          <div className="mt-8 rounded-[var(--radius-2xl)] border border-line bg-paper p-8 text-center shadow-lift">
            <p className="text-ink-soft">Sign in to manage your subscription.</p>
            <button
              onClick={signIn}
              className="mt-6 w-full rounded-full border border-line bg-paper py-3.5 font-semibold text-ink shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-cream-deep"
            >
              Sign in with Google
            </button>
            <p className="mt-4 text-xs text-muted">
              Don&apos;t have Pro yet?{" "}
              <a href="/upgrade" className="font-medium text-coral underline">
                Start your free trial
              </a>
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {/* identity */}
            <div className="rounded-[var(--radius-2xl)] border border-line bg-paper p-6 shadow-lift">
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
            </div>

            {/* subscription */}
            <div className="rounded-[var(--radius-2xl)] border border-line bg-paper p-6 shadow-lift">
              {sub === null ? (
                <p className="flex items-center gap-2 text-sm text-ink-soft">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading subscription…
                </p>
              ) : !sub.active ? (
                <div className="text-center">
                  <p className="font-medium text-ink">No active subscription</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Go Pro to unlock the full checker in Gmail.
                  </p>
                  <a
                    href="/upgrade"
                    className="mt-5 inline-block rounded-full bg-coral px-6 py-3 font-semibold text-paper shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-coral-deep"
                  >
                    Go Pro
                  </a>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-bold text-ink">
                        HitSend Pro
                      </span>
                      {sub.status === "past_due" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
                          <AlertTriangle className="h-3 w-3" /> Past due
                        </span>
                      ) : sub.cancelAtPeriodEnd ? (
                        <span className="rounded-full bg-amber/15 px-2 py-0.5 text-xs font-semibold text-amber">
                          Ending soon
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-soft px-2 py-0.5 text-xs font-semibold text-green">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-ink-soft">
                    {sub.cancelAtPeriodEnd
                      ? `Access ends on ${fmtDate(sub.currentPeriodEnd)}.`
                      : `Renews on ${fmtDate(sub.currentPeriodEnd)}.`}
                  </p>

                  {sub.card && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
                      <CreditCard className="h-4 w-4 text-muted" />
                      <span className="capitalize">{sub.card.brand}</span> ····{" "}
                      {sub.card.last4}
                    </p>
                  )}

                  {msg && (
                    <p className="mt-4 rounded-[var(--radius-xl)] border border-line bg-cream px-4 py-3 text-sm text-ink-soft">
                      {msg}
                    </p>
                  )}

                  {editCard ? (
                    <Elements
                      stripe={getStripe()}
                      options={{ clientSecret: editCard, appearance }}
                    >
                      <UpdateCardForm
                        onDone={() => {
                          setEditCard(null);
                          void loadSub();
                        }}
                      />
                    </Elements>
                  ) : (
                    <div className="mt-5 space-y-3">
                      <button
                        onClick={startCardUpdate}
                        className="w-full rounded-full border border-line py-3 font-medium text-ink transition hover:bg-cream-deep"
                      >
                        Update payment method
                      </button>
                      {sub.cancelAtPeriodEnd ? (
                        <button
                          onClick={() => setCancel("resume")}
                          disabled={busy !== null}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3 font-semibold text-paper shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-coral-deep disabled:opacity-60"
                        >
                          {busy === "resume" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Resume subscription"
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => setCancel("cancel")}
                          disabled={busy !== null}
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-3 font-medium text-ink-soft transition hover:bg-cream-deep disabled:opacity-60"
                        >
                          {busy === "cancel" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Cancel subscription"
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              onClick={signOut}
              className="w-full rounded-full border border-line py-3 font-medium text-ink-soft transition hover:bg-cream-deep"
            >
              Sign out
            </button>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <Lock className="h-3.5 w-3.5" /> Powered and protected by Stripe
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
