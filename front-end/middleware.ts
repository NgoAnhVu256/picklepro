import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Các path không bị chặn dù đang bảo trì
const BYPASS_PATHS = [
  '/maintenance',
  '/admin',
  '/auth',
  '/api',
  '/_next',
  '/favicon',
  '/logo',
  '/og-image',
  '/apple-icon',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bỏ qua các path bypass
  const isBypassed = BYPASS_PATHS.some(p => pathname.startsWith(p))
  if (isBypassed) return NextResponse.next()

  try {
    // Tạo Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    )

    // Lấy settings từ Supabase
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'system_settings')
      .single()

    const settings = data?.value as Record<string, any> | null

    // Nếu bảo trì đang bật
    if (settings?.maintenance_mode === true) {
      // Kiểm tra user có phải admin không
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Chưa đăng nhập → hiện trang bảo trì
        return NextResponse.redirect(new URL('/maintenance', request.url))
      }
      // Đã đăng nhập → cho phép qua (admin sẽ vào /admin để tắt bảo trì)
    }
  } catch {
    // Nếu lỗi DB → cho phép qua bình thường
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Chạy trên tất cả path trừ static files và _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
