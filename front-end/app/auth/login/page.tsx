'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Loader2, ShoppingCart, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectTo = searchParams?.get('redirect') || null
  const authError = searchParams?.get('error') || null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState(authError === 'auth_failed' ? 'Đăng nhập thất bại. Vui lòng thử lại.' : '')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Map Supabase errors to Vietnamese messages
        const errorMessages: Record<string, string> = {
          'Invalid login credentials': 'Email hoặc mật khẩu không đúng',
          'Email not confirmed': 'Vui lòng xác nhận email trước khi đăng nhập',
          'Too many requests': 'Quá nhiều lần thử. Vui lòng đợi một lát.',
        }
        setError(errorMessages[authError.message] || `Lỗi: ${authError.message}`)
        setLoading(false)
        return
      }

      if (data.user) {
        setSuccess('Đăng nhập thành công! Đang chuyển trang...')
        // Redirect
        setTimeout(() => {
          router.push(redirectTo || '/')
          router.refresh()
        }, 800)
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo || '/')}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        setError(`Lỗi đăng nhập Google: ${error.message}`)
        setGoogleLoading(false)
      }
      // Nếu thành công, Supabase sẽ tự redirect đến Google
    } catch (err) {
      setError('Không thể kết nối Google. Vui lòng thử lại.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* LEFT: Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-col items-center justify-center bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#0369a1] overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 bg-white/10 rounded-full" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 left-[-40px] w-40 h-40 bg-sky-300/20 rounded-full" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/5 rounded-full" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          {/* Logo */}
          <div className="w-40 h-40 relative mb-8 drop-shadow-2xl">
            <img src="/logo.png" alt="PicklePro" className="w-full h-full object-contain" />
          </div>

          {/* Tagline */}
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white mb-4 leading-tight">
            Hệ thống quản lý<br />cửa hàng PicklePro
          </h1>
          <p className="text-sky-100 text-base leading-relaxed max-w-xs">
            Nền tảng thương mại PickleBall chuyên nghiệp — quản lý sản phẩm, đơn hàng và khách hàng dễ dàng.
          </p>
        </div>

        {/* Bottom copyright */}
        <p className="absolute bottom-6 text-sky-200/60 text-xs">© 2026 PicklePro. All rights reserved.</p>
      </div>

      {/* RIGHT: Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 sm:px-12 py-12 relative">
        {/* Mobile logo (shown on small screens) */}
        <div className="lg:hidden mb-8">
          <img src="/logo.png" alt="PicklePro" className="h-20 object-contain mx-auto" />
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <img src="/logo.png" alt="" className="h-9 w-9 object-contain hidden lg:block" />
              <span className="text-sky-600 text-xl font-extrabold tracking-wide" style={{ fontFamily: "'Google Sans', sans-serif" }}>PicklePro</span>
            </div>
            <p className="text-gray-400 text-sm font-medium mt-1">Đăng nhập để truy cập hệ thống</p>
          </div>

          {/* Checkout banner */}
          {redirectTo === '/checkout' && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 border border-sky-200 mb-6 text-sm">
              <ShoppingCart className="h-5 w-5 text-sky-600 shrink-0" />
              <p className="text-gray-700">Vui lòng <b>đăng nhập</b> để tiếp tục thanh toán.</p>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-4">{error}</div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm flex items-center gap-2 mb-4">
              <CheckCircle className="h-4 w-4 shrink-0" /> {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-base font-semibold text-gray-700" style={{ fontFamily: "'Google Sans', sans-serif" }}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-lg border-gray-200 focus:border-sky-400 focus:ring-sky-400/20 bg-gray-50/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base font-semibold text-gray-700" style={{ fontFamily: "'Google Sans', sans-serif" }}>Mật khẩu</Label>
                <Link href="#" className="text-sm text-sky-500 hover:underline font-medium">Quên mật khẩu?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-lg border-gray-200 focus:border-sky-400 bg-gray-50/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !!success}
              className="w-full h-12 rounded-xl font-bold text-base bg-sky-500 hover:bg-sky-600 text-white transition-all shadow-md shadow-sky-500/30 active:scale-[0.98] mt-2"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng nhập'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-sm text-gray-400 font-medium">hoặc</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-semibold text-gray-700 text-base disabled:opacity-60"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {googleLoading ? 'Đang chuyển đến Google...' : 'Tiếp tục với Google'}
          </button>

          {/* Register */}
          <p className="text-center text-base text-gray-500 mt-6" style={{ fontFamily: "'Google Sans', sans-serif" }}>
            Chưa có tài khoản?{' '}
            <Link href={`/auth/register${redirectTo ? `?redirect=${redirectTo}` : ''}`} className="text-sky-500 font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
