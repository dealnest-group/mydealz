# MyDealz — Changes & Scope Tracker

> Read this at the start of every session. Update it at the end.

_Last updated: 2026-05-12_

---

## Current State

- **Web app** running at `localhost:3001` (port 3000 often occupied on this machine)
- **18 approved deals** in Supabase: 12 Aldi Specialbuys + 6 test deals, all with images
- **Full pipeline working:** scraper → QA (Groq) → approved → web
- **Auth:** Supabase email+password sign in/up live at `/auth`
- **Social features:** ratings (1–5 stars), comments + replies, reactions (👍❤️🔥)

---

## What's Been Built

### Database — Supabase (`zadlakzrhyexeluvauun.supabase.co`)

**Migration 0001** — core schema:
- Tables: `deals`, `retailers`, `price_history`, `user_profiles`, `user_signals`, `agent_logs`
- RLS on all tables, `set_updated_at()` trigger on all tables
- pgvector enabled — `vector(768)` on deals + user_profiles

**Migration 0002** — social layer:
- `deal_ratings` — 1–5 star rating, one per user per deal, UNIQUE(deal_id, user_id)
- `deal_comments` — threaded comments, `parent_id` for one level of nesting
- `comment_reactions` — like/heart/fire per comment, UNIQUE(comment_id, user_id, type)
- RLS policies on all three tables

---

### Python Agents — `packages/agents/`

| File | Purpose |
|---|---|
| `listing_agent.py` | AWIN/CJ/direct XML feeds → upserts pending deals. Constructs full AWIN URL from `AWIN_API_KEY` + feed ID stored in DB |
| `qa_agent.py` | Live price check + Groq LLM authenticity score (0–100) → approves/rejects |
| `scraper_agent.py` | Aldi UK Specialbuys via ScraperAPI + per-product OG image fetch |
| `seed_test_data.py` | 7 test deals with Unsplash images (dev only) |
| `llm.py` | Groq (production) / Ollama (local) — `complete()` |
| `db.py` | Supabase service-role client, auto-loads `.env.local` |
| `logger.py` | Structured JSON log to stdout + `agent_logs` table |
| `embedder.py` | HuggingFace (prod) / Ollama (local) embeddings |

**AWIN integration:**
- `AWIN_API_KEY` in `packages/agents/.env.local` (gitignored)
- DB stores only the numeric Feed ID in `retailers.feed_url`
- `listing_agent.py` constructs full AWIN productdata URL automatically
- Status: key configured, waiting for advertiser programme approvals

**To run agents locally:**
```powershell
cd packages/agents
py listing_agent.py --dry-run   # test without writing
py scraper_agent.py --dry-run   # test Aldi scrape
py scraper_agent.py             # real run + fetch OG images
py qa_agent.py                  # score pending deals with Groq
```

---

### Web App — `apps/web/` (Next.js 14 App Router + Tailwind CSS)

**Stack:** Next.js 14 · Tailwind 3.4 · Plus Jakarta Sans · `@supabase/ssr`

**Pages:**

| Route | What's there |
|---|---|
| `/` | SplashScreen + Hero + Deals Slider + Category Filter + deal sections |
| `/?search=query` | Full-text search (server-side, Supabase ilike) |
| `/?category=X` | Category filter |
| `/deals/[id]` | Deal detail — image, price, AI score, rating, similar deals, comments |
| `/auth` | Sign In / Sign Up (email + password, Supabase Auth) |
| `/auth/callback` | Email confirmation redirect handler |
| `/auth/signout` | POST route — clears session |

**Shared UI — `packages/ui/src/`:**

| Component | Key behaviour |
|---|---|
| `SplashScreen` | `'use client'`, localStorage-based — shows ONCE ever on first visit |
| `Hero` | Dark charcoal banner, animated headline, search bar, live stats |
| `DealSlider` | Horizontal scroll carousel, arrow nav, scroll-snap, `'use client'` |
| `DealCard` | `'use client'`, `object-cover` images, `onError` → SVG icon fallback |
| `Header` | Glass-blur sticky, plain HTML form search (works without JS) |
| `CategoryFilter` | Scrollable emoji + label pills |
| `CategoryIcon` | SVG icon map — Tech→Laptop, Audio→Headphones, TVs→TV, etc. |

**App-specific components (`apps/web/src/app/deals/[id]/`):**

| Component | Key behaviour |
|---|---|
| `DealImage` | `'use client'` — handles `onError`, category SVG fallback |
| `DealRating` | `'use client'` — 5-star interactive rating, optimistic updates |
| `DealComments` | `'use client'` — compose, post, react (👍❤️🔥), reply inline |

**Design tokens:**
- Primary: `#f97316` (brand-500 orange)
- brand-50 → brand-700 all defined in `tailwind.config.ts`
- Background: `#fafaf8` warm off-white
- Font: Plus Jakarta Sans (Google Fonts)
- Custom shadows: `shadow-card`, `shadow-card-hover` (orange glow)
- Custom animations: `scaleIn`, `fadeInUp`, `shimmer`, `float`, `blink`

---

### Auth (`apps/web/src/`)

- `lib/supabase/client.ts` — browser client (`createBrowserClient`)
- `lib/supabase/server.ts` — server client (`createServerClient` + cookies)
- `middleware.ts` — session refresh on every request
- Email + password auth; magic link emails configured in Supabase dashboard

---

### Shared Packages

| Package | Entry | Notes |
|---|---|---|
| `@mydealz/db` | `src/index.ts` | Supports both `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `@mydealz/ui` | `src/index.ts` | All UI components exported |
| `@mydealz/types` | `src/index.ts` | Deal, Retailer, UserProfile, UserSignal interfaces |
| `@mydealz/api` | `src/index.ts` | tRPC placeholder (hello procedure only) |

---

### GitHub Actions (`infra/.github/workflows/`)

> ⚠️ Must be at root `.github/workflows/` for GitHub to pick them up. Currently under `infra/` only.

| File | Trigger |
|---|---|
| `ci.yml` | Push/PR to main/develop |
| `listing_agent.yml` | Every 30 min |
| `qa_agent.yml` | Every 15 min |

---

## Environment Variables

### Agents (`packages/agents/.env.local` — gitignored)
```
SUPABASE_URL=https://zadlakzrhyexeluvauun.supabase.co
SUPABASE_SERVICE_KEY=<secret>
AGENT_ENV=production
GROQ_API_KEY=<secret>
SCRAPERAPI_KEY=<secret>
AWIN_API_KEY=<secret>
```

### Web (`apps/web/.env.local` — gitignored)
```
NEXT_PUBLIC_SUPABASE_URL=https://zadlakzrhyexeluvauun.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_HqUuXnZakDHn1fmA0tq_9A_cai5Xt4I
```

---

## Known Issues / Gotchas

| Issue | Fix / Workaround |
|---|---|
| Node not in Windows PATH | Prepend `C:\Program Files\nodejs` and `C:\Users\Imran Janwari\AppData\Roaming\npm` to `$env:PATH` before pnpm |
| Port 3000 often occupied | Dev server auto-falls back to `localhost:3001` |
| Windows cp1252 encoding | Avoid non-ASCII chars in Python `print()` — use ASCII symbols only |
| Aldi images lazy-loaded | Extra ScraperAPI call per product page to get OG image |
| Lidl prices not rendered | JS-heavy page needs session-based ScraperAPI scraping (deferred) |
| GH Actions workflows wrong folder | Under `infra/` — must move to root `.github/` before deploy |
| pnpm not in PATH | Install: `npm install -g pnpm@8.15.0` after setting Node path |
| `brand-300` was missing | Added in `tailwind.config.ts` — all icon fallbacks now visible |

---

## AWIN Retailer Setup (pending advertiser approvals)

Once approved for AWIN programmes, add retailers to DB via Supabase SQL Editor:

```sql
-- Replace feed IDs with actual values from AWIN dashboard → Reports → Data Feeds
INSERT INTO retailers (name, slug, affiliate_network, feed_url, active)
VALUES
  ('Currys',       'currys',      'awin', '<feed_id>', true),
  ('Argos',        'argos',       'awin', '<feed_id>', true),
  ('Very',         'very',        'awin', '<feed_id>', true),
  ('AO.com',       'ao',          'awin', '<feed_id>', true),
  ('John Lewis',   'john-lewis',  'awin', '<feed_id>', true);
```

Then run: `py listing_agent.py` → `py qa_agent.py`

---

## What's Next (priority order)

### Immediate
- [ ] Add AWIN retailer feed IDs once programmes approved (Currys, Argos, Very, AO, John Lewis)
- [ ] Move GH Actions workflows from `infra/.github/` to root `.github/` for automation
- [ ] User display names in comments (currently showing `user-{id}@mydealz` placeholder)

### Phase 2 — More Data
- [ ] eBay Browse API agent (developer account applied, pending approval)
- [ ] Groupon UK scraper (voucher/experience deals)
- [ ] Lidl UK scraper (session-based ScraperAPI)
- [ ] Price history tracking + chart on deal detail page

### Phase 3 — Mobile App
- [ ] Expo SDK 51 app (`apps/mobile/`) with Expo Router
- [ ] NativeWind for Tailwind-style components
- [ ] Deal feed + detail page
- [ ] Push notifications for price drops

### Phase 4 — Extension
- [ ] Plasmo Chrome/Firefox extension (`apps/extension/`)
- [ ] Signal capture (opt-in, GDPR-compliant)

### Phase 5 — Auth + Personalisation
- [ ] User display names (full_name from auth metadata)
- [ ] Saved/bookmarked deals
- [ ] AI deal recommendations (pgvector similarity)
- [ ] Price drop alerts via Resend email

---

## Scope Guardrails (CLAUDE.md — never deviate without asking)
- No OpenAI — Groq for cloud LLM
- No Prisma — raw SQL in `packages/db/migrations/`
- No Redux/Zustand — tRPC cache + React context
- No Axios — native fetch or tRPC client
- No Express/Fastify — Next.js API routes only
- No BullMQ — GitHub Actions cron for scheduling
- No AWS — Vercel + Supabase + Fly.io only
- Python-only agents — no TypeScript agents
- No `any` type in TypeScript
- No default exports except Next.js pages and Expo screens
