"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { Check, ShieldCheck, Lock, Loader2 } from "lucide-react";
import { getStripe } from "@/lib/stripe-browser";
import { PRICE_LABEL } from "@/lib/config";

const FEATURES = [
  "One-click fixes on every flagged phrase",
  "The full findings list, not just the top 5",
  "Unlimited checks - no trial expiry",
  "100% private - no email content ever leaves your browser",
];

/** Brand-matched styling for the Stripe Payment Element. */
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
    ".Label": { fontWeight: "600" },
  },
};

/** The right-hand payment form. Lives inside <Elements>, so it can use the
 * Stripe hooks. Collects the card (for the trial we confirm a SetupIntent so
 * nothing is charged today) and hands off to the success page, which syncs the
 * token to the extension. */
function PayForm({ extId }: { extId?: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);

    // 1) Confirm the card (SetupIntent). No charge today. `redirect: "if_required"`
    //    keeps us on-page for cards so we can create the subscription next.
    const { error: confirmErr, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });
    if (confirmErr) {
      setError(confirmErr.message ?? "We couldn't save your card. Please try again.");
      setBusy(false);
      return;
    }

    const pm = setupIntent?.payment_method;
    const paymentMethodId = typeof pm === "string" ? pm : pm?.id;
    if (!paymentMethodId) {
      setError("We couldn't read your card. Please try again.");
      setBusy(false);
      return;
    }

    // 2) Card is confirmed - now create the 7-day trial subscription with it.
    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paymentMethodId }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "We couldn't start your trial. Please try again.");
      setBusy(false);
      return;
    }

    // 3) Off to the success page (it hands the token to the extension).
    window.location.href =
      `/upgrade/success` + (extId ? `?ext_id=${encodeURIComponent(extId)}` : "");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between rounded-[var(--radius-xl)] border border-line bg-cream/60 px-3.5 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ShieldCheck className="h-4 w-4 text-green" /> Protected by Stripe
        </span>
        <span className="text-[11px] text-muted">We never see your card</span>
      </div>

      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <p className="rounded-[var(--radius-xl)] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || busy}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3.5 font-semibold text-paper shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-coral-deep disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Starting your trial…
          </>
        ) : (
          "Start 7-day free trial"
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <Lock className="h-3.5 w-3.5" /> No charge for 7 days · Cancel anytime
      </p>
    </form>
  );
}

type State = "loading" | "ready" | "alreadyPro" | "unauth" | "error";

function CheckoutInner() {
  const params = useSearchParams();
  const extId = params.get("ext_id") ?? undefined;

  const [state, setState] = useState<State>("loading");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    // Card-first: create only a SetupIntent now (no subscription yet).
    fetch("/api/subscription/setup-intent", { method: "POST" })
      .then(async (res) => {
        if (!alive) return;
        if (res.status === 401) {
          setState("unauth");
          return;
        }
        const j = (await res.json()) as {
          clientSecret?: string;
          alreadyPro?: boolean;
        };
        if (j.alreadyPro) setState("alreadyPro");
        else if (j.clientSecret) {
          setClientSecret(j.clientSecret);
          setState("ready");
        } else setState("error");
      })
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, []);

  // Not signed in → send them through the upgrade page's Google sign-in.
  useEffect(() => {
    if (state === "unauth") {
      window.location.href = `/upgrade${extId ? `?ext_id=${encodeURIComponent(extId)}` : ""}`;
    }
  }, [state, extId]);

  const stripePromise = useMemo(() => getStripe(), []);

  return (
    <main className="bg-grain flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <a
        href="/"
        className="mb-8 font-display text-lg font-extrabold tracking-tight text-ink"
      >
        HitSend
      </a>

      <div className="grid w-full max-w-4xl overflow-hidden rounded-[var(--radius-2xl)] border border-line bg-paper shadow-lift md:grid-cols-2">
        {/* Left: branded order summary */}
        <div className="border-b border-line bg-cream/60 p-8 md:border-b-0 md:border-r">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-coral-deep shadow-soft">
            HitSend Pro
          </span>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-display text-5xl font-extrabold text-ink">
              Free
            </span>
            <span className="text-sm text-ink-soft">for 7 days</span>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Then {PRICE_LABEL}. Cancel anytime in the first 7 days and you won&apos;t
            be charged a cent.
          </p>

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

          <div className="mt-8 flex items-center gap-2 rounded-[var(--radius-xl)] border border-line bg-paper px-4 py-3 text-xs text-ink-soft">
            <ShieldCheck className="h-4 w-4 shrink-0 text-green" />
            Your email content never leaves your browser - we only check the
            deliverability, never store the message.
          </div>
        </div>

        {/* Right: payment */}
        <div className="p-8">
          <h1 className="font-display text-xl font-bold text-ink">
            Start your free trial
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            No charge for 7 days. We&apos;ll only bill you when the trial ends -
            cancel before then and you pay nothing.
          </p>

          <div className="mt-6">
            {state === "loading" || state === "unauth" ? (
              <div className="flex items-center gap-2 py-8 text-sm text-ink-soft">
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing secure
                checkout…
              </div>
            ) : state === "alreadyPro" ? (
              <div className="rounded-[var(--radius-xl)] border border-green/20 bg-green-soft px-4 py-4 text-sm text-green">
                <p className="font-medium">You&apos;re already Pro 🎉</p>
                <a
                  href={`/upgrade/success${extId ? `?ext_id=${encodeURIComponent(extId)}` : ""}`}
                  className="mt-3 inline-block rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper"
                >
                  Connect the extension
                </a>
              </div>
            ) : state === "error" ? (
              <div className="rounded-[var(--radius-xl)] border border-danger/30 bg-danger/10 px-4 py-4 text-sm text-danger">
                Something went wrong starting checkout.{" "}
                <button
                  onClick={() => window.location.reload()}
                  className="font-semibold underline"
                >
                  Try again
                </button>
              </div>
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance }}
              >
                <PayForm extId={extId} />
              </Elements>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutInner />
    </Suspense>
  );
}
