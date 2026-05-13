import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Supabase renamed anon key to publishable key in 2024 — support both
const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export types
export type { Database } from './types'
export type { SupabaseClient }
// Convenience alias for callers that want a fully-typed client without
// repeating <Database> at every type position.
export type TypedSupabaseClient = SupabaseClient<Database>