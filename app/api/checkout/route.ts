import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { APP_URL, serverEnv } from "@/lib/config";

/* Creates a Stripe Checkout session for the signed-in user and returns its URL.
 * The Stripe customer id is stashed on the user's app_metadata (service-role
 * only, tamper-proof) so the entitlement route can find it later — no DB. */

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { extId?: string };
  const extId = body.extId;

  // Reuse the Stripe customer if we've seen this user before; otherwise create
  // one and remember it on the auth user.
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

  const successUrl =
    `${APP_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}` +
    (extId ? `&ext_id=${encodeURIComponent(extId)}` : "");

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: serverEnv.stripePriceId(), quantity: 1 }],
    client_reference_id: user.id,
    success_url: successUrl,
    cancel_url: `${APP_URL}/upgrade?canceled=1`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
