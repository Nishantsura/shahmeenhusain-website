<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Shahmeen Husain — project notes

Headless Shopify storefront on Next.js (App Router) + Tailwind v4 + shadcn/ui.

## Architecture
- `lib/shopify/` — Storefront GraphQL, **server-side only** (`server-only`).
  The GraphQL in `queries.ts` is ported verbatim from the previous static
  site and is proven against the live store; don't "tidy" it. API version
  is pinned in `.env.local`.
- `lib/shopify/cart.ts` — Server Actions. Cart id lives in an **httpOnly
  cookie**, not localStorage. `addToCart` retries once against a fresh
  cart, because Shopify carts expire and `cartLinesAdd` then returns no
  cart rather than an error.
- `components/motion/` — Lenis smooth scroll, reveals, cursor, preloader,
  parallax, count-up.
- `lib/size-guide.ts` — the house size chart and the made-to-measure
  field set. Static on purpose: one atelier, one block, so the chart
  cannot drift between products. Moves to a Shopify metafield the day
  the store carries a garment cut on a different block.
- **Made-to-measure rides on cart line `attributes`**, so the numbers
  reach checkout, the confirmation mail and the admin — the atelier
  reads the order, not the PDP. Shopify still needs a variant id for a
  garment that is not a standard size, so `basePatternSize()` resolves
  the nearest in-stock chart row to the entered bust and the line shows
  it as "Base pattern M". Assumes no surcharge; a made-to-measure fee
  would need a Shopify-side variant or a selling plan.

## Gotchas that have bitten this codebase
- **Never set `scroll-behavior: smooth` on `html`.** Lenis writes the
  scroll position every frame; native smooth scrolling turns each write
  into a competing animation and the page judders badly.
- **Parallax must measure its wrapper, not the layer it transforms.**
  Reading the transformed element's own rect feeds last frame's output
  back into this frame's input and the image oscillates.
- **Never let a reveal hide real content.** Clipping an observed element
  to `inset(100%)` gives it zero area, so IntersectionObserver reports 0
  and the reveal can never fire. Clip an inner element instead. A
  `<noscript>` rule in `app/layout.tsx` un-hides split text.
- **Don't read `cookies()` in the root layout** — it opts every route out
  of static rendering. The cart hydrates on mount instead.

## Not wired up
Search, the contact form and the newsletter are all cosmetic — they were
in the previous site too. Each needs a real backend before launch.
