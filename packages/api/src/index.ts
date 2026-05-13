import { TRPCError, initTRPC } from '@trpc/server'
import { z } from 'zod'
import superjson from 'superjson'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@mydealz/db'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export type Context = {
  supabase: SupabaseClient<Database>
  userId: string | null
}

// ---------------------------------------------------------------------------
// tRPC init
// ---------------------------------------------------------------------------

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router

export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})

// ---------------------------------------------------------------------------
// Deals router
// ---------------------------------------------------------------------------

const dealsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().max(200).optional(),
        limit: z.number().int().min(1).max(100).default(48),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('deals')
        .select(
          `id, title, price_current, price_was, discount_pct,
           authenticity_score, image_url, affiliate_url, url,
           category, created_at,
           retailers ( name, slug )`,
        )
        .eq('status', 'approved')
        .order('authenticity_score', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.category) {
        query = query.ilike('category', `%${input.category}%`)
      }
      if (input.search) {
        query = query.ilike('title', `%${input.search}%`)
      }

      const { data, error } = await query
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }
      return data ?? []
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('deals')
        .select(`*, retailers ( name, slug, base_url )`)
        .eq('id', input.id)
        .eq('status', 'approved')
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found' })
      }
      return data
    }),
})

// ---------------------------------------------------------------------------
// App router — add new routers here as the product grows
// ---------------------------------------------------------------------------

export const appRouter = router({
  deals: dealsRouter,
})

export type AppRouter = typeof appRouter
