# MyDealz — Session Log & Team Brief

> **Protocol:** Read the "Current State" table at the start of every session.
> Update "Current State" and add a session entry at the end of every session.
> Keep entries factual — what was built, what broke, what's next.
> This file is the single source of truth for where the project is right now.

---

## How to start the dev server

### macOS / Linux
```bash
# Web app
cd apps/web && pnpm dev          # http://localhost:3000

# Agents (from packages/agents/)
python listing_agent.py --dry-run
python qa_agent.py --dry-run
python embedding_agent.py --dry-run
python personalisation_agent.py --dry-run
```

### Windows (PowerShell)
```powershell
# Add node to PATH if needed (adjust version to your install)
$env:PATH = "$env:APPDATA\npm;C:\Program Files\nodejs;" + $env:PATH

# Web app
cd apps/web; pnpm dev            # http://localhost:3000 or :3001 if 3000 occupied

# Agents (from packages/agents/)
py listing_agent.py --dry-run
py qa_agent.py --dry-run
```

### Prerequisites (all platforms)
```bash
pnpm install          # from repo root — installs all workspaces
pip install -r packages/agents/requirements.txt
ollama pull llama3.1:8b && ollama pull nomic-embed-text   # local AI
```

### Environment variables
Copy the example files — **never commit `.env.local`**:
```bash
cp .env.example .env.local                              # web vars
cp packages/agents/.env.example packages/agents/.env.local  # agent vars
```
Real values are in the shared password manager (ask Imran).

---

## Supabase project
- **URL:** `https://zadlakzrhyexeluvauun.supabase.co`
- **Dashboard:** Supabase → Project `mydealz-prod`
- Migrations: run numbered SQL files in `packages/db/migrations/` in order via the SQL editor

---

## Current State

| Component | Status | Owner | Notes |
|---|---|---|---|
| Database | ✅ Live | Imran | 9 tables, migrations 0001–0006 |
| RLS policies | ✅ In migration 0006 | Imran | Run 0006 in Supabase if not done |
| updated_at triggers | ✅ In migration 0006 | Imran | Run 0006 in Supabase if not done |
| Web app | ✅ All pages live | Adnan | /, /deals/[id], /auth, /profile, /for-you, /privacy, /terms, /about |
| Deals | ✅ 17 approved | Imran | All have 768-dim embeddings |
| pgvector similarity | ⚠️ Partial | Imran | match_deals_for_user RPC installed; user embeddings not yet computed |
| Social features | ✅ Live | Adnan | Ratings, comments, reactions |
| Personalisation | ⚠️ Partial | Imran | Category fallback works; vector similarity needs user embeddings |
| Python agents | ✅ All 5 working | Imran | listing, qa, scraper, embedding, personalisation |
| GH Actions workflows | ✅ Root .github/ | Imran | CI, listing agent, QA agent, AI reviewer |
| Error boundaries | ✅ Added | Adnan | error.tsx + global-error.tsx |
| Sentry | ⚠️ Config only | Adnan | Needs NEXT_PUBLIC_SENTRY_DSN in Vercel env vars |
| PostHog | ❌ Not wired | Adnan | Install @posthog/nextjs, add NEXT_PUBLIC_POSTHOG_KEY |
| tRPC | ⚠️ Placeholder | Imran | Real procedures needed before mobile app starts |
| Mobile app | ❌ Scaffold only | Brother 3 | Start Sprint 3 |
| Extension | ❌ Scaffold only | Brother 4 | Start Sprint 3 |
| AWIN feeds | ⚠️ Pending approval | Imran | Applications submitted, waiting on Currys, Argos, John Lewis |
| Tests | ❌ None yet | All | Vitest + pytest infrastructure needed |
| Staging env | ❌ Not set up | Imran | Vercel preview deploys act as staging for now |

---

## Priority queue (what to do next, in order)

1. **[Imran]** Run migration `0006_rls_and_triggers.sql` in Supabase — tables are currently unprotected
2. **[Imran]** Compute user profile embeddings in `personalisation_agent.py` (see session 5 notes)
3. **[Imran]** Add real tRPC procedures (`deals.list`, `deals.getById`) before mobile starts
4. **[Adnan]** Wire PostHog analytics — install `@posthog/nextjs`, add to layout.tsx
5. **[Adnan]** Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel env vars to activate error tracking
6. **[All]** Set up test infrastructure (Vitest + pytest) — required before any new feature PRs
7. **[Brother 3]** Start Expo mobile app setup (see `apps/mobile/` scaffold)
8. **[Brother 4]** Start Plasmo extension (see `apps/extension/src/matches.ts`)

---

## Session log

### Session 1 (initial scaffolding)
- Monorepo structure: Next.js 14, Expo, Plasmo, tRPC, Supabase

### Session 2 (agents + DB schema)
- Migration 0001: 6 tables with pgvector
- Python agents: listing, qa, scraper, embedding, personalisation scaffold
- Aldi UK scraping via ScraperAPI + OG image fetching
- 18 approved deals in DB (12 Aldi + 6 test deals)
- AWIN listing agent: reads feed ID from retailers.feed_url, builds AWIN API URL

### Session 3 (web frontend + auth)
- Next.js 14 App Router + Tailwind CSS 3.4 + Plus Jakarta Sans font
- brand-50 → brand-700 orange palette in tailwind.config.ts
- SplashScreen (localStorage, shows once), Hero, DealSlider, DealCard, CategoryFilter, Header
- Supabase Auth: email/password at /auth, middleware session refresh
- Server-side search via GET /?search=query

### Session 4 (deal detail + social + UI polish)
- Migration 0002: deal_ratings (1–5 star), deal_comments (threaded), comment_reactions
- Deal detail page (/deals/[id]): image, price, AI score bar, retailer, breadcrumb
- DealRating (interactive 5-star, optimistic), DealComments (post/reply/react)
- Batch ratings query in page.tsx (2 queries total, no N+1)
- StarIcon + StarRow extracted to packages/ui/src/StarIcon.tsx

### Session 5 (personalisation + brand + profile)
- Migration 0003: preferences jsonb on user_profiles; ivfflat embedding indexes
- Migration 0004: match_deals_for_user() Postgres RPC (pgvector cosine distance)
- embedding_agent.py: fastembed nomic-embed-text-v1 → deals.embedding (17/17 done ✓)
- personalisation_agent.py: ratings/comments/reactions → preferences JSON (1 user ✓)
- /for-you page: pgvector similarity when embedding exists, category fallback otherwise
- /profile page: avatar, stats, activity timeline, password change
- Brand: "Your Personal AI Savings Companion. Save Smarter. Every Time."

### Session 6 (UI redesign)
- DealNest brand system: full UI redesign merged via ui-redesign branch

### Session 7 (agent reliability + CI fix) — Imran
- fix/agent-reliability branch (PR to develop)
- listing_agent.py: idempotency via last_fetched_at, with_retry decorator, run_id logging
- qa_agent.py: removed live scraping, replaced with feed-data validators + stale deal auto-reject
- llm.py: 3-attempt exponential backoff retry
- CI workflows moved from infra/.github/ to root .github/ (were not running before)
- AI PR reviewer added: .github/workflows/ai_review.yml + .github/scripts/ai_review.py
- Migration 0005: last_fetched_at on retailers, performance indexes

### Session 8 (production hardening) — Adnan
- Migration 0006: full RLS policies on all 9 tables + updated_at triggers (RUN THIS IN SUPABASE)
- Privacy policy, Terms of Use, About pages — GDPR + ASA compliant
- Web logger utility (apps/web/src/lib/logger.ts) — replaces all console.* calls
- Error boundaries: error.tsx + global-error.tsx
- Sentry config: sentry.client.config.ts + sentry.server.config.ts + next.config.js wiring
- CLAUDE.md: Supabase client rules, testing requirements, team ownership, settled decisions
- CHANGES.md: rewritten as multi-person platform-agnostic protocol
- docs/ROLES.md, docs/DECISIONS.md, package READMEs created

---

## Architecture cheatsheet

```
mydealz/
├── apps/web/src/app/
│   ├── page.tsx              Home — Hero + DealSlider + CategoryFilter + deal sections
│   ├── deals/[id]/           Deal detail — image, price, AI score, rating, comments
│   ├── for-you/              Personalised feed — pgvector or category fallback
│   ├── profile/              Activity timeline, settings, password change
│   ├── auth/                 Sign in / Sign up / Callback / Sign out
│   ├── privacy/              GDPR privacy policy
│   ├── terms/                Terms of use + affiliate disclosure
│   └── about/                Company info
│
├── apps/web/src/lib/
│   ├── logger.ts             Structured logger → Sentry in production
│   └── supabase/
│       ├── client.ts         Browser client (use client components)
│       └── server.ts         SSR client (use server components needing auth)
│
├── packages/
│   ├── db/src/index.ts       Supabase singleton (public data reads)
│   ├── db/migrations/        0001–0006 SQL — run in order in Supabase
│   ├── ui/src/               DealCard, DealSlider, Hero, Header, CategoryFilter,
│   │                         SplashScreen, CategoryIcon, StarIcon
│   ├── agents/
│   │   ├── listing_agent.py  AWIN/CJ feed ingestion (idempotent, retries)
│   │   ├── qa_agent.py       Feed-data validation + LLM authenticity scoring
│   │   ├── scraper_agent.py  Aldi/Lidl via ScraperAPI
│   │   ├── embedding_agent.py fastembed nomic-embed-text → deals.embedding
│   │   └── personalisation_agent.py  User preference profiles
│   └── api/src/index.ts      tRPC router (placeholder — real procedures needed)
│
└── .github/
    ├── workflows/ci.yml
    ├── workflows/listing_agent.yml
    ├── workflows/qa_agent.yml
    └── workflows/ai_review.yml
```

---

## Scope guardrails (never deviate without asking Imran)
See `docs/DECISIONS.md` for the full ADR.
No OpenAI · No Prisma · No Redux/Zustand · No BullMQ · No AWS · No Express/Fastify
Python-only agents · Extension: retailer domains only (Interpretation A)
