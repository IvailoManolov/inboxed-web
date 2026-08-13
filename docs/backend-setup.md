# BeSeen backend — setup & end-to-end test

Everything is coded against env placeholders. Follow these steps to wire real
test-mode keys and run the full flow locally. ~15 minutes.

**Design in one line:** Supabase Auth is *just the Google login*; Stripe is the
source of truth for Pro, read live on each check. **No database table, no
webhook, no cron.**

## 1. Supabase (Google login only)

1. Create a free project at [supabase.com](https://supabase.com).
2. **Project Settings → API** — copy three values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL` (web) + `VITE_SUPABASE_URL` (extension)
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (web) + `VITE_SUPABASE_ANON_KEY` (extension)
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (web only — never ship this)
3. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (swap for your domain in prod)
   - Redirect URLs: add `http://localhost:3000/auth/callback`
4. **Authentication → Providers → Google** → enable. You'll paste the Client ID
   + Secret here after the next step. Copy the **callback URL** shown here.

   *(No SQL to run — there's no table. Pro status lives in Stripe.)*

## 2. Google OAuth (for "Sign in with Google")

1. [console.cloud.google.com](https://console.cloud.google.com) → new project.
2. **APIs & Services → OAuth consent screen** → External → app name + your email;
   add yourself under Test users.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. **Authorized redirect URI**: the callback URL from Supabase step 4 — it looks
   like `https://<project>.supabase.co/auth/v1/callback`.
5. Copy the **Client ID + Client Secret** → paste into Supabase's Google provider.

## 3. Stripe (test mode)

1. [dashboard.stripe.com](https://dashboard.stripe.com) → toggle **Test mode** (top right).
2. **Developers → API keys** → copy the **Secret key** (`sk_test_…`) → `STRIPE_SECRET_KEY`.
3. **Products → Add product** → "BeSeen Pro", recurring **$9/mo** → copy the
   **Price ID** (`price_…`) → `STRIPE_PRICE_ID`.

   *(No webhook to register — entitlement is read live from Stripe.)*

## 4. Fill env files

- `inboxed-web/.env.local` — copy from `.env.local.example`, fill everything.
- `inboxed-extension/.env` — copy from `.env.example`: `VITE_WEB_URL=http://localhost:3000`
  plus the Supabase URL + anon key.

## 5. Run the end-to-end test

1. **Web:** `cd inboxed-web && npm run dev`
2. **Extension:** `cd inboxed-extension && npm run build`, then load `dist/` unpacked
   at `chrome://extensions`. (`externally_connectable` + host permissions already
   include `localhost:3000`; the web page learns the extension id from the `?ext_id`
   the extension appends when it opens the tab — nothing to configure.)
3. In Gmail: exhaust the free daily check (or click **Unlock**) → the extension opens
   `localhost:3000/upgrade?ext_id=…` → **Sign in with Google** → **Go Pro** →
   pay with Stripe test card `4242 4242 4242 4242`, any future expiry + any CVC →
   the success page hands the token back → return to Gmail → **panel unlocks, no reload**.
4. **Cancel test:** in the Stripe dashboard (test mode) cancel the subscription, or use
   `/account → Manage subscription`. Within ~5 minutes (the extension's cache window)
   the panel re-locks — no job, no manual step.

## How it fits together

```
Gmail (extension)                inboxed-web (Vercel)              Supabase / Stripe
─────────────────                ────────────────────              ─────────────────
click Upgrade  ───ext_id──▶  /upgrade
                             Sign in with Google  ───────────────▶ Supabase Auth (Google)
                             Go Pro → /api/checkout ─────────────▶ Stripe Checkout
                                   └─ save customer id on the        │ pays
                                      auth user's app_metadata       │
                             /upgrade/success                        │
  store token ◀──INBOXED_AUTH──┘ (externally_connectable)            │
  isPro() ──Bearer──▶ /api/entitlement ── live read ──────────────▶ Stripe subscriptions
  panel unlocks                                                       (source of truth)
```

Secrets (`service_role`, Stripe secret) live **only** in the web server env. The
extension holds only the user's own Supabase token. No email content, and no
subscription data, is ever stored by us — Stripe holds it.
