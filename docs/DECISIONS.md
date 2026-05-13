# Architecture Decision Records (ADR)

Every significant technical decision is recorded here.
Format: **Decision** → **Why** → **Consequences** → **Status**

Decisions are **locked** unless Imran explicitly re-opens them.
If you think a decision should change, raise it — don't deviate silently.

---

## ADR-001: No OpenAI — use Groq + Ollama

**Decision:** All LLM calls use Groq API in production (`llama-3.1-8b-instant`) and Ollama locally (`llama3.1:8b`). OpenAI SDK is not installed and must not be added.

**Why:** Cost. Groq provides 6,000 free requests/day. OpenAI charges from the first token. Our agent pipeline runs 100–500 LLM calls/day in Phase 1 — this would cost ~£30–80/mo vs £0.

**Consequences:** We are locked to Llama-family models. Response quality is slightly lower than GPT-4 for complex reasoning but more than adequate for deal authenticity scoring.

**Status:** Locked. Review at 50,000 users if quality becomes a differentiator.

---

## ADR-002: No Prisma — raw SQL migrations

**Decision:** Database access uses the Supabase JS client directly (`@supabase/supabase-js`). Migrations are plain `.sql` files in `packages/db/migrations/`. Prisma is not installed.

**Why:** Prisma adds a build step, a code-gen step, and doesn't support pgvector natively. Supabase's JS client + raw SQL gives us full control over vector operations and RPC functions.

**Consequences:** No ORM query builder. Developers write SQL directly. Migrations are manual — no automatic rollbacks.

**Status:** Locked.

---

## ADR-003: No Redux or Zustand — tRPC cache + React context

**Decision:** Client-side state management uses tRPC's React Query cache for server state and React context for UI state. Redux and Zustand are not installed.

**Why:** tRPC with React Query already solves 95% of state management needs (loading states, caching, invalidation). Adding a separate state manager creates a parallel system that falls out of sync.

**Consequences:** Complex cross-component UI state (e.g. multi-step flows) must use React context or URL params. This is acceptable for Phase 1 scope.

**Status:** Locked. Review if mobile app needs significantly more local state.

---

## ADR-004: No BullMQ — GitHub Actions cron

**Decision:** All background jobs and scheduled tasks run as GitHub Actions cron workflows. BullMQ (or any queue server) is not used in Phase 1.

**Why:** BullMQ requires a Redis instance with persistent connections. At Phase 1 scale (sub-10k users), cron jobs firing every 15–30 minutes are sufficient. GitHub Actions is free up to 2,000 minutes/month; we upgrade to paid (~£4/mo) when we exceed that.

**Consequences:** Minimum cron interval is 5 minutes (GitHub's limit). Cron is best-effort — can fire 5–20 minutes late under load. Not suitable for real-time tasks.

**Review trigger:** When we need sub-5-minute freshness or a task exceeds 20-minute runtime consistently.

**Status:** Locked until 50k users.

---

## ADR-005: No AWS — Vercel + Supabase + Fly.io

**Decision:** The infrastructure stack is Vercel (web), Supabase (database + auth), Fly.io (Meilisearch), Upstash (Redis cache). No AWS services.

**Why:** Zero operational overhead. All three platforms have generous free tiers that cover Phase 1. AWS would require IAM, VPC, security groups, and billing alerts from day one.

**Estimated cost at 50k users:** ~£120/mo across all services vs ~£300–500/mo on equivalent AWS.

**Status:** Locked. Review for Phase 3 (BasketBot) if we need Lambda or SQS.

---

## ADR-006: Python-only agents

**Decision:** All AI agents are Python scripts in `packages/agents/`. No TypeScript agents.

**Why:** The Python ML ecosystem (fastembed, scikit-learn, pandas) is vastly more mature than the JS equivalent. Agents don't need to share types with the frontend — they communicate through the database.

**Consequences:** Agents cannot import from `packages/types`. They maintain their own type definitions implicitly via the DB schema.

**Status:** Locked.

---

## ADR-007: Extension — Interpretation A (retailer domains only)

**Decision:** The browser extension only activates on explicitly listed retailer domains (`extension/matches.ts`). It does not read general browsing history, URLs, or data from non-retailer pages.

**Why:** GDPR compliance. General history tracking requires a much heavier consent burden and ICO scrutiny. Retailer-domain-only activation is legally straightforward and technically sufficient for personalisation.

**Consequences:** Personalisation signals are sparser than a general tracking approach. This is acceptable — quality of signal matters more than quantity.

**Status:** Locked. Do not change without a legal review.

---

## ADR-008: Personalisation architecture — data-first, UI when ready

**Decision:** The personalisation data architecture (pgvector embeddings, user_signals table, preference profiles) is built from day 1. The personalised UI (`/for-you`, extension suggestions) activates per-user only after they have accumulated ~20+ signals.

**Why:** Collecting signals before the personalised UI is ready means we have training data immediately. Starting the embeddings pipeline early means zero cold-start delay when the UI ships.

**Consequences:** New users see a category-preference fallback feed until their signal count crosses the threshold.

**Status:** Locked.

---

## ADR-009: Three Supabase clients in the web app

**Decision:** Three distinct Supabase client initializations exist in the web app with strict usage rules. See `CLAUDE.md` for the table.

**Why:** Next.js App Router requires different client patterns for server components (cookie-aware SSR client), client components (browser client), and simple public reads (singleton without auth context). One-size-fits-all leads to auth session bugs.

**Status:** Locked. The rules are in `CLAUDE.md`. Do not create a fourth client.

---

## ADR-010: GitHub Actions for CI, not self-hosted runners

**Decision:** CI uses GitHub-hosted runners (ubuntu-latest). Self-hosted runners are not used.

**Why:** Zero maintenance. For a 4-person part-time team, managing runners is not a good use of time.

**Consequences:** Cold start for each CI run (~30–60s). Pip/pnpm caching reduces this. Acceptable for Phase 1.

**Status:** Locked.

---

## How to propose a new decision or change an existing one

1. Open a GitHub Issue titled `[ADR] <short description>`
2. Describe the options, costs, and your recommendation
3. Tag Imran — he makes the call
4. If accepted, Imran adds it here and updates `CLAUDE.md` if it affects coding rules
