import Stripe from "stripe";
import { serverEnv } from "@/lib/config";

let _stripe: Stripe | null = null;

/** Lazily-constructed Stripe client. Lazy so importing this module doesn't
 * throw at build time when the secret key isn't set yet. SERVER ONLY. */
export function stripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(serverEnv.stripeSecretKey());
  return _stripe;
}
