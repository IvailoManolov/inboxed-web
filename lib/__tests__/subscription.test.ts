import { describe, it, expect } from "vitest";
import {
  subscriptionRowFromStripe,
  isProFromRow,
  type StripeSubShape,
} from "../subscription";

const NOW = new Date("2026-08-09T12:00:00Z");

function sub(over: Partial<StripeSubShape> = {}): StripeSubShape {
  return {
    id: "sub_123",
    status: "active",
    current_period_end: Math.floor(Date.parse("2026-09-09T12:00:00Z") / 1000),
    customer: "cus_123",
    items: { data: [{ price: { nickname: "monthly" } }] },
    ...over,
  };
}

describe("subscriptionRowFromStripe", () => {
  it("maps a Stripe subscription into the DB row", () => {
    const row = subscriptionRowFromStripe(sub(), "user-1", NOW);
    expect(row).toEqual({
      user_id: "user-1",
      stripe_customer_id: "cus_123",
      stripe_subscription_id: "sub_123",
      plan: "monthly",
      status: "active",
      current_period_end: "2026-09-09T12:00:00.000Z",
      updated_at: "2026-08-09T12:00:00.000Z",
    });
  });

  it("defaults plan to 'monthly' when the price has no nickname", () => {
    const row = subscriptionRowFromStripe(sub({ items: { data: [{}] } }), "u", NOW);
    expect(row.plan).toBe("monthly");
  });
});

describe("isProFromRow", () => {
  it("active + future period end → pro", () => {
    expect(isProFromRow({ status: "active", current_period_end: "2026-09-09T12:00:00Z" }, NOW)).toBe(true);
  });

  it("trialing counts as pro", () => {
    expect(isProFromRow({ status: "trialing", current_period_end: "2026-09-09T12:00:00Z" }, NOW)).toBe(true);
  });

  it("canceled → not pro", () => {
    expect(isProFromRow({ status: "canceled", current_period_end: "2026-09-09T12:00:00Z" }, NOW)).toBe(false);
  });

  it("active but period already ended → not pro", () => {
    expect(isProFromRow({ status: "active", current_period_end: "2026-08-01T00:00:00Z" }, NOW)).toBe(false);
  });

  it("null row → not pro", () => {
    expect(isProFromRow(null, NOW)).toBe(false);
  });
});
