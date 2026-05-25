import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Client sem cookies, para uso em generateStaticParams e build-time
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
