# HitSend - landing site

Marketing site for **HitSend**: a deterministic (no-AI) spam-risk checker for cold
emails. "Grammarly, but for getting into the inbox."

This repo is the **presentation layer** - the beautiful, animated storefront that
sells the product. The scoring engine + Gmail extension live in a separate repo.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4** (warm & human theme - cream / coral / amber)
- **Motion** (framer-motion) for the animations
- **lucide-react** icons
- Fonts: Bricolage Grotesque (display) · Inter (body) · JetBrains Mono

## The signature animation

`components/gauntlet.tsx` - an email runs the spam-filter **gauntlet**: it gets
caught red at each gate, stamped SPAM, then fixed in one click and sails green
into the inbox. Loops forever. Honors `prefers-reduced-motion`.

## Sections

`components/` - `nav` · `hero` (+ gauntlet) · `problem` · `how-it-works` ·
`live-demo` (interactive, gated fixes) · `pricing` · `footer`

The Try-it demo is a **scripted preview** - it shows the findings for free but
gates the one-click fixes behind sign-up. The real engine is never shipped to the
marketing bundle (protects the ruleset + demonstrates the free→paid line).

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Deploy

Hosted on Vercel. Push to `main` → auto-deploy.
