/* Pure mapping + entitlement logic. No Stripe/Supabase SDK imports here so it
 * stays trivially unit-testable. The route handlers do the I/O and call in. */

/** The shape we persist in public.subscriptions. */
export interface SubscriptionRow {
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: string;
  status: string;
  current_period_end: string; // ISO
  updated_at: string; // ISO
}

/** The minimal slice of a Stripe Subscription we depend on. */
export interface StripeSubShape {
  id: string;
  status: string;
  current_period_end: number; // unix seconds
  customer: string;
  items?: { data?: Array<{ price?: { nickname?: string | null } }> };
}

/** Statuses Stripe reports that still grant access. */
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

/** Build the DB row from a Stripe subscription. `now` is injected for
 * deterministic tests. */
export function subscriptionRowFromStripe(
  sub: StripeSubShape,
  userId: string,
  now: Date,
): SubscriptionRow {
  const plan = sub.items?.data?.[0]?.price?.nickname ?? "monthly";
  return {
    user_id: userId,
    stripe_customer_id: sub.customer,
    stripe_subscription_id: sub.id,
    plan,
    status: sub.status,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    updated_at: now.toISOString(),
  };
}

/** The single source of truth for "is this user Pro?" — active/trialing AND
 * the paid-through date is still in the future. */
export function isProFromRow(
  row: Pick<SubscriptionRow, "status" | "current_period_end"> | null | undefined,
  now: Date,
): boolean {
  if (!row) return false;
  if (!ACTIVE_STATUSES.has(row.status)) return false;
  const end = Date.parse(row.current_period_end);
  return Number.isFinite(end) && end > now.getTime();
}
