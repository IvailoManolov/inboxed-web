import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { serverEnv } from "@/lib/config";
import { proFromSubs } from "@/lib/subscription";

/* Step 2 of the card-first trial checkout. The browser has already confirmed a
 * SetupIntent (see /api/subscription/setup-intent) and passes the resulting
 * payment method here. We create the 7-day trial subscription with that card
 * as its default, so Stripe charges it automatically when the trial ends.
 *
 * Card-first ordering is deliberate: no confirmed payment method means no
 * subscription and no Pro - you cannot start a trial without a card. */

export const runtime = "nodejs";

function periodEnd(sub: Stripe.Subscription): number {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof top === "number") return top;
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number };
  return item?.current_period_end ?? 0;
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const customerId = user.app_metadata?.stripe_customer_id as string | undefined;
  if (!customerId) {
    // setup-intent runs first and creates the customer; if it's missing the
    // client is calling out of order.
    return NextResponse.json({ error: "No customer on file" }, { status: 400 });
  }

  const { paymentMethodId } = (await req.json().catch(() => ({}))) as {
    paymentMethodId?: string;
  };
  if (!paymentMethodId) {
    return NextResponse.json(
      { error: "A payment method is required to start the trial" },
      { status: 400 },
    );
  }

  // Guard: never start a second subscription for someone already Pro.
  const existing = await stripe().subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });
  const lite = existing.data.map((s) => ({
    status: s.status,
    current_period_end: periodEnd(s),
  }));
  if (proFromSubs(lite, new Date()).pro) {
    return NextResponse.json({ alreadyPro: true });
  }

  // Make the confirmed card the customer's default for invoices.
  await stripe().customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  // Create the trial. With a card on file and a trial, the subscription starts
  // `trialing` (Pro immediately) and the first charge lands when the trial ends.
  const sub = await stripe().subscriptions.create({
    customer: customerId,
    items: [{ price: serverEnv.stripePriceId() }],
    trial_period_days: 7,
    default_payment_method: paymentMethodId,
    // Safety net: if there's ever no card at trial end, cancel instead of hang.
    trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
    metadata: { supabase_user_id: user.id },
  });

  return NextResponse.json({ ok: true, subscriptionId: sub.id });
}
