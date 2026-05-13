# packages/api — tRPC Router

**Owner: Imran**

Shared tRPC v11 router consumed by `apps/web` and (soon) `apps/mobile` and `apps/extension`. End-to-end type safety from DB to client — no REST.

---

## Current procedures

| Procedure | Type | Input | Description |
|---|---|---|---|
| `deals.list` | query | `{ category?, search?, limit?, offset? }` | Paginated approved deals feed |
| `deals.getById` | query | `{ id: uuid }` | Single deal by ID |

More procedures will be added as features require them. The web app currently queries Supabase directly for server components — tRPC is used by mobile and extension.

---

## Rules

1. **Every procedure must have a Zod input schema** — even if it's `z.object({})`.
2. **Authenticated procedures** use `protectedProcedure` — throws `UNAUTHORIZED` if no session.
3. **No direct DB calls** — access Supabase via the `ctx.supabase` client passed through context.
4. **No `any` types** — use `Database` types from `@mydealz/db`.
5. **Pagination** — all list procedures must support `limit` (max 100) and `offset`.

---

## Context

The tRPC context (`Context` type) is created per-request by the Next.js API route handler at `apps/web/src/app/api/trpc/[trpc]/route.ts`. It includes:
- `supabase` — a Supabase client with the current user's auth cookies
- `userId` — the authenticated user's ID, or `null` for unauthenticated requests

---

## Adding a new procedure

```typescript
// packages/api/src/index.ts — add to the relevant router

const yourRouter = router({
  doSomething: publicProcedure  // or protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('your_table')
        .select('*')
        .eq('id', input.id)
        .single()
      if (error || !data) throw new TRPCError({ code: 'NOT_FOUND' })
      return data
    }),
})
```

Write a test in `src/__tests__/your_router.test.ts` using the mock Supabase context.
