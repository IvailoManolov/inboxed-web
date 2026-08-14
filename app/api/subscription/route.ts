import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { serverEnv } from "@/lib/config";
import { proFromSubs } from "@/lib/subscription";

/* Powers the custom (Payment Element) checkout at /checkout. Creates a Stripe
 * subscription in `default_incomplete` state and returns the client secret of
 * the invoice's payment - the browser confirms it with the Payment Element, so
 * the whole checkout lives on our domain (no hosted Stripe page). Stripe stays
 * the source of truth; the customer id is stashed on the auth user's
 * app_metadata, same as the hosted flow. */

export const runtime = "nodejs";

/** current_period_end lives at the top level in older API versions and on the
 * subscription item in newer ones - read whichever is present. */
function periodEnd(sub: Stripe.Subscription): number {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof top === "number") return top;
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number };
  return item?.current_period_end ?? 0;
}

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // Reuse the Stripe customer if we've seen this user before; else create one
  // and remember it on the auth user (tamper-proof app_metadata).
  let customerId = user.app_metadata?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    const admin = createSupabaseAdminClient();
    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, stripe_customer_id: customerId },
    });
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

  // 7-day free trial: the user gets Pro immediately (status `trialing`), and
  // nothing is charged today. Because $0 is due now, there's no payment to
  // confirm - instead Stripe creates a pending SetupIntent to collect the card,
  // which becomes the subscription's default and is charged when the trial ends.
  const sub = await stripe().subscriptions.create({
    customer: customerId,
    items: [{ price: serverEnv.stripePriceId() }],
    trial_period_days: 7,
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    // If the trial ends with no card on file, cancel rather than leave it open.
    trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
    expand: ["pending_setup_intent"],
    metadata: { supabase_user_id: user.id },
  });

  const setupIntent = sub.pending_setup_intent as Stripe.SetupIntent | null;
  const clientSecret = setupIntent?.client_secret ?? null;
  if (!clientSecret) {
    return NextResponse.json(
      { error: "Could not start the trial" },
      { status: 500 },
    );
  }

  // `mode: "setup"` tells the checkout page to confirm a SetupIntent (collect
  // the card for later) rather than charge a PaymentIntent now.
  return NextResponse.json({ clientSecret, subscriptionId: sub.id, mode: "setup" });
}
