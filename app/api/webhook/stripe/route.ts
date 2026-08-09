import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { serverEnv } from "@/lib/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  subscriptionRowFromStripe,
  type StripeSubShape,
} from "@/lib/subscription";

/* Stripe's source-of-truth webhook. Verifies the signature, then upserts the
 * user's subscription row on create/renew/cancel. Must read the raw body. */

export const runtime = "nodejs";

/** current_period_end lives at the top level in older API versions and on the
 * subscription item in newer ones — read whichever is present. */
function periodEnd(sub: Stripe.Subscription): number {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof top === "number") return top;
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number };
  return item?.current_period_end ?? Math.floor(Date.now() / 1000);
}

function toShape(sub: Stripe.Subscription): StripeSubShape {
  return {
    id: sub.id,
    status: sub.status,
    current_period_end: periodEnd(sub),
    customer: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    items: {
      data: sub.items.data.map((i) => ({
        price: { nickname: i.price?.nickname ?? null },
      })),
    },
  };
}

async function syncSubscription(sub: Stripe.Subscription, userId: string) {
  const row = subscriptionRowFromStripe(toShape(sub), userId, new Date());
  const admin = createSupabaseAdminClient();
  await admin.from("subscriptions").upsert(row, { onConflict: "user_id" });
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, serverEnv.stripeWebhookSecret());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "invalid";
    return NextResponse.json({ error: `Webhook signature failed: ${msg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        const userId =
          (session.metadata?.user_id as string | undefined) ??
          session.client_reference_id ??
          undefined;
        if (subId && userId) {
          const sub = await stripe().subscriptions.retrieve(subId);
          await syncSubscription(sub, userId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id as string | undefined;
        if (userId) await syncSubscription(sub, userId);
        break;
      }
      default:
        // Ignore everything else.
        break;
    }
  } catch (err) {
    // Log and 500 so Stripe retries — never swallow a sync failure silently.
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
