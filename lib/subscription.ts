/* Pure entitlement logic, derived straight from Stripe subscriptions. Stripe is
 * the source of truth — there is no local subscriptions table. The route handler
 * does the Stripe I/O and calls in here so the decision stays unit-testable. */

/** The minimal slice of a Stripe subscription we need to decide access. */
export interface StripeSubLite {
  status: string;
  current_period_end: number; // unix seconds
}

/** Stripe statuses that still grant access. */
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

/**
 * Decide Pro + the paid-through date from a customer's Stripe subscriptions.
 * Pro = at least one subscription that is active/trialing AND whose period
 * hasn't ended. `until` is the furthest-out qualifying period end (so stacked
 * or renewed subs report the latest coverage).
 */
export function proFromSubs(
  subs: StripeSubLite[],
  now: Date,
): { pro: boolean; until: string | null } {
  const nowMs = now.getTime();
  let until: number | null = null;
  for (const s of subs) {
    if (!ACTIVE_STATUSES.has(s.status)) continue;
    const endMs = s.current_period_end * 1000;
    if (endMs <= nowMs) continue;
    if (until === null || endMs > until) until = endMs;
  }
  return {
    pro: until !== null,
    until: until === null ? null : new Date(until).toISOString(),
  };
}
