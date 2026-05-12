# MyDealz — Changes & Scope Tracker

> Read this at the start of every session for a quick brief. Update it at the end of every session.

_Last updated: 2026-05-12 (end of day)_

---

## Quick Brief — Start Here Each Morning

**What the app is:** MyDealz — "Your Personal AI Savings Companion. Save Smarter. Every Time."
UK deals aggregator with AI deal verification (Groq LLM), pgvector personalisation, and social features.

**Where to run it:**
```powershell
# Set Node PATH first (required on this machine)
$env:PATH = "C:\Users\Imran Janwari\AppData\Roaming\npm;C:\Program Files\nodejs;" + $env:PATH

# Web app
cd apps/web && pnpm dev         # runs on localhost:3001 (3000 often occupied)

# Agents
cd packages/agents
py scraper_agent.py             # scrape Aldi + fetch OG images
py qa_agent.py                  # score pending deals with Groq
py embedding_agent.py           # embed approved deals (fastembed, local)
py personalisation_agent.py     # build user preference profiles
```

**DB:** Supabase — `zadlakzrhyexeluvauun.supabase.co`
**Branch:** `base-setup` → push to `origin/base-setup`

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
| Web app | All pages: /, /deals/[id], /auth, /profile, /for-you |
| AWIN | Key configured. Waiting for advertiser programme approvals |
| eBay API | Developer account applied. Pending approval |
| GH Actions | Workflow files in infra/.github/ — NOT yet in root .github/ (GH won't pick them up) |

---

## Tomorrow — Start Here

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
