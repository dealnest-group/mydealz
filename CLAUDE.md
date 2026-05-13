# MyDealz — Claude Code Instructions

## Project overview
MyDealz is Phase 1 of DealNest Group — an AI-native, personalised deals aggregator for the UK market. The browser extension is the intelligence layer: it passively learns what users browse and buy, feeding a personalisation engine that makes every surface feel curated for that individual. This is the competitive moat over HotUKDeals.

## Team ownership — read before touching any file

| Area | Owner | Final call |
|---|---|---|
| Backend, tRPC API, DB schema, migrations, infra | **Imran** (Senior Engineer) | Imran |
| Python agents (`packages/agents/`) | **Imran** | Imran |
| Web frontend (`apps/web/`) | **Adnan** | Adnan |
| Shared UI components (`packages/ui/`) | **Adnan** | Adnan |
| Expo mobile app (`apps/mobile/`) | **Brother 3** | Brother 3 |
| Plasmo extension (`apps/extension/`) | **Brother 4** | Brother 4 |
| `packages/types/` | Imran — all 4 brothers may propose, Imran approves |
| Architecture decisions | **Imran** — always |

**PR review rule:** PRs touching your own area need 1 approval from any other brother.
PRs touching another brother's area need approval from that area's owner.
PRs touching `packages/db/migrations/` or `packages/types/` always need Imran's approval.

See `docs/ROLES.md` for the full matrix.

## Monorepo structure
```
mydealz/
├── apps/
│   ├── web/          # Next.js 14 — mydealz.uk        [Adnan]
│   ├── mobile/       # Expo React Native — iOS/Android [Brother 3]
│   └── extension/    # Plasmo — Chrome + Firefox MV3   [Brother 4]
├── packages/
│   ├── api/          # tRPC router — shared            [Imran]
│   ├── db/           # Supabase client + migrations    [Imran]
│   ├── ui/           # Shared component library        [Adnan]
│   ├── types/        # Shared TypeScript types         [Imran]
│   └── agents/       # Python AI agent workers         [Imran]
├── docs/             # ROLES.md, DECISIONS.md, PRD
├── .github/          # CI + agent workflows (root — not infra/)
└── CLAUDE.md
```

## Tech stack — do not deviate without asking
- **Web**: Next.js 14 App Router, deployed on Vercel free tier
- **Mobile**: Expo SDK 51+, Expo Router, EAS Build
- **Extension**: Plasmo framework, Manifest V3, Chrome + Firefox
- **API**: tRPC v11, shared between web and mobile
- **Database**: Supabase (Postgres + pgvector + Auth + Realtime + Storage)
- **Cache**: Upstash Redis (serverless, free tier)
- **Search**: Meilisearch on Fly.io
- **AI local**: Ollama (Llama 3.1 8B, Mistral 7B, nomic-embed-text)
- **AI production**: Groq API (Llama 3.1 70B)
- **Scraping**: Crawlee + ScraperAPI proxies (only for non-AWIN/CJ retailers)
- **Scheduling**: GitHub Actions cron
- **Email**: Resend + React Email
- **Analytics**: PostHog Cloud
- **Error tracking**: Sentry
- **CI/CD**: GitHub Actions

## Language and style rules
- **TypeScript everywhere** — strict mode, no `any`, no implicit returns
- Shared types live in `packages/types` — never duplicate a type across apps
- Use `zod` for all runtime validation and tRPC input schemas
- Use `prettier` + `eslint` — run before every commit
- Named exports only — no default exports except Next.js pages and Expo screens
- No `console.log` in production code — use the logger utility
- Error boundaries on every major UI section
- Every tRPC procedure must have a zod input schema, even if empty

## Supabase client rules — THREE clients, strict usage

There are three Supabase clients in the web app. Use the correct one for each context:

| Client | File | Use when |
|---|---|---|
| **Singleton** | `@mydealz/db` (`packages/db/src/index.ts`) | Server components fetching public data (deals, retailers). No auth context needed. |
| **SSR server client** | `apps/web/src/lib/supabase/server.ts` | Server components or route handlers that need the current user's session (profile page, for-you page, auth callback). |
| **Browser client** | `apps/web/src/lib/supabase/client.ts` | Client components (`'use client'`) that need Supabase (ratings, comments, realtime). |

**Never** create a fourth Supabase client. **Never** call `createClient()` directly in a page or component — always import from one of the three locations above.

## Database rules
- All DB access goes through `packages/db` — never import `@supabase/supabase-js` directly in apps
- Every table has `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at`, `updated_at`
- Use Row Level Security on all tables — never disable it
- All migrations live in `packages/db/migrations/` as numbered SQL files — run in order
- pgvector columns use `vector(768)` — nomic-embed-text dimension
- Never store PII in vector embeddings — embed anonymised product/category signals only
- New migration files must be reviewed and approved by Imran before merging

## AI agent rules
- Agents live in `packages/agents/` as Python scripts
- Each agent is stateless — reads from DB, writes to DB, exits
- Agents are triggered by GitHub Actions cron — not long-running processes
- Every agent logs structured JSON: `{ agent, status, items_processed, errors, duration_ms }`
- All LLM calls go through `packages/agents/llm.py` — never call Groq/Ollama directly
- Use Ollama locally (`AGENT_ENV=local`), Groq in production (`AGENT_ENV=production`)
- Every agent has a dry-run mode: `--dry-run` flag logs actions without writing to DB

## Extension rules (CRITICAL — read carefully)
- Content scripts run on supported retailer domains only — defined in `extension/matches.ts`
- Never access URLs, history, or any data outside the matched retailer page
- All captured data is anonymised client-side before transmission — no PII in signals
- Signal batching: collect events for 60 seconds, then send one batched POST
- Extension popup shares components from `packages/ui` where possible
- User must explicitly opt in before any signal capture begins — check `user.signals_enabled`
- GDPR: signals tied to anonymous session ID until user links account

## Environment variables
- Web + API: stored in Vercel dashboard, never in `.env` committed to repo
- Mobile: stored in EAS Secrets, referenced in `app.config.ts`
- Extension: stored in `.env.local` for dev, injected at build time for production
- Agents: stored in GitHub Actions secrets
- Local dev: copy `.env.example` to `.env.local` — never commit `.env.local`

## Error handling and logging rules
- **Never use `console.log`, `console.error`, or `console.warn` directly** — import `logger` from `apps/web/src/lib/logger.ts` instead
- Every `async` server action or data fetch must have a try/catch that calls `logger.error()`
- Every major page section must be wrapped in a React error boundary (use Next.js `error.tsx` per route segment)
- Sentry is configured in `sentry.client.config.ts` and `sentry.server.config.ts` — do not add a second Sentry init

## Testing rules
- **Every PR must include tests** for the logic it changes — no exceptions
- TypeScript packages use **Vitest** — config at root `vitest.workspace.ts`
- Python agents use **pytest** — tests in `packages/agents/tests/`
- Coverage gate (industry standard): **80% lines, 80% functions, 75% branches, 80% statements** on every tested module in `packages/api` and `packages/agents`
- Files without tests are excluded from the report rather than dragging the average down — add the file to `include` (Vitest) or `--cov=<module>` (pytest) when you ship its first test
- What to test: pure functions, tRPC procedures (mock Supabase), agent validators, normalisation logic
- What NOT to test: Next.js page rendering, Supabase itself, external APIs
- Run all tests before pushing: `pnpm test` (TypeScript) and `pytest packages/agents/tests/` (Python)

## Git workflow
- Branch naming: `feature/`, `fix/`, `chore/`, `agent/`
- Commit style: `feat(web): add deal card component` — conventional commits
- Branch from `develop`, PR back to `develop` — never branch from or push to `main`
- PRs require: CI passing (lint + typecheck + tests) + 1 approval (see ownership rules above)
- Squash merge only — keep history clean
- Never commit directly to `main` or `develop`

## What NOT to do
- Do not add new npm packages without checking if the functionality already exists in the stack
- Do not add OpenAI SDK — use Groq client for cloud inference
- Do not add Prisma — use Supabase client and raw SQL migrations
- Do not add Redux or Zustand — use tRPC query cache + React context for state
- Do not add Axios — use native fetch or tRPC client
- Do not create separate Express/Fastify server — Next.js API routes handle everything
- Do not add BullMQ — GitHub Actions cron handles scheduling in Phase 1
- Do not add AWS SDK — Vercel + Supabase + Fly.io replace AWS entirely
- Do not write agents in TypeScript — Python only for the agent layer
- Do not use `any` type — fix the type properly

## Settled decisions — do not re-open
See `docs/DECISIONS.md` for the full ADR. Summary of what is already decided and locked:
- No OpenAI — Groq (cloud) + Ollama (local)
- No Prisma — raw SQL migrations only
- No Redux/Zustand — tRPC cache + React context
- No BullMQ — GitHub Actions cron until 50k+ users
- No AWS — Vercel + Supabase + Fly.io
- No Express/Fastify — Next.js API routes
- Agents in Python only — no TypeScript agents
- Extension: Interpretation A (retailer domains only, no general history)
- Personalisation: data architecture from day 1, personalised UI activates at ~20 signals

If a client, a new requirement, or your own reasoning suggests deviating from any of the above,
flag it to Imran first. Do not silently deviate.

## When you are unsure
Ask before implementing. A 2-minute question saves 2 hours of rework. If a decision conflicts with this file, flag it to the area owner — do not silently deviate.
