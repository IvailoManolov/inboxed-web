import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

/* Subscription summary for the signed-in user, read live from Stripe. Powers
 * the branded /account manager (no hosted Stripe portal). */

export const runtime = "nodejs";

const ACTIVE = new Set(["active", "trialing", "past_due"]);

function periodEnd(sub: Stripe.Subscription): number {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof top === "number") return top;
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number };
  return item?.current_period_end ?? 0;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const customerId = user.app_metadata?.stripe_customer_id as string | undefined;
  if (!customerId) return NextResponse.json({ active: false });

  const list = await stripe().subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });

  const now = Date.now();
  const sub = list.data
    .filter((s) => ACTIVE.has(s.status))
    .filter((s) => s.status === "past_due" || periodEnd(s) * 1000 > now)
    .sort((a, b) => periodEnd(b) - periodEnd(a))[0];

  if (!sub) return NextResponse.json({ active: false });

  // Card on file (for display only).
  let card: { brand: string; last4: string } | null = null;
  try {
    const cust = (await stripe().customers.retrieve(customerId, {
      expand: ["invoice_settings.default_payment_method"],
    })) as Stripe.Customer;
    const pm = cust.invoice_settings?.default_payment_method;
    if (pm && typeof pm !== "string" && pm.card) {
      card = { brand: pm.card.brand, last4: pm.card.last4 };
    }
  } catch {
    /* card display is best-effort */
  }

  return NextResponse.json({
    active: true,
    status: sub.status,
    currentPeriodEnd: periodEnd(sub) * 1000,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    card,
  });
}
