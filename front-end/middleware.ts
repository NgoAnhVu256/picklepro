import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 1. Refresh Supabase Session & Handle Auth Redirects
  // Hàm này trả về NextResponse (đã set các tham số và config cookie lại)
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match tất cả request paths trừ:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, logo.png, logo.svg (icons)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

