# Inboxed — follow-ups before / at launch

Running list of things deferred during setup. Not secrets — safe to commit.

## Switch from localhost to the production domain

When a real domain is bought (placeholder below: `inboxed.app` — confirm the
final choice first), swap the dev URLs for production. **Add, don't replace**,
where noted so local dev keeps working.

- [ ] **Confirm the actual domain.** It's baked into `manifest.json`, so this is
  the one place a change costs an extension rebuild + Chrome Web Store update.
  Lock it in before the Web Store submission.
- [ ] **Supabase → Authentication → URL Configuration**
  - Site URL → `https://<domain>`
  - Redirect URLs → add `https://<domain>/auth/callback` (keep the localhost one)
- [ ] **Google Cloud → OAuth client** → add the production origin + redirect
  (the Supabase callback URL itself never changes).
- [ ] **`inboxed-web`** → set `NEXT_PUBLIC_APP_URL=https://<domain>`
  (in the Vercel dashboard env vars for prod, not the local `.env.local`).
- [ ] **`inboxed-extension/.env`** → `VITE_WEB_URL=https://<domain>`, then
  `npm run build` and reload the extension.
- [ ] **`manifest.json`** → `externally_connectable.matches` already lists
  `https://inboxed.app/*`. If the final domain differs, swap it here.

**Does NOT change:** the Google callback URL
`https://zobfhdojiheiwfuwxpjy.supabase.co/auth/v1/callback` — Google always
talks to Supabase, which then bounces the user to whatever Site URL is active.

## Switch Stripe from test to live (at launch)

Built and tested against **test mode** keys. Before real customers can pay:

- [ ] Fully activate the Stripe account (business details + bank for payouts) —
  required before live keys work.
- [ ] Recreate the "Inboxed Pro" product/price in **live mode** → new `price_…`.
- [ ] Swap the two env vars (in Vercel, prod): `STRIPE_SECRET_KEY=sk_live_…`
  and `STRIPE_PRICE_ID=price_…` (live). No code changes.
- [ ] Re-verify one real checkout end-to-end after the swap.

## Connect-extension path for already-Pro users (before launch)

The token handoff to the extension currently happens **only** on the checkout
success page. So a user who pays on the web and installs the extension later
(or reinstalls) is Pro in Stripe but sees the paywall — and "Upgrade" sends them
to checkout again (double-charge risk).

- [ ] On `/upgrade`, if the signed-in user is already Pro, show **"Connect
  extension"** (runs the `INBOXED_AUTH` handoff) instead of "Go Pro".
- [ ] Optionally add a "Connect extension" button on `/account` too.

## Other deferred items

- [ ] Replace placeholder contact/brand strings (`hello@inboxed.app`) in the
  privacy/terms pages once the domain is final.
- [ ] Deploy `inboxed-web` to Vercel; set all env vars in the Vercel dashboard.
- [ ] Chrome Web Store submission ($5 dev account; permission justification note
  for `externally_connectable` + host permissions).
