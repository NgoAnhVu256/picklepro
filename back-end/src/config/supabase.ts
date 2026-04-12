// ============================================
// Supabase Admin Client (Service Role)
// Sử dụng cho backend services - bypass RLS
// KHÔNG BAO GIỜ expose ra client-side
// ============================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

let _client: SupabaseClient<Database> | null = null

function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRoleKey) {
      throw new Error(
        '[Supabase] Thiếu biến môi trường: NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY'
      )
    }

    _client = createClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _client
}

// Lazy export — hoạt động như Supabase client bình thường
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop]
  },
})
