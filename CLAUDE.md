# MyDealz — Claude Code Instructions

## Project overview
MyDealz is Phase 1 of DealNest Group — an AI-native, personalised deals aggregator for the UK market. The browser extension is the intelligence layer: it passively learns what users browse and buy, feeding a personalisation engine that makes every surface feel curated for that individual. This is the competitive moat over HotUKDeals.

## Monorepo structure
```
mydealz/
├── apps/
│   ├── web/          # Next.js 14 — mydealz.uk
│   ├── mobile/       # Expo React Native — iOS + Android
│   └── extension/    # Plasmo — Chrome + Firefox MV3
├── packages/
│   ├── api/          # tRPC router — shared by web + mobile
│   ├── db/           # Supabase client + schema + migrations
│   ├── ui/           # Shared component library (web + mobile)
│   ├── types/        # Shared TypeScript types across all apps
│   └── agents/       # Python AI agent workers
├── infra/            # GitHub Actions workflows + env config
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

## Database rules
- All DB access goes through `packages/db` — never import Supabase client directly in apps
- Every table has `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at`, `updated_at`
- Use Row Level Security on all tables — never disable it
- All migrations live in `packages/db/migrations/` as numbered SQL files
- pgvector columns use `vector(768)` — nomic-embed-text dimension
- Never store PII in vector embeddings — embed anonymised product/category signals only

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

## Git workflow
- Branch naming: `feature/`, `fix/`, `chore/`, `agent/`
- Commit style: `feat(web): add deal card component` — conventional commits
- PRs require passing CI (lint + typecheck + tests) before merge
- Feature branches are created from `develop` and merged back to `develop` via PR
- `develop` branch is merged to `main` via PR for releases
- Never commit directly to `main` or `develop`
- Squash merge only — keep history clean

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

## When you are unsure
Ask before implementing. A 2-minute question saves 2 hours of rework. If a decision conflicts with this file, flag it — do not silently deviate.

## Business Context
See `AI_CONTEXT.md` for product strategy, roadmap, and sprint plan.
