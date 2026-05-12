# MyDealz — Changes & Scope Tracker

> Read this at the start of every session for a quick brief. Update it at the end of every session.

_Last updated: 2026-05-13 (end of day)_

---

## Quick Brief — Start Here Each Morning

**What the app is:** MyDealz — "Your Personal AI Savings Companion. Save Smarter. Every Time."
UK deals aggregator with AI deal verification (Groq LLM), pgvector personalisation, and social features.

**Where to run it:**
```bash
# Web app (macOS — pnpm not globally installed, use npx)
npx pnpm@8.15.0 --filter web dev    # localhost:3000
# env vars must be in apps/web/.env.local (copy from root .env.local)

# Agents
cd packages/agents
py scraper_agent.py             # scrape Aldi + fetch OG images
py qa_agent.py                  # score pending deals with Groq
py embedding_agent.py           # embed approved deals (fastembed, local)
py personalisation_agent.py     # build user preference profiles
```

**DB:** Supabase — `zadlakzrhyexeluvauun.supabase.co`
**Branch:** `ui-redesign` (active) — `base-setup` is the previous stable branch

---

## What Was Built — Session Log

### Session 1 (initial scaffolding)
- Monorepo structure: Next.js 14, Expo, Plasmo, tRPC, Supabase

### Session 2 (agents + DB schema)
- Migration 0001: 6 tables (deals, retailers, price_history, user_profiles, user_signals, agent_logs) with RLS + updated_at triggers + pgvector
- Python agents: listing_agent, qa_agent, scraper_agent, seed_test_data, llm.py, db.py, logger.py, embedder.py
- Aldi UK scraping via ScraperAPI + OG image fetching
- 18 approved deals in DB (12 Aldi + 6 test deals with Unsplash images)
- AWIN listing_agent: reads feed ID from retailers.feed_url, constructs full AWIN URL from AWIN_API_KEY env

### Session 3 (web frontend + auth)
- Next.js 14 App Router with Tailwind CSS 3.4 + Plus Jakarta Sans font
- brand-50 → brand-700 orange palette defined in tailwind.config.ts
- SplashScreen: localStorage-based, shows ONCE ever on first visit only
- Hero: dark charcoal banner, headline, search bar, live stats
- DealSlider: horizontal scroll carousel with arrow nav + scroll-snap
- DealCard: 'use client', object-cover images, onError → SVG category icon fallback
- CategoryFilter: scrollable emoji + label pills
- CategoryIcon: SVG icon map for 9 product categories (Tech→Laptop, Audio→Headphones, etc.)
- Header: glass-blur sticky, plain HTML form search (works without JS), profile link
- Supabase Auth: email + password sign in/up at /auth, middleware session refresh
- Search: server-side ilike via GET /?search=query
- Loading skeleton via loading.tsx

### Session 4 (deal detail + social + UI polish)
- DealCard: 'use client' to fix onError, absolute inset-0 img inside aspect-[4/3] fixes overflow
- Removed crossOrigin=anonymous (caused CORS block on some images)
- StarIcon + StarRow extracted to packages/ui/src/StarIcon.tsx (shared between DealCard + DealRating)
- Migration 0002: deal_ratings (1–5 star), deal_comments (threaded), comment_reactions (like/heart/fire) with full RLS
- Deal detail page (/deals/[id]): image, price, AI score bar, retailer, breadcrumb
- DealRating client component: interactive 5-star, optimistic updates
- DealComments client component: post, reply inline, react (👍❤️🔥), toggle reactions
- Similar deals section on detail page
- DealImage client component (handles onError without SSR issue)
- Batch ratings query in page.tsx (2 queries total, not N+1)
- Star ratings on DealCard (avgRating + ratingCount props)

### Session 6 (DealNest brand system + UI redesign + Vercel deploy) — 2026-05-13

#### Branch: `ui-redesign`

#### Design tokens
- Design handoff copied to `docs/design/design_handoff_dealnest_brand/`
- `packages/ui/src/tokens/colors.ts` — full group colour palette (ink, cream, chalk, mist, sage, rust, amber, mydealz, rewardloop, basketbot)
- `packages/ui/src/tokens/typography.ts` — Bricolage Grotesque / Geist / Geist Mono type scale
- Tokens re-exported from `packages/ui/src/index.ts`

#### Fonts
- `Bricolage_Grotesque` via `next/font/google` → `--font-display` CSS var
- `GeistSans` + `GeistMono` via `geist` npm package (canonical Next.js 14 approach) → `--font-geist-sans` / `--font-geist-mono`
- Replaced `Plus_Jakarta_Sans` throughout

#### Tailwind
- `tailwind.config.ts` extended with full brand palette (`ink`, `ink-80`, `ink-60`, `ink-40`, `cream`, `chalk`, `mist`, `mydealz`, `mydealz-deep`, `mydealz-soft`, `sage`, `rust`, `amber`)
- New font family config: `font-sans` → Geist, `font-display` → Bricolage, `font-mono` → Geist Mono
- Brand shadows: `shadow-card` (1px + 8px), `shadow-card-float` (floating hero cards)
- Legacy `brand` orange kept so nothing breaks

#### Logos + favicon
- 9 production SVGs → `apps/web/public/logos/` (all DealNest group marks + icons)
- `apps/web/src/app/icon.svg` → Next.js auto-favicon (picked up as `/icon.svg`)
- `metadata.icons` set in `layout.tsx`

#### Component redesigns (packages/ui)
- **Header**: ink background, MyDealz SVG icon + Bricolage wordmark, cream nav links, Sign in (outline) + Get the app (filled green)
- **Hero**: two-column dark layout — left copy/stats, right stacked deal card deck
  - Three cards: front (full DealCard), left (MiniCard rotated −4°, 0.55 opacity), right (MiniCard rotated +5°, 0.55 opacity)
  - Background MiniCards are clickable — clicking animates them to front via CSS transitions (`cubic-bezier(0.4,0,0.2,1)`)
  - Falls back to 3 sample deals if Supabase returns none
- **DealCard**: full redesign — 16:10 image, ink discount pill, frosted retailer pill, amber bookmark toggle, Bricolage price, savings chip (`mydealz-soft`), verifier avatar row, vote pill with up/down arrows
  - New optional props: `verificationNote`, `verifierName`, `verifierInitials`, `verifiedAt`, `voteCount`
- **DealSlider**: chalk bg, mist borders, ink pills, mydealz savings chip, brand "Get this deal →"
- **CategoryFilter**: chalk bg, ink active pill, mist borders, mydealz "Deals for you" pill

#### Page redesigns (apps/web)
- **page.tsx**: cream bg, brand section headings (Bricolage), ink footer, passes `featuredDeals` to Hero
- **auth/page.tsx**: cream bg, MyDealz logo lockup, mist tabs, mydealz submit button, rust/soft error/success states
- **deals/[id]/page.tsx**: cream bg, mist breadcrumb, ink/mist badges, Bricolage price, sage/rust score bar, mydealz CTA
- **for-you/page.tsx**: ink hero banner, mydealz eyebrow + heading, soft interest tags, brand onboarding card
- **profile/page.tsx**: chalk header, ink/display headings, mydealz avatar palette, activity cards hover to `border-mydealz/30`
- **profile/ProfileSettings.tsx**: mydealz-soft icon wells, mist borders, rust sign-out, brand form buttons
- **deals/[id]/DealComments.tsx**: chalk comment bubbles, mydealz-soft reactions, brand post buttons
- **deals/[id]/DealRating.tsx**: mist borders, ink type, `text-mydealz` sign-in link
- **deals/[id]/DealImage.tsx**: mist fallback bg, ink-40 category icon
- **loading.tsx**: cream bg, mist borders, 16:10 skeleton aspect ratio

#### Vercel deploy fixes
- `turbo.json`: renamed `tasks` → `pipeline` (turbo v1 syntax — project is on `^1.13.0`)
- `vercel.json`: added with pnpm install/build commands + `apps/web/.next` output dir
- `tsconfig.json`: bumped `target` from `es5` → `ES2017` (fixes Map/iterator `for...of` TS errors on Vercel)
- Fixed `for (const [, comment] of commentMap)` → `commentMap.forEach()` (Map iteration)
- Fixed explicit `(d: DealRow)` cast clashing with Supabase's inferred `retailers` array type

#### Vercel deploy status
- Build passing type-check and compile ✓
- Last fix pushed: `3b27f82` — Supabase `retailers` type cast in `for-you/page.tsx`
- If further type errors appear tomorrow, same pattern: remove explicit `DealRow` cast or use `as DealRow[]`

---

### Session 5 (personalisation + brand + profile)

#### Brand rebrand
- Product: "Your Personal AI Savings Companion"
- Slogan: "Save Smarter. Every Time."
- Hero headline updated, site metadata updated across all pages

#### User profile page (/profile)
- Avatar: initials in colour-coded circle (hash of user ID → consistent colour)
- Stats row: deals rated / comments / reactions counts
- Activity timeline: all comments (with quote), ratings (with StarRow), reactions — merged and sorted by date, each links to the deal
- ProfileSettings client component:
  - Update display name (Supabase updateUser metadata)
  - Change password (re-authenticates first with current password, then updates)
  - Sign out button
- Header: logged-in state shows avatar circle + username → /profile link

#### "Deals for you" + personalisation engine
- CategoryFilter: "Deals for you" gradient orange pill added as first item (always visible)
  - Separated from category filters by a visual divider
  - Highlights (active state) when on /for-you route
  - Links to /for-you for everyone (unauthenticated users get redirected to /auth)

- `/for-you` page:
  - Dark gradient hero banner with "Deals Made Just For You" headline
  - Shows user's top interest categories as orange tags
  - Onboarding state for new users with explanation of how learning works
  - Two-tier recommendation logic:
    1. pgvector cosine similarity (when user_profiles.embedding exists)
    2. Category-preference scoring fallback (always works)
    3. Pads with top-rated deals if fewer than 8 personalised matches
  - Full deal grid with ratings

- embedding_agent.py:
  - Generates 768-dim nomic-embed-text-v1 vectors for approved deals
  - Uses fastembed (ONNX local runtime) — no API key needed, same model as planned
  - HuggingFace API tried first if HF_API_KEY set, falls through to fastembed on failure
  - Note: HF free inference API changed permissions in 2024 (new router requires different token type)
  - fastembed caches model locally at ~260MB after first download
  - STATUS: 17/17 approved deals have 768-dim vectors in deals.embedding ✓

- personalisation_agent.py:
  - Reads ratings (weight = score × 1), comments (weight = 3), reactions (fire=2, heart=1.5, like=1)
  - Builds top_categories + avg_price preference profile
  - Stores as preferences jsonb in user_profiles table
  - STATUS: 1 user profiled — top=['Toys'], avg_price=£104.99 ✓
  - NOTE: Does NOT yet compute user_profiles.embedding (vector) — that's tomorrow

- Migration 0003: preferences jsonb column on user_profiles, ivfflat indexes on both embedding columns
- Migration 0004: match_deals_for_user(user_id, count) Postgres RPC function using pgvector <=> cosine distance
  - SECURITY DEFINER so row-level security applies to underlying tables
  - STATUS: Both migrations executed in Supabase ✓

---

## Current State (end of session)

| Component | Status |
|---|---|
| Database | 4 migrations executed. 9 tables live with full RLS |
| Deals | 17 approved, all with 768-dim embeddings + images |
| User profiles | 1 profile with preferences. Embedding vector not yet computed |
| Vector RPC | match_deals_for_user() installed and ready |
| /for-you | Live — using category fallback (will auto-upgrade to vector once user embedding built) |
| Agents | All 6 agents working. fastembed replaces HF API for embeddings |
| Web app | All pages fully redesigned: /, /deals/[id], /auth, /profile, /for-you |
| Brand system | DealNest tokens, fonts, logos, favicon — all wired in |
| Vercel | Deploying from `ui-redesign` branch. Last known build: type-check passing, may have one more Supabase type cast error |
| AWIN | Key configured. Waiting for advertiser programme approvals |
| eBay API | Developer account applied. Pending approval |
| GH Actions | Workflow files in infra/.github/ — NOT yet in root .github/ (GH won't pick them up) |

---

## Tomorrow — Start Here

### Priority 0: Vercel build (check first thing)
Check if the `ui-redesign` branch deployed successfully on Vercel.
- If it failed with another type error: same fix pattern — remove explicit `DealRow` cast or replace `for...of` on Maps with `.forEach()`
- If green: merge `ui-redesign` → `main` via squash merge, Vercel will promote to production

### Priority 1: Complete the vector personalisation loop (30 min)

The `match_deals_for_user` RPC is installed but returns empty results because
`user_profiles.embedding` is NULL for all users. personalisation_agent.py builds the
`preferences` JSON but doesn't compute the embedding vector yet.

**Fix needed in personalisation_agent.py:**
```python
# After building category scores, compute weighted mean of deal embeddings
# for all deals the user interacted with, store as user_profiles.embedding
weighted_vecs = []
for rating in ratings:
    deal_vec = get_deal_embedding(rating['deal_id'])
    weighted_vecs.append((deal_vec, rating['score']))  # weight by score
# ... compute weighted mean
# db.table('user_profiles').update({'embedding': mean_vec}).eq('id', uid)
```

Once this is done:
1. `py personalisation_agent.py` → user_profiles.embedding is set
2. /for-you automatically switches from category fallback → real pgvector similarity
3. The "Deals for you" pill shows truly personalised deals

### Priority 2: Move GH Actions workflows to root (15 min)

Workflows live at `infra/.github/workflows/` but GitHub only reads from root `.github/workflows/`.
Move them so CI + agent scheduling actually runs in the cloud.

```powershell
mkdir .github\workflows
copy infra\.github\workflows\*.yml .github\workflows\
git add .github/
git commit -m "chore: move GH Actions workflows to root for GitHub to pick up"
```

### Priority 3: AWIN retailer feeds (when approved)

Once AWIN approves programme applications (Currys, Argos, Very, AO, John Lewis):
1. Get feed IDs from AWIN dashboard → Reports → Data Feeds
2. Insert into Supabase retailers table:
```sql
INSERT INTO retailers (name, slug, affiliate_network, feed_url, active)
VALUES ('Currys', 'currys', 'awin', '<feed_id>', true);
```
3. `py listing_agent.py` → `py qa_agent.py` → `py embedding_agent.py`

### Priority 4: Mobile app (Expo React Native) — big session

Start `apps/mobile/` setup:
- Expo SDK 51 with Expo Router
- NativeWind for Tailwind-style components
- Home screen: deal feed using existing Supabase client
- Deal detail screen
- Auth screen (Supabase magic link works well on mobile)

---

## Environment Variables Reference

### Agents (`packages/agents/.env.local` — gitignored)
```
SUPABASE_URL=https://zadlakzrhyexeluvauun.supabase.co
SUPABASE_SERVICE_KEY=<secret>
AGENT_ENV=production
GROQ_API_KEY=<secret>
SCRAPERAPI_KEY=<secret>
AWIN_API_KEY=<secret>
HF_API_KEY=<secret>   # optional, fastembed works without it
```

### Web (`apps/web/.env.local` — gitignored)
```
NEXT_PUBLIC_SUPABASE_URL=https://zadlakzrhyexeluvauun.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_HqUuXnZakDHn1fmA0tq_9A_cai5Xt4I
```

---

## Architecture Cheatsheet

```
mydealz/
├── apps/web/              Next.js 14 App Router + Tailwind
│   ├── src/app/
│   │   ├── page.tsx       Home — Hero + DealSlider + CategoryFilter + deal sections
│   │   ├── deals/[id]/    Deal detail — image, price, AI score, rating, comments, similar
│   │   ├── for-you/       Personalised feed — pgvector similarity or category fallback
│   │   ├── profile/       User profile — activity timeline, settings, password change
│   │   └── auth/          Sign in / Sign up / Sign out / Callback
│   └── src/lib/supabase/  server.ts (SSR) + client.ts (browser)
│
├── packages/
│   ├── ui/src/            DealCard, DealSlider, Hero, Header, CategoryFilter,
│   │                      SplashScreen, CategoryIcon, StarIcon/StarRow
│   ├── db/src/            Supabase client (supports PUBLISHABLE_KEY + ANON_KEY)
│   │   migrations/        0001 schema, 0002 social, 0003 personalisation, 0004 vector RPC
│   ├── agents/            Python agents (no TS agents per CLAUDE.md)
│   │   ├── listing_agent.py       AWIN/CJ XML feed ingestion
│   │   ├── qa_agent.py            Groq LLM authenticity scoring
│   │   ├── scraper_agent.py       Aldi UK via ScraperAPI + OG images
│   │   ├── embedding_agent.py     fastembed nomic-embed-text-v1 → deals.embedding
│   │   └── personalisation_agent.py  User preference profiles (preferences JSON)
│   └── types/src/         Deal, Retailer, UserProfile, UserSignal interfaces
│
└── infra/.github/         GH Actions (must move to root .github/ to activate)
```

---

## Scope Guardrails (CLAUDE.md — never deviate without asking)
- No OpenAI — Groq for cloud LLM
- No Prisma — raw SQL in packages/db/migrations/
- No Redux/Zustand — tRPC cache + React context
- No Axios — native fetch or tRPC client
- No Express/Fastify — Next.js API routes only
- No BullMQ — GitHub Actions cron for scheduling
- No AWS — Vercel + Supabase + Fly.io only
- Python-only agents — no TypeScript agents
- No `any` TypeScript — fix properly
- No default exports except Next.js pages and Expo screens
