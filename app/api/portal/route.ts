import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { APP_URL } from "@/lib/config";

/* Returns a Stripe Customer Portal URL so a Pro user can manage or cancel
 * their subscription. Customer id comes from the auth user's app_metadata. */

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const customerId = user.app_metadata?.stripe_customer_id as string | undefined;
  if (!customerId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const session = await stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/account`,
  });

  return NextResponse.json({ url: session.url });
}
