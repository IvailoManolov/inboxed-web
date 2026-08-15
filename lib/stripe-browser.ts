import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/config";

/** Lazily-loaded browser Stripe instance (singleton). Uses the publishable
 * key - safe to expose. Powers the custom Payment Element checkout. */
let _promise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!_promise) _promise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  return _promise;
}
