'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Loader2, ShoppingCart, CheckCircle, User, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { validatePhone, formatPhoneInput, isPhoneValid } from '@/lib/validate-phone'

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectTo = searchParams?.get('redirect') || null
  const authError = searchParams?.get('error') || null
  const initialMode = searchParams?.get('mode') === 'register' ? 'register' : 'login'
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState(authError === 'auth_failed' ? 'Đăng nhập thất bại. Vui lòng thử lại.' : '')
  const [loginSuccess, setLoginSuccess] = useState('')

  const [registerForm, setRegisterForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const [googleLoading, setGoogleLoading] = useState(false)

  // Domain thật cho redirect (tránh redirect về Vercel URL)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  const passwordChecks = [
    { label: 'Tối thiểu 6 ký tự', ok: registerForm.password.length >= 6 },
    { label: 'Ít nhất 1 chữ hoa', ok: /[A-Z]/.test(registerForm.password) },
    { label: 'Ít nhất 1 chữ số', ok: /[0-9]/.test(registerForm.password) },
  ]

  const updateRegister = (key: string, value: string) => {
    setRegisterForm(prev => ({ ...prev, [key]: value }))
  }

  const handlePhoneChange = (value: string) => {
    const cleaned = formatPhoneInput(value)
    updateRegister('phone', cleaned)
    if (cleaned.length > 0) setPhoneError(validatePhone(cleaned) ?? '')
    else setPhoneError('')
  }

  const onSwitchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode)
    setLoginError('')
    setRegisterError('')
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    setLoginSuccess('')

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (authError) {
        const errorMessages: Record<string, string> = {
          'Invalid login credentials': 'Email hoặc mật khẩu không đúng',
          'Email not confirmed': 'Vui lòng xác nhận email trước khi đăng nhập',
          'Too many requests': 'Quá nhiều lần thử. Vui lòng đợi một lát.',
        }
        setLoginError(errorMessages[authError.message] || `Lỗi: ${authError.message}`)
        setLoginLoading(false)
        return
      }

      if (data.user) {
        setLoginSuccess('Đăng nhập thành công! Đang chuyển trang...')
        setTimeout(() => {
          router.push(redirectTo || '/')
          router.refresh()
        }, 800)
      }
    } catch (err) {
      setLoginError('Có lỗi xảy ra. Vui lòng thử lại.')
      setLoginLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    setLoginError('')
    setRegisterError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(redirectTo || '/')}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        const message = `Lỗi xác thực Google: ${error.message}`
        if (mode === 'login') setLoginError(message)
        else setRegisterError(message)
        setGoogleLoading(false)
      }
    } catch (err) {
      const message = 'Không thể kết nối Google. Vui lòng thử lại.'
      if (mode === 'login') setLoginError(message)
      else setRegisterError(message)
      setGoogleLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')
    setRegisterSuccess('')

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError('Mật khẩu không khớp')
      return
    }

    if (!passwordChecks.every(check => check.ok)) {
      setRegisterError('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu.')
      return
    }

    setRegisterLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: {
            full_name: registerForm.fullName,
            phone: registerForm.phone || undefined,
          },
          emailRedirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(redirectTo || '/')}`,
        },
      })

      if (authError) {
        const errorMessages: Record<string, string> = {
          'User already registered': 'Email này đã được đăng ký. Vui lòng đăng nhập.',
          'Password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
          'Unable to validate email address: invalid format': 'Định dạng email không hợp lệ',
          'Signup requires a valid password': 'Vui lòng nhập mật khẩu hợp lệ',
        }
        setRegisterError(errorMessages[authError.message] || `Lỗi: ${authError.message}`)
        setRegisterLoading(false)
        return
      }

      if (data.user) {
        if (data.user.identities?.length === 0) {
          setRegisterError('Email này đã được đăng ký. Vui lòng đăng nhập.')
          setRegisterLoading(false)
          return
        }

        if (data.session) {
          setRegisterSuccess('Đăng ký thành công! Đang chuyển trang...')
          setTimeout(() => {
            router.push(redirectTo || '/')
            router.refresh()
          }, 1000)
          return
        }

        setRegisterSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.')
        setRegisterLoading(false)
      }
    } catch {
      setRegisterError('Có lỗi xảy ra. Vui lòng thử lại.')
      setRegisterLoading(false)
    }
  }

  // ==================== GOOGLE BUTTON ====================
  const GoogleButton = ({ label }: { label: string }) => (
    <button
      onClick={handleGoogleAuth}
      disabled={googleLoading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-emerald-200 hover:bg-emerald-50/50 transition-colors font-semibold text-gray-700 text-base disabled:opacity-60"
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
      {googleLoading ? 'Đang chuyển đến Google...' : label}
    </button>
  )

  // ==================== BRANDING PANEL ====================
  const BrandingPanel = ({ isRegisterSide = false }: { isRegisterSide?: boolean }) => (
    <div className="relative flex flex-col items-center justify-center px-12 py-16 overflow-hidden h-full"
      style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 30%, #6ee7b7 70%, #34d399 100%)' }}>
      {/* Decorative circles */}
      <div className="absolute top-[-80px] left-[-80px] w-80 h-80 bg-white/20 rounded-full" />
      <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 bg-white/20 rounded-full" />
      <div className="absolute top-1/2 left-[-40px] w-40 h-40 bg-emerald-300/30 rounded-full" />
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-36 h-36 relative mb-8 drop-shadow-2xl">
          <img src="/favicon.ico" alt="PicklePro" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl xl:text-4xl font-extrabold text-emerald-900 mb-4 leading-tight">
          {isRegisterSide ? (
            <>Đã có tài khoản?</>
          ) : (
            <>Chào mừng trở lại!</>
          )}
        </h1>
        <p className="text-emerald-700 text-base leading-relaxed max-w-xs mb-8">
          {isRegisterSide
            ? 'Đăng nhập để tiếp tục trải nghiệm mua sắm và quản lý đơn hàng của bạn.'
            : 'Tạo tài khoản để khám phá bộ sưu tập Pickleball chính hãng từ các thương hiệu hàng đầu.'
          }
        </p>
        <button
          type="button"
          onClick={() => onSwitchMode(isRegisterSide ? 'login' : 'register')}
          className="px-8 py-3 rounded-full border-2 border-emerald-800 text-emerald-900 font-bold text-sm uppercase tracking-wide hover:bg-emerald-800 hover:text-white transition-all duration-300"
        >
          {isRegisterSide ? 'Đăng nhập' : 'Đăng ký ngay'}
        </button>
      </div>
      <p className="absolute bottom-6 text-emerald-600/50 text-xs">© 2026 PicklePro. All rights reserved.</p>
    </div>
  )

  // ==================== LOGIN FORM ====================
  const LoginForm = ({ compact = false }: { compact?: boolean }) => (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <img src="/favicon.ico" alt="" className="h-9 w-9 object-contain" />
          <span className="text-emerald-700 text-xl font-extrabold tracking-wide" style={{ fontFamily: "'Google Sans', sans-serif" }}>PicklePro</span>
        </div>
        <p className="text-gray-400 text-sm font-medium mt-1">Đăng nhập để truy cập hệ thống</p>
      </div>

      {redirectTo === '/checkout' && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-6 text-sm">
          <ShoppingCart className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-gray-700">Vui lòng <b>đăng nhập</b> để tiếp tục thanh toán.</p>
        </div>
      )}

      {loginError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-4">{loginError}</div>
      )}
      {loginSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm flex items-center gap-2 mb-4">
          <CheckCircle className="h-4 w-4 shrink-0" /> {loginSuccess}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="login-email" className="text-base font-semibold text-gray-700" style={{ fontFamily: "'Google Sans', sans-serif" }}>Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="login-email"
              type="email"
              placeholder="your@email.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="pl-10 h-11 rounded-lg border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 bg-gray-50/50"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-base font-semibold text-gray-700" style={{ fontFamily: "'Google Sans', sans-serif" }}>Mật khẩu</Label>
            <Link href="#" className="text-sm text-emerald-500 hover:underline font-medium">Quên mật khẩu?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="login-password"
              type={showLoginPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-lg border-gray-200 focus:border-emerald-400 bg-gray-50/50"
              required
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loginLoading || !!loginSuccess}
          className="w-full h-12 rounded-xl font-bold text-base text-white transition-all shadow-md shadow-emerald-500/30 active:scale-[0.98] mt-2"
          style={{ background: 'linear-gradient(135deg, #34d399, #059669)', fontFamily: "'Google Sans', sans-serif" }}
        >
          {loginLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng nhập'}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-sm text-gray-400 font-medium">hoặc</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <GoogleButton label="Tiếp tục với Google" />

      {compact && (
        <p className="text-center text-base text-gray-500 mt-6" style={{ fontFamily: "'Google Sans', sans-serif" }}>
          Chưa có tài khoản?{' '}
          <button type="button" onClick={() => onSwitchMode('register')} className="text-emerald-600 font-bold hover:underline">
            Đăng ký ngay
          </button>
        </p>
      )}
    </div>
  )

  // ==================== REGISTER FORM ====================
  const RegisterForm = ({ compact = false }: { compact?: boolean }) => (
    <div className="w-full max-w-sm">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <img src="/favicon.ico" alt="" className="h-9 w-9 object-contain" />
          <span className="text-emerald-700 text-xl font-extrabold tracking-wide" style={{ fontFamily: "'Google Sans', sans-serif" }}>PicklePro</span>
        </div>
        <p className="text-gray-400 text-sm font-medium mt-1">Tạo tài khoản mới để tiếp tục</p>
      </div>

      {registerError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-4">{registerError}</div>
      )}
      {registerSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm flex items-center gap-2 mb-4">
          <CheckCircle className="h-4 w-4 shrink-0" /> {registerSuccess}
        </div>
      )}

      <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <Label className="text-sm font-semibold text-gray-700">Họ và tên</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Nguyễn Văn A"
              value={registerForm.fullName}
              onChange={(e) => updateRegister('fullName', e.target.value)}
              className="pl-10 h-10 rounded-lg border-gray-200 focus:border-emerald-400 bg-gray-50/50"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-semibold text-gray-700">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="email"
              placeholder="your@email.com"
              value={registerForm.email}
              onChange={(e) => updateRegister('email', e.target.value)}
              className="pl-10 h-10 rounded-lg border-gray-200 focus:border-emerald-400 bg-gray-50/50"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-semibold text-gray-700">Số điện thoại (tùy chọn)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Input
              placeholder="0912 345 678"
              value={registerForm.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              maxLength={12}
              inputMode="tel"
              className={`pl-10 pr-10 h-10 rounded-lg transition-colors ${
                phoneError
                  ? 'border-red-500 focus:border-red-500'
                  : registerForm.phone && isPhoneValid(registerForm.phone)
                    ? 'border-emerald-500 focus:border-emerald-500'
                    : 'border-gray-200 focus:border-emerald-400'
              }`}
            />
            {registerForm.phone && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {isPhoneValid(registerForm.phone)
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  : <AlertCircle className="h-4 w-4 text-red-500" />}
              </span>
            )}
          </div>
          {phoneError && (
            <p className="text-red-500 text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {phoneError}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-semibold text-gray-700">Mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type={showRegisterPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={registerForm.password}
              onChange={(e) => updateRegister('password', e.target.value)}
              className="pl-10 pr-10 h-10 rounded-lg border-gray-200 focus:border-emerald-400 bg-gray-50/50"
              required
            />
            <button
              type="button"
              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {registerForm.password && (
            <div className="space-y-0.5 pt-1">
              {passwordChecks.map(({ label, ok }) => (
                <div key={label} className={`flex items-center gap-2 text-xs ${ok ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <CheckCircle2 className={`h-3.5 w-3.5 ${ok ? 'text-emerald-600' : 'text-gray-300'}`} /> {label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-semibold text-gray-700">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="password"
              placeholder="••••••••"
              value={registerForm.confirmPassword}
              onChange={(e) => updateRegister('confirmPassword', e.target.value)}
              className="pl-10 h-10 rounded-lg border-gray-200 focus:border-emerald-400 bg-gray-50/50"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={registerLoading || !!registerSuccess}
          className="w-full h-11 rounded-xl font-bold text-base text-white transition-all shadow-md shadow-emerald-500/30"
          style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}
        >
          {registerLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Tạo tài khoản <ArrowRight className="h-4 w-4 ml-2" /></>}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-sm text-gray-400 font-medium">hoặc</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <GoogleButton label="Đăng ký với Google" />

      {compact && (
        <p className="text-center text-base text-gray-500 mt-5" style={{ fontFamily: "'Google Sans', sans-serif" }}>
          Đã có tài khoản?{' '}
          <button type="button" onClick={() => onSwitchMode('login')} className="text-emerald-600 font-bold hover:underline">
            Đăng nhập
          </button>
        </p>
      )}
    </div>
  )

  // ==================== DESKTOP: SLIDING OVERLAY ====================
  const isRegister = mode === 'register'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 lg:py-10"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #d1fae5 100%)' }}>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:block w-full max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-emerald-100 bg-white" style={{ minHeight: '680px' }}>
          
          {/* Form containers - both always rendered, positioned absolute */}
          {/* LOGIN FORM - right side */}
          <div className={`absolute top-0 right-0 w-1/2 h-full flex items-center justify-center px-8 py-10 bg-white transition-all duration-700 ease-in-out ${
            isRegister ? 'opacity-0 pointer-events-none translate-x-[20%]' : 'opacity-100 translate-x-0'
          }`}>
            <LoginForm />
          </div>

          {/* REGISTER FORM - left side */}
          <div className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center px-8 py-10 bg-white transition-all duration-700 ease-in-out ${
            isRegister ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-[20%]'
          }`}>
            <RegisterForm />
          </div>

          {/* SLIDING OVERLAY PANEL */}
          <div className={`absolute top-0 w-1/2 h-full transition-transform duration-700 ease-in-out z-20 ${
            isRegister ? 'translate-x-full' : 'translate-x-0'
          }`} style={{ left: 0 }}>
            <BrandingPanel isRegisterSide={isRegister} />
          </div>
        </div>
      </div>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="w-full max-w-md lg:hidden">
        <div className="mb-6 text-center">
          <img src="/favicon.ico" alt="PicklePro" className="h-16 w-16 mx-auto object-contain mb-3" />
          <h1 className="text-2xl font-extrabold text-emerald-700">PicklePro</h1>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-lg">
          <div className="grid grid-cols-2 gap-2 mb-5 p-1 rounded-xl" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
            <button
              type="button"
              onClick={() => onSwitchMode('login')}
              className={`h-10 rounded-lg text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-600'}`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode('register')}
              className={`h-10 rounded-lg text-sm font-semibold transition-colors ${mode === 'register' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-600'}`}
            >
              Đăng ký
            </button>
          </div>
          {mode === 'login' ? <LoginForm compact /> : <RegisterForm compact />}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)' }}>
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
