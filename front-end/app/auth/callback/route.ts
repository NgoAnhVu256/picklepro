// ============================================
// OAuth Callback Handler
// Xử lý redirect sau khi đăng nhập Google
// ============================================

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Dùng NEXT_PUBLIC_APP_URL (domain thật) thay vì origin (có thể là Vercel URL)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${appUrl}${next}`)
    }
  }

  // Redirect về trang login nếu có lỗi
  return NextResponse.redirect(`${appUrl}/auth/login?error=auth_failed`)
}
