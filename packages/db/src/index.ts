import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Lazy-init the client so module load never fails when env vars are missing
// (Vercel build does page-data collection by importing modules — that
// pass shouldn't crash just because runtime env vars aren't injected yet).
let _client: SupabaseClient<Database> | null = null

function buildClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Supabase renamed anon key to publishable key in 2024 — support both
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    // Defer the error to first actual query rather than module load
    throw new Error(
      'Supabase env vars missing: set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)',
    )
  }
  return createClient<Database>(url, key)
}

// Proxy that builds the real client on first access. Existing imports of
// `supabase` keep working — `supabase.from(...)` triggers buildClient() once.
export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    if (!_client) _client = buildClient()
    return Reflect.get(_client, prop, receiver)
  },
})

// For callers that want explicit control over when the client is built.
export function createSupabaseClient(): SupabaseClient<Database> {
  return buildClient()
}

// Export types
export type { Database } from './types'
export type { SupabaseClient }
// Convenience alias for callers that want a fully-typed client without
// repeating <Database> at every type position.
export type TypedSupabaseClient = SupabaseClient<Database>