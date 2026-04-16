'use client'

import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone, MapPin, Camera, Package, Settings, LogOut, Shield, Bell, Save, Loader2, CheckCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { validatePhone, formatPhoneInput, isPhoneValid } from '@/lib/validate-phone'
import { AddressPicker } from '@/components/pickleball/address-picker'

interface UserProfile {
  id: string
  email: string
  fullName: string
  phone: string
  address: string
  avatarUrl: string
}

export default function AccountPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState({ fullName: '', phone: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [phoneError, setPhoneError] = useState('')
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.status === 401) {
        router.push('/auth/login?redirect=/account')
        return
      }
      const data = await res.json()
      if (data.user) {
        setProfile(data.user)
        setForm({
          fullName: data.user.fullName || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
        })
        setOrderCount(data.stats?.orderCount || 0)
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const stats = [
    { label: 'Đơn hàng', value: String(orderCount), icon: Package, color: 'from-lime to-lime-dark' },
    { label: 'Yêu thích', value: '0', icon: Shield, color: 'from-pink-400 to-red-400' },
    { label: 'Điểm thưởng', value: '0', icon: Bell, color: 'from-amber-400 to-orange-400' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9]">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-lime-dark" />
          <p className="text-muted-foreground mt-4">Đang tải thông tin...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9]">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Avatar */}
              <div className="text-center p-6 rounded-3xl border border-lime/20 bg-gradient-to-b from-lime/5 to-transparent">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center text-4xl shadow-xl">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-3xl font-bold">{(form.fullName || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-lime border-2 border-background flex items-center justify-center hover:bg-lime-dark transition-colors shadow-lg">
                    <Camera className="h-3.5 w-3.5 text-lime-dark" />
                  </button>
                </div>
                <h3 className="font-bold text-foreground">{form.fullName || 'Người dùng'}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {stats.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="text-center p-3 rounded-2xl border border-lime/10 bg-gradient-to-b from-lime/5 to-transparent">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${color} mb-1`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {/* Nav */}
              <nav className="rounded-2xl border border-lime/10 overflow-hidden">
                {[
                  { href: '/account', label: 'Thông tin cá nhân', icon: User, active: true },
                  { href: '/account/orders', label: 'Đơn hàng của tôi', icon: Package, active: false },
                ].map(({ href, label, icon: Icon, active }) => (
                  <Link key={href} href={href} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-lime/10 text-lime-dark border-l-3 border-lime-dark' : 'text-muted-foreground hover:bg-muted/50'}`}>
                    <Icon className="h-4 w-4" /> {label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 w-full transition-colors">
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-lime/20 bg-gradient-to-b from-lime/5 to-transparent p-6 md:p-8">
              <h2 className="text-2xl font-extrabold text-foreground mb-6">Thông tin cá nhân</h2>

              {saved && (
                <div className="p-3 rounded-xl bg-lime/10 border border-lime/20 text-lime-dark text-sm flex items-center gap-2 mb-6">
                  <CheckCircle className="h-4 w-4" /> Đã lưu thông tin thành công!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={form.fullName} onChange={e => update('fullName', e.target.value)} className="pl-10 rounded-xl border-lime/30 h-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={profile?.email || ''} disabled className="pl-10 rounded-xl border-lime/30 h-12 opacity-60 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      value={form.phone}
                      onChange={e => {
                        const cleaned = formatPhoneInput(e.target.value)
                        setForm(f => ({ ...f, phone: cleaned }))
                        if (cleaned.length > 0) setPhoneError(validatePhone(cleaned) ?? '')
                        else setPhoneError('')
                      }}
                      maxLength={12}
                      inputMode="tel"
                      placeholder="0912 345 678"
                      className={`pl-10 pr-10 rounded-xl h-12 transition-colors ${
                        phoneError
                          ? 'border-red-500 focus:border-red-500'
                          : form.phone && isPhoneValid(form.phone)
                          ? 'border-lime focus:border-lime'
                          : 'border-lime/30'
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
                <div className="space-y-2 md:col-span-2">
                  <AddressPicker 
                     initialAddress={form.address} 
                     onChange={(full) => update('address', full)} 
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="mt-8 rounded-xl h-12 px-8 bg-lime-dark hover:bg-lime-dark/80 text-white font-bold shadow-lg shadow-lime-dark/20 active:scale-95 transition-all">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Lưu thay đổi</>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
