import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com a service role key — só pode ser usado em código
 * server-side (route handlers, server actions). Tem acesso total ao banco
 * e à API de administração de usuários (auth.admin.*), ignorando RLS.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
