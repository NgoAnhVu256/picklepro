'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, CheckCircle2, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { validatePhone, formatPhoneInput, isPhoneValid } from '@/lib/validate-phone'

function RegisterContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectTo = searchParams?.get('redirect') || null

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handlePhoneChange = (value: string) => {
    const cleaned = formatPhoneInput(value)
    update('phone', cleaned)
    if (cleaned.length > 0) setPhoneError(validatePhone(cleaned) ?? '')
    else setPhoneError('')
  }

  const passwordChecks = [
    { label: 'Tối thiểu 6 ký tự', ok: form.password.length >= 6 },
    { label: 'Ít nhất 1 chữ hoa', ok: /[A-Z]/.test(form.password) },
    { label: 'Ít nhất 1 chữ số', ok: /[0-9]/.test(form.password) },
  ]

  const handleGoogleRegister = async () => {
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
        setError(`Lỗi đăng ký Google: ${error.message}`)
        setGoogleLoading(false)
      }
      // Nếu thành công, Supabase sẽ tự redirect đến Google
    } catch (err) {
      setError('Không thể kết nối Google. Vui lòng thử lại.')
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }
    if (!passwordChecks.every(c => c.ok)) {
      setError('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone: form.phone || undefined,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo || '/')}`,
        },
      })

      if (authError) {
        // Map Supabase errors to Vietnamese messages
        const errorMessages: Record<string, string> = {
          'User already registered': 'Email này đã được đăng ký. Vui lòng đăng nhập.',
          'Password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
          'Unable to validate email address: invalid format': 'Định dạng email không hợp lệ',
          'Signup requires a valid password': 'Vui lòng nhập mật khẩu hợp lệ',
        }
        setError(errorMessages[authError.message] || `Lỗi: ${authError.message}`)
        setLoading(false)
        return
      }

      if (data.user) {
        // Kiểm tra xem có cần xác nhận email không
        if (data.user.identities?.length === 0) {
          setError('Email này đã được đăng ký. Vui lòng đăng nhập.')
          setLoading(false)
          return
        }

        if (data.session) {
          // Đăng ký thành công + tự động đăng nhập (email confirm disabled)
          setSuccess('Đăng ký thành công! Đang chuyển trang...')
          setTimeout(() => {
            router.push(redirectTo || '/')
            router.refresh()
          }, 1000)
        } else {
          // Cần xác nhận email
          setSuccess('Đăng ký thành công! 📧 Vui lòng kiểm tra email để xác nhận tài khoản.')
          setLoading(false)
        }
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-lime/20 via-lime-light/30 to-lime/20 rounded-[2rem] blur-2xl opacity-50" />

          <div className="relative bg-card/80 backdrop-blur-xl border border-lime/20 rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-lime to-lime-dark mb-4 shadow-lg">
                <span className="text-3xl">🏓</span>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground">Tạo tài khoản</h1>
              <p className="text-muted-foreground text-sm mt-1">Tham gia cộng đồng PicklePro</p>
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleRegister}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border hover:bg-muted/50 transition-colors mb-6 font-medium text-foreground disabled:opacity-60"
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
              {googleLoading ? 'Đang chuyển đến Google...' : 'Đăng ký với Google'}
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">hoặc đăng ký bằng email</span><div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">{error}</div>}
              {success && (
                <div className="p-3 rounded-xl bg-lime/10 border border-lime/20 text-lime-dark text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" /> {success}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Nguyễn Văn A" value={form.fullName} onChange={e => update('fullName', e.target.value)} className="pl-10 rounded-xl border-lime/30 focus:border-lime h-12" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="your@email.com" value={form.email} onChange={e => update('email', e.target.value)} className="pl-10 rounded-xl border-lime/30 focus:border-lime h-12" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Số điện thoại <span className="text-muted-foreground">(tùy chọn)</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="0912 345 678"
                    value={form.phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    maxLength={12}
                    inputMode="tel"
                    className={`pl-10 pr-10 rounded-xl h-12 transition-colors ${
                      phoneError
                        ? 'border-red-500 focus:border-red-500'
                        : form.phone && isPhoneValid(form.phone)
                        ? 'border-lime focus:border-lime'
                        : 'border-lime/30 focus:border-lime'
                    }`}
                  />
                  {form.phone && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isPhoneValid(form.phone)
                        ? <CheckCircle2 className="h-4 w-4 text-lime" />
                        : <AlertCircle className="h-4 w-4 text-red-500" />}
                    </span>
                  )}
                </div>
                {phoneError && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {phoneError}
                  </p>
                )}
                {form.phone && isPhoneValid(form.phone) && (
                  <p className="text-lime text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Số điện thoại hợp lệ
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type={showPassword ? 'text' : 'password'} placeholder="••••••" value={form.password} onChange={e => update('password', e.target.value)} className="pl-10 pr-10 rounded-xl border-lime/30 focus:border-lime h-12" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="space-y-1 pt-1">
                    {passwordChecks.map(({ label, ok }) => (
                      <div key={label} className={`flex items-center gap-2 text-xs ${ok ? 'text-lime-dark' : 'text-muted-foreground'}`}>
                        <CheckCircle2 className={`h-3.5 w-3.5 ${ok ? 'text-lime-dark' : 'text-muted/50'}`} /> {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className="pl-10 rounded-xl border-lime/30 focus:border-lime h-12" required />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500">Mật khẩu không khớp</p>
                )}
              </div>

              <Button type="submit" disabled={loading || !!success} className="w-full rounded-xl h-12 text-base font-bold bg-lime-dark hover:bg-lime-dark/80 text-white transition-all shadow-lg shadow-lime-dark/20">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Tạo tài khoản <ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Đã có tài khoản?{' '}<Link href={`/auth/login${redirectTo ? `?redirect=${redirectTo}` : ''}`} className="text-lime-dark font-semibold hover:underline">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-lime-dark" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
