import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

let supabaseServerInstance: SupabaseClient<Database> | null = null

function getSupabaseServer() {
  if (supabaseServerInstance) {
    return supabaseServerInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables for server. Please check your .env.local file.\n' +
      `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'set' : 'missing'}\n` +
      `SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'set' : 'missing'}`
    )
  }

  // Server-side client with service role key for bypassing RLS
  supabaseServerInstance = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return supabaseServerInstance
}

// Export as a getter to ensure lazy initialization
export const supabaseServer = new Proxy({} as SupabaseClient<Database>, {
  get: (_target, prop) => {
    const client = getSupabaseServer()
    return (client as any)[prop]
  }
})
