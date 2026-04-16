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

  // Lấy settings từ bảng app_settings để kiểm tra chế độ bảo trì
  const { data: settingsData } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'system_settings')
    .single()

  const settings = settingsData?.value as Record<string, any> | null

  // Paths mà lúc nào cũng được phép truy cập
  const bypassPaths = ['/maintenance', '/admin', '/auth', '/api', '/_next']
  const isBypassed = bypassPaths.some(p => request.nextUrl.pathname.startsWith(p))

  // NẾU: đang bảo trì, KHÔNG thuộc path bị bypass, và user chưa đăng nhập → Chuyển hướng sang trang bảo trì
  if (settings?.maintenance_mode === true && !isBypassed && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/maintenance'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
