import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { proFromSubs } from "@/lib/subscription";

/* Step 1 of the card-first trial checkout. Creates a SetupIntent so the browser
 * can collect + confirm the card BEFORE any subscription exists. Nothing is
 * charged, and no trial/Pro is granted here - the subscription is only created
 * in POST /api/subscription once we have a confirmed payment method. This is
 * what guarantees "no card, no trial". */

export const runtime = "nodejs";

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

  // Reuse the Stripe customer if we've seen this user; else create + remember it.
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

  // Never start a second trial/subscription for someone already Pro.
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

  const si = await stripe().setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
    usage: "off_session",
    metadata: { supabase_user_id: user.id },
  });

  return NextResponse.json({ clientSecret: si.client_secret });
}
