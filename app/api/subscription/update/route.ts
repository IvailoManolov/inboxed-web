import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

/* Cancel-at-period-end / resume for the signed-in user's active subscription.
 * Branded /account manager replaces the hosted Stripe portal. */

export const runtime = "nodejs";

const ACTIVE = new Set(["active", "trialing", "past_due"]);

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

  const { action } = (await req.json().catch(() => ({}))) as {
    action?: "cancel" | "resume";
  };
  if (action !== "cancel" && action !== "resume") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const customerId = user.app_metadata?.stripe_customer_id as string | undefined;
  if (!customerId) return NextResponse.json({ error: "No subscription" }, { status: 404 });

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

  if (!sub) return NextResponse.json({ error: "No active subscription" }, { status: 404 });

  await stripe().subscriptions.update(sub.id, {
    cancel_at_period_end: action === "cancel",
  });

  return NextResponse.json({ ok: true });
}
