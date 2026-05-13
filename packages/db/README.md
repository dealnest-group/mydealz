# packages/db — Supabase Client & Migrations

**Owner: Imran**

Single source of truth for database access. All apps import the Supabase client from here — never instantiate `createClient()` directly in app code.

---

## Exports

```typescript
import { supabase } from '@mydealz/db'           // singleton for public reads
import type { Database } from '@mydealz/db'      // full DB type map
```

**Note for web app:** `supabase` here is a session-less singleton — use it for public data (deals, retailers). For auth-aware queries use `apps/web/src/lib/supabase/server.ts` (server) or `client.ts` (browser). See `CLAUDE.md` for the full three-client rule.

---

## Migrations

All schema changes are plain SQL files in `migrations/`, numbered sequentially.

| File | Contents |
|---|---|
| `0001_initial.sql` | Core tables: deals, retailers, price_history, user_profiles, user_signals, agent_logs |
| `0002_social.sql` | deal_ratings, deal_comments, comment_reactions |
| `0003_personalisation.sql` | preferences jsonb on user_profiles; ivfflat embedding indexes |
| `0004_vector_rpc.sql` | `match_deals_for_user()` Postgres RPC function |
| `0005_agent_improvements.sql` | `last_fetched_at` on retailers; pending-deal indexes |
| `0006_rls_and_triggers.sql` | **Full RLS policies on all 9 tables + updated_at triggers** |

**To apply migrations:** Run each SQL file in the Supabase SQL editor in order. Always run all files — there is no migration runner that tracks state yet.

---

## Rules for schema changes

1. **New migration = new numbered file.** Never edit an existing migration file that has already been applied to production.
2. **Migrations require Imran's approval** before merging to `develop`.
3. **RLS on every new table** — add policies to `0006_rls_and_triggers.sql` or a new migration. Never leave a table without RLS.
4. **`updated_at` triggers** — add the `set_updated_at` trigger to any new table that has an `updated_at` column.
5. **Test the migration on the dev Supabase project** before raising a PR.
6. **pgvector columns** use `vector(768)` — the nomic-embed-text dimension. Do not change this.

---

## DB types

`src/types.ts` is the manually-maintained TypeScript type map matching the DB schema. Keep it in sync with migrations. Supabase CLI can auto-generate this — run:

```bash
npx supabase gen types typescript --project-id zadlakzrhyexeluvauun > packages/db/src/types.ts
```
