import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { proFromSubs, type StripeSubLite } from "@/lib/subscription";

/* The extension calls this with the user's Supabase access token to learn
 * whether they're Pro. Identity comes from Supabase Auth; Pro status is read
 * LIVE from Stripe - no local subscriptions table, no cron. Bearer auth only,
 * so it works from the extension's background worker. */

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function reply(body: { pro: boolean; until: string | null }, status = 200) {
  return NextResponse.json(body, { status, headers: CORS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/** current_period_end lives at the top level in older API versions and on the
 * subscription item in newer ones - read whichever is present. */
function periodEnd(sub: Stripe.Subscription): number {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof top === "number") return top;
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number };
  return item?.current_period_end ?? 0;
}

export async function GET(req: NextRequest) {
  const authz = req.headers.get("authorization") ?? "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
  if (!token) return reply({ pro: false, until: null }, 401);

  const admin = createSupabaseAdminClient();
  const { data: userData, error } = await admin.auth.getUser(token);
  if (error || !userData.user) return reply({ pro: false, until: null }, 401);

  // Tamper-proof: app_metadata is writable only by the service role.
  const customerId = userData.user.app_metadata?.stripe_customer_id as string | undefined;
  if (!customerId) return reply({ pro: false, until: null });

  const list = await stripe().subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });
  const lite: StripeSubLite[] = list.data.map((s) => ({
    status: s.status,
    current_period_end: periodEnd(s),
  }));

  const { pro, until } = proFromSubs(lite, new Date());
  return reply({ pro, until });
}
