import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { APP_URL, serverEnv } from "@/lib/config";

/* Creates a Stripe Checkout session for the signed-in user and returns its URL.
 * Reuses an existing Stripe customer if we've seen this user before. */

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const extId = (await req.json().catch(() => ({})))?.extId as string | undefined;

  // Reuse the Stripe customer if this user already has a subscription row.
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
  }

  const successUrl =
    `${APP_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}` +
    (extId ? `&ext_id=${encodeURIComponent(extId)}` : "");

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: serverEnv.stripePriceId(), quantity: 1 }],
    client_reference_id: user.id,
    // Stamp user_id everywhere the webhook might read it.
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
    success_url: successUrl,
    cancel_url: `${APP_URL}/upgrade?canceled=1`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
