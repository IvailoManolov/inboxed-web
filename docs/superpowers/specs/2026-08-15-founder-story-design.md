# Founder Story Section + Brand-Leak Fix - Design

**Date:** 2026-08-15
**Status:** Approved (locked)

## Goal

Add a human, empathic **founder-story section** to the HitSend landing page to
build credibility for a new product, and remove the leftover `clashy.net` brand
leak from the spammy demo so that domain appears only in its intended (positive)
place - the founder story.

## Context

HitSend web app: Next.js 16 (App Router), Tailwind, `motion/react`, brand tokens
(coral `#f0603a`, green `#2fa46a`, ink `#241f18`, cream `#faf6ef`), `Reveal`
component for scroll-in animation. Landing page (`app/page.tsx`) composes:
`Nav → Hero → Problem → HowItWorks → ScoreGuide → FlagDemo → LiveDemo → Pricing → Footer`.
No chart library is used anywhere; visuals are inline SVG + motion.

The founder is **Ivo** (the FlagDemo sample email is signed "Ivo"). His true
story: started first company **clashy.net**, cold-emailed with no results,
learned what trips Gmail's filters, built an extension to check drafts before
sending, and grew signups from a handful to 1,000+. Still building. This is the
origin of HitSend.

## Scope

Two changes, both presentational, no API/data:

1. New `<FounderStory />` section on the landing page, placed **immediately
   before `<Pricing />`** (trust right before the ask).
2. Neutralize the two `clashy.net` mentions in `components/flag-demo.tsx`.

## 1. FounderStory component

**File:** `components/founder-story.tsx` (new, `"use client"` - uses motion +
scroll trigger).

**Layout:** two columns on desktop (copy left, chart right), stacked on mobile.
`id="story"`, section padding consistent with siblings
(`py-20 sm:py-28`, `max-w-6xl`), background `bg-cream-deep/40` with `border-y`
(matches Problem/ScoreGuide rhythm).

**Content (copy is final, first person, with clashy.net links opening in a new
tab):**

- Eyebrow: `From the founder`
- Headline: `I built this because my own emails kept vanishing.`
- Paragraphs:
  1. "A while back I started my first company, [Clashy](https://clashy.net). I did what everyone says to do - I cold emailed. A lot. And I got… nothing. No replies, no bounces, no clue why. My emails weren't being ignored. They were never being seen - quietly sent to spam."
  2. "I almost quit. Instead I changed one thing: I stopped guessing and started learning what actually trips Gmail's filters - the words, the links, the rules Google publishes but nobody reads. I built a little tool to check my drafts before I hit send."
  3. "That one change moved everything. Clashy went from a handful of signups to over a thousand. Same product, same me - the emails just finally started landing."
  4. "I'm still building, honestly. HitSend is that tool, cleaned up so you don't have to learn this the hard way like I did. If your emails feel like they're disappearing into a void - they probably are. Let's fix that."
- Signature row: a small circular avatar with initial **"I"** (coral-soft bg,
  matching the account page avatar), then `Ivo - founder · ` + `clashy.net` link.

**Honest-framing rule:** the growth claim is Ivo's real Clashy trajectory,
anchored only to the two endpoints he stands behind ("a handful" → "1,000+").
The chart shows the *journey shape* between them; it does NOT invent precise
intermediate datapoints or dates.

## Founder journey chart

Inline SVG, responsive (`viewBox` + `preserveAspectRatio="none"` for the area,
crisp overlays for labels), rendered inside `founder-story.tsx` as a local
`JourneyChart` sub-component.

- **Curve:** near-flat baseline across the first ~40% of the x-range (the "going
  nowhere" stretch), a clear inflection, then a confident rise to the top-right.
- **Inflection marker:** vertical dashed line + dot at the inflection x, label
  `started checking every email`.
- **Y-axis (qualitative, no invented numbers):** bottom label `a handful`, top
  label `1,000+ signups`.
- **X-axis:** single label `time` (no dates).
- **Colors:** line `var(--coral)`; area fill a green gradient
  (`var(--green-soft)` → transparent) under the post-inflection rise; pre-
  inflection segment muted/flat.
- **Animation:** on scroll into view (`useInView`, `once: true`), the line path
  draws via `pathLength` 0→1, the area fades in, and the axis/inflection labels
  fade after the draw - mirroring the motion patterns already used in
  `flag-demo.tsx` and `hero.tsx`.
- **Caption (below chart):** `My own signups - before and after I started
  respecting the rules. Same product, same me.`

## 2. Brand-leak fix (`components/flag-demo.tsx`)

- Line ~29: `"All of the clients inside clashy.net are extremely happy with it."`
  → `"Every client we work with is absolutely thrilled with the results."`
  (keeps the over-the-top spammy tone, drops the real domain).
- Line ~30: `to mark your seat: https://clashy.net` → `to mark your seat:
  https://get-more-leads.co` (a neutral, obviously-generic fake outreach domain).

Rationale: the spammy example email must not name a real/owned brand; `clashy.net`
now belongs solely to the founder story.

## Integration

- `app/page.tsx`: import `FounderStory`, render `<FounderStory />` between
  `<LiveDemo />` and `<Pricing />`.
- `components/footer.tsx`: add a `Story` link (`/#story`) to the product-links
  list for discoverability.

## Dependencies

Pure presentational. Depends on: `motion/react`, `Reveal`, brand tokens. No data
fetching, no new packages, no API routes.

## Error handling

None (static). Requirement: the SVG scales without horizontal overflow and the
two-column layout collapses cleanly to a single column on mobile.

## Testing / verification

- `npx tsc --noEmit` and `npm run build` clean.
- Visual: section renders before Pricing; chart line draws on scroll; layout
  stacks on mobile; both `clashy.net` links open in a new tab.
- `grep -ri clashy components` → `clashy.net` appears **only** in
  `founder-story.tsx`; **none** remain in `flag-demo.tsx`.
- Deploy to production; smoke-check homepage returns 200 and `#story` renders.

## Out of scope (possible later)

- A dedicated `/about` page with the long-form story.
- A real founder photo (text avatar for now).
- Any real analytics/metrics integration.
