# AnderBerry Bracelets — client notes

- **Live:** https://anderberry-bracelets.netlify.app (Netlify team `sitesonpolaris`, site id `abcf06ea-799a-414b-8900-d30b3e3e07df`)
- **Repo:** sitesonpolaris/anderberry-bracelets (must be private)
- **Supabase:** project `imbucqirmqanisonvybs` ("Anderberry Bracelets", us-west-2). Schema in `supabase/migrations/0001_init.sql`, product seed in `supabase/seed.sql`.
- **Stack:** Next.js 16.4 (App Router, `cacheComponents` off → ISR + `revalidatePath`), Tailwind v4 tokens in `src/app/globals.css`, React Three Fiber hero, Supabase (`@supabase/ssr`), Stripe Checkout.

## Business
- Amy & Aaron Anderson (mother and son), Charlotte, NC. Founded 2014 when Aaron was 7, while the family faced homelessness. AnderBerry LLC.
- Email: Anderberrybracelets@gmail.com. Etsy, Instagram, Facebook, TikTok in `src/lib/site.ts`.
- Press: PBS Charlotte Carolina Impact (S11 E1119, YouTube LDtY-U1d5Gw), WBTV ×2, FOX 46, Charlotte Is Creative interview (source of all verbatim quotes).
- Products: gemstone stretch bracelets (onyx, tiger eye, hematite, agate), ConnecQ Tap-to-Connect NFC bracelets and pins, custom logo charm bracelets/keychains/pins and gift sets for organizations, beaded hat pins.

## Identity
- Palette (from the stones): onyx `#0e0d0c`, bone `#f2ede4` (ground), tiger-eye gold `#b8862f` (actions only), oxblood `#5e1b19` (story field), hematite `#56565a`.
- Type: Gloock (display) + Hanken Grotesk (text), via `next/font/local` from @fontsource.
- Logo: traced to SVG (`src/components/logo-paths.ts`) — badge with three beads on a circle, and a circle-free wordmark for the nav.
- Motif / idea: the three beads on the logo's circle become the strand the visitor turns in their hand. Hero = procedural 3D bracelet (`src/components/bracelet/`) with 4 presets mirroring real pieces; swatches restring it live and link to the piece. Story told as a bead strand.

## How it works
- Catalogue: `products` table (public read of active rows). `price_cents = null` → "Ask for price" → `/custom?product=` request form. Build falls back to `src/lib/seed.ts` if Supabase is unreachable.
- Checkout: `/api/checkout` re-prices from the DB, Stripe Checkout (US shipping, flat rate / free over threshold in `site.shipping`). Webhook `/api/stripe/webhook` upserts `customers` and `orders` (needs `SUPABASE_SECRET_KEY`).
- Admin: `/admin` (Supabase auth, email+password or magic link). Access = row in `public.admins`. Screens: overview, orders (status/tracking/notes), products (edit, image upload to `product-images` bucket, styles), customers (notes/tags, CSV export), requests.
- To add an admin: create the user in Supabase → Authentication → Users, then
  `insert into public.admins (user_id) select id from auth.users where email = '<email>';`

## Netlify env vars
- Set: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Still needed (secret): `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; optional `STRIPE_AUTOMATIC_TAX=true`.
- Stripe webhook endpoint: `https://<domain>/api/stripe/webhook`, events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`.

## Owner to confirm
- Prices: Tap-to-Connect ($65 vs $75 seen on Etsy), Custom Logo Tap-to-Connect ($99.99), Purple & Gold ($65 vs $39.99; name, and whether Greek letters may be used). Every other product has no price yet.
- Names for the Onyx Signet and Tiger Eye Hex bracelets; whether hat pins are still made; Lava Rock collection and cigar nub holders (no photos, not listed).
- Permission to show client logos in photos: LegalShield, TCB 54 Hundred Bar & Grill, R&B Versus Live, MS Novelty Experience, "PK".
- Shipping ($6 flat, free over $75), processing time, 14-day return / restring policy, and the privacy/terms pages are drafts.
- Milestone dates on the home page: Etsy 2017 (from Etsy search snippet), HUG grant "age 12", PBS "ten years in". "Amy works on AnderBerry full-time" comes from a PBS summary.
- Real Etsy reviews could not be fetched (Etsy blocks automated access); add verbatim reviews later if wanted.

## Build notes
- In the Claude cloud container, Node fetch needs `NODE_USE_ENV_PROXY=1` to reach Supabase during `next build`.
- Supabase `public.is_admin()` advisor warning is known: it only reveals whether the caller is an admin. Moving it to a private schema needs a confirmed destructive migration.
