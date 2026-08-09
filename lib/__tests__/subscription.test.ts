import { describe, it, expect } from "vitest";
import { proFromSubs, type StripeSubLite } from "../subscription";

const NOW = new Date("2026-08-10T12:00:00Z");
const FUTURE = Math.floor(Date.parse("2026-09-10T12:00:00Z") / 1000);
const LATER = Math.floor(Date.parse("2026-10-10T12:00:00Z") / 1000);
const PAST = Math.floor(Date.parse("2026-08-01T00:00:00Z") / 1000);

function subs(...s: StripeSubLite[]): StripeSubLite[] {
  return s;
}

describe("proFromSubs", () => {
  it("active + future period → pro, with until set", () => {
    const r = proFromSubs(subs({ status: "active", current_period_end: FUTURE }), NOW);
    expect(r.pro).toBe(true);
    expect(r.until).toBe("2026-09-10T12:00:00.000Z");
  });

  it("trialing counts as pro", () => {
    expect(proFromSubs(subs({ status: "trialing", current_period_end: FUTURE }), NOW).pro).toBe(true);
  });

  it("canceled → not pro", () => {
    expect(proFromSubs(subs({ status: "canceled", current_period_end: FUTURE }), NOW).pro).toBe(false);
  });

  it("active but period already ended → not pro", () => {
    const r = proFromSubs(subs({ status: "active", current_period_end: PAST }), NOW);
    expect(r.pro).toBe(false);
    expect(r.until).toBeNull();
  });

  it("no subscriptions → not pro", () => {
    expect(proFromSubs([], NOW)).toEqual({ pro: false, until: null });
  });

  it("reports the furthest-out coverage among multiple active subs", () => {
    const r = proFromSubs(
      subs(
        { status: "active", current_period_end: FUTURE },
        { status: "active", current_period_end: LATER },
      ),
      NOW,
    );
    expect(r.until).toBe("2026-10-10T12:00:00.000Z");
  });

  it("ignores canceled when an active one also exists", () => {
    const r = proFromSubs(
      subs(
        { status: "canceled", current_period_end: LATER },
        { status: "active", current_period_end: FUTURE },
      ),
      NOW,
    );
    expect(r.pro).toBe(true);
    expect(r.until).toBe("2026-09-10T12:00:00.000Z");
  });
});
