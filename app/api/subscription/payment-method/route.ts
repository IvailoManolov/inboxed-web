import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

/* Update the card on file — on our domain via Payment Element, no hosted
 * portal. POST creates a SetupIntent (client confirms it); PUT sets the
 * resulting payment method as the customer + subscription default. */

export const runtime = "nodejs";

const ACTIVE = new Set(["active", "trialing", "past_due"]);

async function customerId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (user?.app_metadata?.stripe_customer_id as string | undefined) ?? null;
}

export async function POST() {
  const cus = await customerId();
  if (!cus) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const si = await stripe().setupIntents.create({
    customer: cus,
    payment_method_types: ["card"],
    usage: "off_session",
  });
  return NextResponse.json({ clientSecret: si.client_secret });
}

export async function PUT(req: NextRequest) {
  const cus = await customerId();
  if (!cus) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { paymentMethodId } = (await req.json().catch(() => ({}))) as {
    paymentMethodId?: string;
  };
  if (!paymentMethodId) {
    return NextResponse.json({ error: "Missing payment method" }, { status: 400 });
  }

  // Make it the customer's default for future invoices…
  await stripe().customers.update(cus, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  // …and on the active subscription so the next renewal uses it.
  const list = await stripe().subscriptions.list({
    customer: cus,
    status: "all",
    limit: 100,
  });
  const sub = list.data.find((s: Stripe.Subscription) => ACTIVE.has(s.status));
  if (sub) {
    await stripe().subscriptions.update(sub.id, {
      default_payment_method: paymentMethodId,
    });
  }

  return NextResponse.json({ ok: true });
}
