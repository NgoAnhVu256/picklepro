// ============================================
// Supabase Browser Client
// Dùng trong Client Components (use client)
// ============================================

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@picklepro/back-end'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
