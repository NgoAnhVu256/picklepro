'use client'

import { useEffect, useState } from 'react'
import { Save, Store, CreditCard, Truck, Bell, Globe, Shield, AlertCircle, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react'

interface Settings {
  store_name: string
  store_phone: string
  store_email: string
  store_address: string
  shipping_fee: string
  free_shipping_threshold: string
  bank_name: string
  bank_account_number: string
  bank_account_holder: string
  telegram_enabled: boolean
  zalo_link: string
  maintenance_mode: boolean
}

const DEFAULT_SETTINGS: Settings = {
  store_name: 'PicklePro',
  store_phone: '0373 164 472',
  store_email: 'support@picklepro.vn',
  store_address: 'Phú Yên, Việt Nam',
  shipping_fee: '30000',
  free_shipping_threshold: '500000',
  bank_name: 'MBBANK',
  bank_account_number: '2506200466666',
  bank_account_holder: 'NGO TRI ANH VU',
  telegram_enabled: true,
  zalo_link: 'https://zalo.me/0373164472',
  maintenance_mode: false,
}

const Section = ({ title, icon: Icon, iconColor, children }: { title: string; icon: any; iconColor: string; children: React.ReactNode }) => (
  <div className="rounded-2xl bg-card text-card-foreground shadow-sm border border-border overflow-hidden">
    <div className="px-6 py-4 border-b border-border flex items-center gap-2">
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <h2 className="text-foreground font-bold">{title}</h2>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
)

const Field = ({ label, value, onChange, placeholder, type = 'text', disabled = false, icon: Icon }: any) => (
  <div>
    <label className="text-muted-foreground text-xs font-medium mb-1.5 block">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className={`w-full ${Icon ? 'pl-10' : 'px-3'} pr-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
      />
    </div>
  </div>
)

const Toggle = ({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-center gap-4 cursor-pointer p-3 rounded-xl hover:bg-muted transition-all -mx-3">
    <div className="flex-1">
      <p className="text-foreground text-sm font-medium">{label}</p>
      {description && <p className="text-muted-foreground text-xs mt-0.5">{description}</p>}
    </div>
    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-lime' : 'bg-gray-700'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
    </div>
  </label>
)

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) setSettings(s => ({ ...s, ...data.settings }))
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 4000)
  }

  const update = (key: keyof Settings, value: any) => setSettings(s => ({ ...s, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (res.ok) showMessage('success', 'Cài đặt đã được lưu!')
      else showMessage('error', 'Không thể lưu cài đặt')
    } catch { showMessage('error', 'Có lỗi xảy ra') }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />)}
      </div>
    )
  }



  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cài đặt hệ thống</h1>
          <p className="text-muted-foreground text-sm mt-1">Cấu hình cửa hàng và thanh toán</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-foreground transition-all text-sm disabled:opacity-50 shadow-lg shadow-lime/20">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      {/* Toast */}
      {message.text && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
          message.type === 'success' ? 'bg-lime/10 text-lime border border-lime/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Store Info */}
      <Section title="Thông tin cửa hàng" icon={Store} iconColor="text-lime">
        <Field label="Tên cửa hàng" value={settings.store_name} onChange={(v: string) => update('store_name', v)} placeholder="PicklePro" icon={Store} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Số điện thoại" value={settings.store_phone} onChange={(v: string) => update('store_phone', v)} placeholder="0373 164 472" icon={Phone} />
          <Field label="Email liên hệ" value={settings.store_email} onChange={(v: string) => update('store_email', v)} placeholder="support@picklepro.vn" icon={Mail} />
        </div>
        <Field label="Địa chỉ" value={settings.store_address} onChange={(v: string) => update('store_address', v)} placeholder="Phú Yên, Việt Nam" icon={MapPin} />
      </Section>

      {/* Shipping */}
      <Section title="Vận chuyển" icon={Truck} iconColor="text-blue-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phí vận chuyển (VND)" value={settings.shipping_fee} onChange={(v: string) => update('shipping_fee', v)} placeholder="30000" type="number" />
          <Field label="Miễn phí ship từ (VND)" value={settings.free_shipping_threshold} onChange={(v: string) => update('free_shipping_threshold', v)} placeholder="500000" type="number" />
        </div>
        <p className="text-muted-foreground text-xs">Đơn hàng từ {Number(settings.free_shipping_threshold).toLocaleString('vi-VN')}đ sẽ được miễn phí vận chuyển.</p>
      </Section>

      {/* Bank Transfer */}
      <Section title="Thông tin chuyển khoản" icon={CreditCard} iconColor="text-purple-400">
        <Field label="Ngân hàng" value={settings.bank_name} onChange={(v: string) => update('bank_name', v)} placeholder="MBBANK" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Số tài khoản" value={settings.bank_account_number} onChange={(v: string) => update('bank_account_number', v)} placeholder="2506200466666" />
          <Field label="Chủ tài khoản" value={settings.bank_account_holder} onChange={(v: string) => update('bank_account_holder', v)} placeholder="NGO TRI ANH VU" />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Thông báo & Tích hợp" icon={Bell} iconColor="text-yellow-400">
        <Toggle label="Thông báo Telegram" description="Gửi thông báo đơn hàng mới qua Telegram Bot" checked={settings.telegram_enabled} onChange={v => update('telegram_enabled', v)} />
        <Field label="Link Zalo chat" value={settings.zalo_link} onChange={(v: string) => update('zalo_link', v)} placeholder="https://zalo.me/0373164472" icon={Globe} />
      </Section>

      {/* System */}
      <Section title="Hệ thống" icon={Shield} iconColor="text-red-400">
        <Toggle
          label="Chế độ bảo trì"
          description="Khi bật, khách hàng sẽ thấy trang thông báo bảo trì thay vì cửa hàng"
          checked={settings.maintenance_mode}
          onChange={v => update('maintenance_mode', v)}
        />
      </Section>
    </div>
  )
}
