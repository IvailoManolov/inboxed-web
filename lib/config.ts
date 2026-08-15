/* Centralised env access. Public values (NEXT_PUBLIC_*) are safe in the
 * browser bundle; the getters for secrets are only ever called from server
 * code (route handlers). All read from env so real keys drop in later. */

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://YOUR-PROJECT.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "PLACEHOLDER_ANON_KEY";

/** Display-only price label shown on the upgrade page. */
export const PRICE_LABEL = process.env.NEXT_PUBLIC_PRICE_LABEL ?? "$9/mo";

/** Chrome Web Store listing URL. Empty until the extension is approved - while
 * empty, the install CTAs soft-gate to a "coming soon" state. Drop the real
 * URL into NEXT_PUBLIC_EXTENSION_URL (Vercel) + redeploy to light up the funnel. */
export const EXTENSION_URL = process.env.NEXT_PUBLIC_EXTENSION_URL ?? "";

/** Stripe publishable key - safe in the browser; used by the custom checkout
 * (Payment Element) to tokenize the card client-side. */
export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "pk_test_PLACEHOLDER";

/** Server-only secrets. Throwing here surfaces a missing env immediately
 * instead of failing deep inside Stripe/Supabase. */
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const serverEnv = {
  supabaseServiceRoleKey: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  stripeSecretKey: () => required("STRIPE_SECRET_KEY"),
  stripePriceId: () => required("STRIPE_PRICE_ID"),
};
