import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter, type Context } from '@mydealz/api'
import { createClient } from '@mydealz/db'
import { createClient as createServerClient } from '@/lib/supabase/server'

const handler = async (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (): Promise<Context> => {
      // Auth-aware server client — reads session from cookies
      const supabase = createServerClient()
      const { data: { user } } = await supabase.auth.getUser()

      return {
        // Use the typed singleton for data queries
        supabase: createClient(),
        userId: user?.id ?? null,
      }
    },
    onError({ path, error }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        // Will be picked up by Sentry via the global error handler
        console.error(`tRPC error on ${path ?? 'unknown'}:`, error) // eslint-disable-line no-console
      }
    },
  })

export { handler as GET, handler as POST }
