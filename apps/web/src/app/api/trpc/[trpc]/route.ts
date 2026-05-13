import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter, type Context } from '@mydealz/api'
import { supabase } from '@mydealz/db'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// Route hits the DB on every request — never pre-render at build time
// and never cache a stale response.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const handler = async (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (): Promise<Context> => {
      // Auth-aware server client — reads session from cookies
      const server = createServerClient()
      const { data: { user } } = await server.auth.getUser()

      return {
        // Use the typed singleton for data queries
        supabase,
        userId: user?.id ?? null,
      }
    },
    onError({ path, error }: { path: string | undefined; error: { code: string; message: string } }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        logger.error(`tRPC error on ${path ?? 'unknown'}`, error)
      }
    },
  })

export { handler as GET, handler as POST }
