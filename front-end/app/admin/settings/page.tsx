'use client'

import { useEffect, useState } from 'react'
import { Save, CheckCircle2, AlertCircle, Globe, Monitor, Share2, Search } from 'lucide-react'
import { toast } from 'sonner'

// ============================================================
// Types
// ============================================================
interface SiteSettings {
  // Thông tin chung
  currency: string
  timezone: string
  language: string
  date_format: string
  vat_rate: number
  import_tax_rate: number
  // Công ty
  store_name: string
  store_phone: string
  store_email: string
  store_address: string
  store_website: string
  // Giao diện
  primary_color: string
  logo_url: string
  announcement_enabled: boolean
  maintenance_mode: boolean
  // Mạng xã hội
  facebook_url: string
  instagram_url: string
  youtube_url: string
  zalo_link: string
  tiktok_url: string
  // SEO
  seo_title: string
  seo_description: string
  seo_keywords: string
  og_image_url: string
}

const DEFAULT: SiteSettings = {
  currency: 'VND - Việt Nam Đồng',
  timezone: 'Asia/Ho_Chi_Minh (UTC+7)',
  language: 'Tiếng Việt',
  date_format: 'dd/mm/yyyy',
  vat_rate: 8,
  import_tax_rate: 0,
  store_name: 'PicklePro',
  store_phone: '0373 164 472',
  store_email: 'support@picklepro.vn',
  store_address: 'Phú Yên, Việt Nam',
  store_website: 'https://picklepro.vn',
  primary_color: '#84cc16',
  logo_url: '/logo.png',
  announcement_enabled: true,
  maintenance_mode: false,
  facebook_url: 'https://www.facebook.com/profile.php?id=61575468045037',
  instagram_url: 'https://instagram.com/picklepro',
  youtube_url: 'https://youtube.com/picklepro',
  zalo_link: 'https://zalo.me/0373164472',
  tiktok_url: '',
  seo_title: 'PicklePro - Cửa hàng Vợt Pickleball cao cấp số 1 Việt Nam',
  seo_description: 'Cửa hàng vợt Pickleball cao cấp số 1 Việt Nam. Đa dạng thương hiệu JOOLA, Selkirk, Paddletek, HEAD. Bảo hành chính hãng, giao hàng toàn quốc.',
  seo_keywords: 'pickleball, vợt pickleball, picklepro, JOOLA, Selkirk, HEAD',
  og_image_url: '/og-image.png',
}

type TabKey = 'general' | 'company' | 'design' | 'social' | 'seo'

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'general', label: 'Thông tin chung', icon: Globe },
  { key: 'company', label: 'Công ty', icon: Globe },
  { key: 'design', label: 'Giao diện', icon: Monitor },
  { key: 'social', label: 'Mạng xã hội', icon: Share2 },
  { key: 'seo', label: 'SEO', icon: Search },
]

// ============================================================
// Sub-components
// ============================================================
const Row = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm text-gray-900">{value}</span>
  </div>
)

const Field = ({ label, value, onChange, placeholder, type = 'text', hint }: {
  label: string; value: string | number; onChange: (v: any) => void
  placeholder?: string; type?: string; hint?: string
}) => (
  <div>
    <label className="text-xs font-medium text-gray-500 mb-1.5 block">{label}</label>
    <input
      type={type} value={value}
      onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-200 text-sm transition-all"
    />
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
)

const Toggle = ({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-center justify-between py-3 cursor-pointer group">
    <div>
      <p className="text-sm font-medium text-gray-800 group-hover:text-lime-700 transition-colors">{label}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-lime-500' : 'bg-gray-200'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
    </div>
  </label>
)

// ============================================================
// Main Page
// ============================================================
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({ ...DEFAULT })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('general')
  const [isEditing, setIsEditing] = useState(false)

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

  const update = (key: keyof SiteSettings, value: any) => {
    setSettings(s => ({ ...s, [key]: value }))
    setIsEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (res.ok) {
        toast.success('Đã lưu cài đặt thành công!')
        setIsEditing(false)
      } else {
        toast.error('Không thể lưu cài đặt')
      }
    } catch {
      toast.error('Có lỗi xảy ra, thử lại sau!')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-100 rounded-lg" />
        <div className="h-10 w-full bg-gray-100 rounded-xl" />
        <div className="h-64 w-full bg-gray-100 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Thiết lập Website</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý thông tin công ty, giao diện, SEO và mạng xã hội.</p>
        </div>
        {isEditing && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-500 text-white font-semibold text-sm hover:bg-lime-600 transition-all disabled:opacity-60 shadow-md shadow-lime-200"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-0 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* === THÔNG TIN CHUNG === */}
        {activeTab === 'general' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Thông tin chung</h2>
              <p className="text-xs text-gray-400 mt-0.5">Các thiết lập cơ bản cho hệ thống quản lý.</p>
            </div>
            <div className="px-6 py-2">
              <Row label="Đơn vị tiền tệ" value={settings.currency} />
              <Row label="Múi giờ" value={settings.timezone} />
              <Row label="Ngôn ngữ" value={settings.language} />
              <Row label="Định dạng ngày" value={`${settings.date_format} (${new Date().toLocaleDateString('vi-VN')})`} />
              <Row label="Thuế VAT mặc định (%)" value={settings.vat_rate} />
              <Row label="Thuế nhập khẩu (%)" value={settings.import_tax_rate} />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">💡 Các thiết lập hệ thống được cấu hình cố định. Liên hệ kỹ thuật nếu cần thay đổi.</p>
            </div>
          </div>
        )}

        {/* === CÔNG TY === */}
        {activeTab === 'company' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Thông tin công ty</h2>
              <p className="text-xs text-gray-400 mt-0.5">Cập nhật thông tin liên hệ và địa chỉ cửa hàng.</p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Tên cửa hàng" value={settings.store_name} onChange={v => update('store_name', v)} placeholder="PicklePro" />
              </div>
              <Field label="Số điện thoại" value={settings.store_phone} onChange={v => update('store_phone', v)} placeholder="0373 164 472" />
              <Field label="Email liên hệ" value={settings.store_email} onChange={v => update('store_email', v)} placeholder="support@picklepro.vn" />
              <div className="sm:col-span-2">
                <Field label="Địa chỉ" value={settings.store_address} onChange={v => update('store_address', v)} placeholder="Phú Yên, Việt Nam" />
              </div>
              <div className="sm:col-span-2">
                <Field label="Website" value={settings.store_website} onChange={v => update('store_website', v)} placeholder="https://picklepro.vn" />
              </div>
            </div>
          </div>
        )}

        {/* === GIAO DIỆN === */}
        {activeTab === 'design' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Giao diện</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tùy chỉnh màu sắc, logo và trạng thái hiển thị.</p>
            </div>
            <div className="p-6 space-y-4">
              <Field label="URL Logo" value={settings.logo_url} onChange={v => update('logo_url', v)} placeholder="/logo.png" hint="Đường dẫn tệp ảnh logo (khuyến nghị: 80x80px, định dạng PNG)" />
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Màu chủ đạo</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.primary_color} onChange={e => update('primary_color', e.target.value)}
                    className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <span className="text-sm text-gray-600 font-mono">{settings.primary_color}</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-1">
                <Toggle
                  label="Thanh thông báo"
                  description="Hiển thị thanh thông báo chạy ở đầu trang"
                  checked={settings.announcement_enabled}
                  onChange={v => update('announcement_enabled', v)}
                />
                <Toggle
                  label="Chế độ bảo trì"
                  description="Khi bật, khách hàng sẽ thấy trang thông báo bảo trì"
                  checked={settings.maintenance_mode}
                  onChange={v => update('maintenance_mode', v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* === MẠNG XÃ HỘI === */}
        {activeTab === 'social' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Mạng xã hội</h2>
              <p className="text-xs text-gray-400 mt-0.5">Cập nhật các liên kết mạng xã hội của PicklePro.</p>
            </div>
            <div className="p-6 space-y-4">
              <Field label="🔵 Facebook" value={settings.facebook_url} onChange={v => update('facebook_url', v)} placeholder="https://facebook.com/picklepro" />
              <Field label="📸 Instagram" value={settings.instagram_url} onChange={v => update('instagram_url', v)} placeholder="https://instagram.com/picklepro" />
              <Field label="▶️ YouTube" value={settings.youtube_url} onChange={v => update('youtube_url', v)} placeholder="https://youtube.com/picklepro" />
              <Field label="💬 Zalo" value={settings.zalo_link} onChange={v => update('zalo_link', v)} placeholder="https://zalo.me/0373164472" />
              <Field label="🎵 TikTok" value={settings.tiktok_url} onChange={v => update('tiktok_url', v)} placeholder="https://tiktok.com/@picklepro" />
            </div>
          </div>
        )}

        {/* === SEO === */}
        {activeTab === 'seo' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">SEO & Open Graph</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tối ưu hóa tìm kiếm trên Google và mạng xã hội.</p>
            </div>
            <div className="p-6 space-y-4">
              <Field
                label="Tiêu đề trang (Title)"
                value={settings.seo_title}
                onChange={v => update('seo_title', v)}
                placeholder="PicklePro - Cửa hàng Vợt Pickleball"
                hint={`${settings.seo_title.length}/70 ký tự (khuyến nghị < 70)`}
              />
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Mô tả (Meta Description)</label>
                <textarea
                  value={settings.seo_description}
                  onChange={e => update('seo_description', e.target.value)}
                  rows={3}
                  placeholder="Mô tả ngắn gọn về cửa hàng..."
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-lime-500 text-sm resize-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">{settings.seo_description.length}/160 ký tự (khuyến nghị &lt; 160)</p>
              </div>
              <Field
                label="Từ khóa (Keywords)"
                value={settings.seo_keywords}
                onChange={v => update('seo_keywords', v)}
                placeholder="pickleball, vợt pickleball, ..."
                hint="Phân cách bằng dấu phẩy"
              />
              <Field
                label="Ảnh chia sẻ OG Image"
                value={settings.og_image_url}
                onChange={v => update('og_image_url', v)}
                placeholder="/og-image.png"
                hint="Khuyến nghị kích thước: 1200x630px"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition-all disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Đang lưu...' : 'Lưu tất cả'}
        </button>
      </div>
    </div>
  )
}
