// ============================================
// Supabase Middleware Helper
// Chỉ refresh session — KHÔNG redirect bắt buộc
// Chỉ bảo vệ trang /checkout (thanh toán)
// ============================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // CHỈ bảo vệ trang thanh toán — mọi trang khác truy cập tự do
  const protectedPaths = ['/checkout']
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname === path // exact match, không match /checkout/success
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', '/checkout')
    return NextResponse.redirect(url)
  }

  // Nếu đã đăng nhập và vào trang auth → redirect về trang chủ
  const authPaths = ['/auth/login', '/auth/register']
  const isAuthPage = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPage && user) {
    // Nếu có redirect param → đi tới đó
    const redirect = request.nextUrl.searchParams.get('redirect') || '/'
    const url = request.nextUrl.clone()
    url.pathname = redirect
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
