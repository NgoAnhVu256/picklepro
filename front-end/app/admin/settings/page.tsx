'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Save, Home, Search, Share2, Link as LinkIcon, FileText, Tag, Image as ImageIcon,
  BarChart, MapPin, Map, Globe, AtSign, Layers, CheckCircle2, ShieldCheck, Mail
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

// ============================================================
// Types & Defaults
// ============================================================
interface SiteSettings {
  // General
  logo_url: string
  favicon_url: string
  currency: string
  timezone: string
  language: string
  date_format: string
  vat_rate: number
  import_tax_rate: number
  store_name: string
  store_phone: string
  store_email: string
  store_address: string
  store_website: string
  primary_color: string
  announcement_enabled: boolean
  maintenance_mode: boolean
  
  // SEO Meta
  seo_title: string
  seo_description: string
  seo_keywords: string
  canonical_url: string
  
  // OPEN GRAPH
  og_title: string
  og_description: string
  og_image_url: string
  og_type: string
  
  // Google & Analytics
  google_analytics_id: string
  search_console_meta: string
  gtm_id: string
  robots_txt_content: string
  
  // Social
  facebook_url: string
  instagram_url: string
  youtube_url: string
  tiktok_url: string
  twitter_url: string
  zalo_id: string
  
  // Footer Fast Links
  footer_about_url: string
  footer_terms_url: string
  footer_policy_url: string
  footer_contact_url: string
  
  // Map Embed
  google_maps_embed: string
  google_maps_link: string
}

const DEFAULT: SiteSettings = {
  logo_url: '/logo.png',
  favicon_url: '/favicon.ico',
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
  announcement_enabled: true,
  maintenance_mode: false,
  
  seo_title: 'PicklePro - Chuyên Pickleball Chính Hãng',
  seo_description: 'Cửa hàng pickleball hàng đầu Việt Nam...',
  seo_keywords: 'pickleball, vợt pickleball, PicklePro',
  canonical_url: 'https://picklepro.vn',
  
  og_title: 'PicklePro - Chuyên Pickleball Chính Hãng',
  og_description: 'Mua sắm pickleball chính hãng...',
  og_image_url: 'https://picklepro.vn/og-image.jpg',
  og_type: 'website',
  
  google_analytics_id: '',
  search_console_meta: '',
  gtm_id: '',
  robots_txt_content: '',
  
  facebook_url: 'https://facebook.com/picklepro',
  instagram_url: 'https://instagram.com/picklepro',
  youtube_url: 'https://youtube.com/@picklepro',
  tiktok_url: 'https://tiktok.com/@picklepro',
  twitter_url: 'https://x.com/picklepro',
  zalo_id: '1234567890',
  
  footer_about_url: '/gioi-thieu',
  footer_terms_url: '/dieu-khoan',
  footer_policy_url: '/chinh-sach',
  footer_contact_url: '/lien-he',
  
  google_maps_embed: '',
  google_maps_link: '',
}

type TabKey = 'general' | 'seo' | 'social'

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'general', label: 'Thông tin chung', icon: Home },
  { key: 'seo', label: 'SEO', icon: Search },
  { key: 'social', label: 'Mạng xã hội', icon: Share2 },
]

// ============================================================
// UI Components
// ============================================================
const SectionHeader = ({ title }: { title: string }) => (
  <div className="py-4 px-6 bg-transparent border-b border-gray-100">
    <h3 className="text-[12px] font-bold text-[#869fba] tracking-wider uppercase">{title}</h3>
  </div>
)

const InputGroup = ({ label, icon: Icon, value, onChange, placeholder, prefix, onClear }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[11px] font-bold text-[#869fba] tracking-wider uppercase">{label}</label>
    <div className="relative flex items-center group">
      {Icon && (
        <div className="absolute left-3 text-gray-400 group-focus-within:text-[#2dd4bf] transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      )}
      {prefix && (
        <div className="absolute left-3 text-gray-400 text-sm">{prefix}</div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-[#f8fafc] border border-gray-200 text-gray-700 text-[13px] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] focus:border-[#2dd4bf] transition-all
          ${Icon ? 'pl-9' : prefix ? 'pl-8' : 'pl-4'} ${onClear ? 'pr-9' : 'pr-4'} py-2.5 h-11`}
      />
      {onClear && value && (
        <button
          onClick={onClear}
          className="absolute right-3 text-gray-400 hover:text-red-500 transition-colors"
          title="Xoá nội dung"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  </div>
)

const TextareaGroup = ({ label, icon: Icon, value, onChange, placeholder, rows = 3 }: any) => (
  <div className="flex flex-col gap-2 h-full">
    <label className="text-[11px] font-bold text-[#869fba] tracking-wider uppercase">{label}</label>
    <div className="relative flex group h-full">
      {Icon && (
        <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-[#2dd4bf] transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full h-full bg-[#f8fafc] border border-gray-200 text-gray-700 text-[13px] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] focus:border-[#2dd4bf] transition-all resize-none
          ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-3`}
      />
    </div>
  </div>
)

const UploadBox = ({ label, value, onChange, hint }: { label: string, value: string, onChange: (v: string) => void, hint: string }) => {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        onChange(data.url)
        toast.success(`Tải lên ${label} thành công!`)
      } else {
        toast.error(data.error || 'Tải lên thất bại')
      }
    } catch {
      toast.error('Lỗi kết nối, thử lại!')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[11px] font-bold text-[#869fba] tracking-wider uppercase">{label}</label>
      
      {/* Upload Area */}
      <div 
        className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer relative group transition-all hover:border-[#2dd4bf]"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-[#2dd4bf]">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            <span className="text-sm font-medium">Đang tải lên...</span>
          </div>
        ) : (
          <>
            {value ? (
              <div className="relative w-24 h-24 mb-2">
                <img src={value} alt={label} className="w-full h-full object-contain p-2 bg-white rounded-lg shadow-sm border border-gray-100" />
                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded">Thay đổi</span>
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 bg-white border border-gray-100 rounded-lg shadow-sm flex items-center justify-center mb-3 text-gray-300 group-hover:text-[#2dd4bf] transition-colors">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
            <p className="text-[13px] text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Click hoặc kéo thả để thay đổi</p>
          </>
        )}
      </div>

      {/* URL Input */}
      <InputGroup 
        icon={LinkIcon} 
        value={value} 
        onChange={onChange} 
        onClear={() => onChange('')}
      />
      <p className="text-[11px] text-[#869fba]">{hint}</p>
    </div>
  )
}

// ============================================================
// Main Page Form
// ============================================================
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({ ...DEFAULT })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('general')

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
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-12 w-96 bg-gray-200 rounded-xl"></div>
        <div className="h-96 w-full bg-gray-200 rounded-2xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 pb-2">
        <div>
          <h1 className="text-[22px] font-bold text-gray-800">Cài đặt hệ thống</h1>
          <p className="text-[13px] text-[#869fba] mt-0.5 font-medium">Quản lý thông tin, SEO và kết nối mạng xã hội.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2dd4bf] text-white font-medium text-[14px] hover:bg-teal-500 transition-all disabled:opacity-60 shadow-sm shadow-[#2dd4bf]/20"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      {/* Modern Tab Navigation */}
      <div className="inline-flex items-center p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
        {TABS.map(tab => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200
                ${isActive 
                  ? 'bg-[#2dd4bf] text-white shadow-sm' 
                  : 'text-[#869fba] hover:text-gray-700 hover:bg-gray-50/80'
                }`}
            >
              <tab.icon className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* ============================================================
            TAB: THÔNG TIN CHUNG
            ============================================================ */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            
            {/* LOGO & FAVICON */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <SectionHeader title="Thương hiệu — Logo & Favicon" />
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <UploadBox 
                  label="Logo Website" 
                  value={settings.logo_url} 
                  onChange={v => update('logo_url', v)} 
                  hint="PNG, JPG, SVG hoặc WebP, tối đa 2MB"
                />
                <UploadBox 
                  label="Favicon" 
                  value={settings.favicon_url} 
                  onChange={v => update('favicon_url', v)} 
                  hint="PNG, ICO hoặc SVG, tối đa 2MB (khuyến nghị 32x32px)"
                />
              </div>
            </div>

            {/* THÔNG TIN CỬA HÀNG */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <SectionHeader title="Thông tin cơ bản" />
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputGroup icon={Home} label="Tên cửa hàng" value={settings.store_name} onChange={(v: string) => update('store_name', v)} />
                <InputGroup icon={LinkIcon} label="Website chính" value={settings.store_website} onChange={(v: string) => update('store_website', v)} />
                <InputGroup icon={Mail} label="Email liên hệ" value={settings.store_email} onChange={(v: string) => update('store_email', v)} />
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <InputGroup icon={MapPin} label="Địa chỉ" value={settings.store_address} onChange={(v: string) => update('store_address', v)} />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================
            TAB: SEO
            ============================================================ */}
        {activeTab === 'seo' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* THẺ META CƠ BẢN */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <SectionHeader title="Thẻ Meta cơ bản" />
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="space-y-6">
                    <InputGroup icon={Tag} label="Title Mặc Định" value={settings.seo_title} onChange={(v: string) => update('seo_title', v)} placeholder="PicklePro - Chuyên Pickleball Chính Hãng" />
                 </div>
                 <div className="row-span-2">
                    <TextareaGroup icon={FileText} label="Meta Description" value={settings.seo_description} onChange={(v: string) => update('seo_description', v)} placeholder="Mô tả website..." rows={5} />
                 </div>
                 <div className="space-y-6">
                    <InputGroup icon={Tag} label="Từ khóa (cách nhau bởi dấu phẩy)" value={settings.seo_keywords} onChange={(v: string) => update('seo_keywords', v)} placeholder="pickleball, vợt pickleball, ..." />
                    <InputGroup icon={LinkIcon} label="Canonical URL" value={settings.canonical_url} onChange={(v: string) => update('canonical_url', v)} placeholder="https://picklepro.vn" />
                 </div>
                 {/* Make Title span normally if needed, currently we structured it to align with the image:
                     Title on left, Description taking full height in middle, Keywords & Canonical on right */}
              </div>
            </div>

             {/* OPEN GRAPH */}
             <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <SectionHeader title="Open Graph (Facebook / Zalo)" />
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InputGroup icon={Tag} label="OG Title" value={settings.og_title} onChange={(v: string) => update('og_title', v)} placeholder="PicklePro - Chuyên Pickleball Chính Hãng" />
                <TextareaGroup icon={FileText} label="OG Description" value={settings.og_description} onChange={(v: string) => update('og_description', v)} placeholder="Mua sắm pickleball chính hãng..." rows={1} />
                <InputGroup icon={ImageIcon} label="OG Image URL" value={settings.og_image_url} onChange={(v: string) => update('og_image_url', v)} placeholder="https://picklepro.vn/og-image.jpg" />
                <InputGroup icon={Tag} label="OG Type" value={settings.og_type} onChange={(v: string) => update('og_type', v)} placeholder="website" />
              </div>
            </div>

            {/* GOOGLE & ANALYTICS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <SectionHeader title="Google & Analytics" />
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InputGroup icon={BarChart} label="Google Analytics ID (GA4)" value={settings.google_analytics_id} onChange={(v: string) => update('google_analytics_id', v)} placeholder="G-XXXXXXXXXX" />
                <InputGroup icon={ShieldCheck} label="Search Console Meta" value={settings.search_console_meta} onChange={(v: string) => update('search_console_meta', v)} placeholder="<meta name='google-site-verification'... />" />
                <InputGroup icon={Tag} label="Google Tag Manager ID" value={settings.gtm_id} onChange={(v: string) => update('gtm_id', v)} placeholder="GTM-XXXXXXX" />
                <InputGroup icon={FileText} label="Robots.txt Nội dung" value={settings.robots_txt_content} onChange={(v: string) => update('robots_txt_content', v)} placeholder="User-agent: * Allow: /" />
              </div>
            </div>

          </div>
        )}

        {/* ============================================================
            TAB: MẠNG XÃ HỘI
            ============================================================ */}
        {activeTab === 'social' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* MẠNG XÃ HỘI */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <SectionHeader title="Mạng Xã Hội" />
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InputGroup icon={Globe} label="Facebook Page URL" value={settings.facebook_url} onChange={(v: string) => update('facebook_url', v)} placeholder="https://facebook.com/picklepro" />
                <InputGroup prefix="@" label="Instagram URL" value={settings.instagram_url} onChange={(v: string) => update('instagram_url', v)} placeholder="https://instagram.com/picklepro" />
                <InputGroup icon={Globe} label="YouTube Channel" value={settings.youtube_url} onChange={(v: string) => update('youtube_url', v)} placeholder="https://youtube.com/@picklepro" />
                <InputGroup icon={LinkIcon} label="TikTok URL" value={settings.tiktok_url} onChange={(v: string) => update('tiktok_url', v)} placeholder="https://tiktok.com/@picklepro" />
                <InputGroup prefix="𝕏" label="Twitter / X URL" value={settings.twitter_url} onChange={(v: string) => update('twitter_url', v)} placeholder="https://x.com/picklepro" />
                <InputGroup icon={MessageSquareWarning} label="Zalo Official ID" value={settings.zalo_id} onChange={(v: string) => update('zalo_id', v)} placeholder="1234567890" />
              </div>
            </div>

            {/* LIÊN KẾT NHANH FOOTER */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <SectionHeader title="Liên kết nhanh Footer" />
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InputGroup icon={LinkIcon} label="Giới thiệu URL" value={settings.footer_about_url} onChange={(v: string) => update('footer_about_url', v)} placeholder="/gioi-thieu" />
                <InputGroup icon={LinkIcon} label="Điều khoản URL" value={settings.footer_terms_url} onChange={(v: string) => update('footer_terms_url', v)} placeholder="/dieu-khoan" />
                <InputGroup icon={LinkIcon} label="Chính sách URL" value={settings.footer_policy_url} onChange={(v: string) => update('footer_policy_url', v)} placeholder="/chinh-sach" />
                <InputGroup icon={LinkIcon} label="Liên hệ URL" value={settings.footer_contact_url} onChange={(v: string) => update('footer_contact_url', v)} placeholder="/lien-he" />
              </div>
            </div>

            {/* NHÚNG BẢN ĐỒ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <SectionHeader title="Nhúng Bản Đồ" />
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextareaGroup icon={Map} label="Google Maps Embed URL" value={settings.google_maps_embed} onChange={(v: string) => update('google_maps_embed', v)} placeholder="https://www.google.com/maps/embed?pb=..." rows={4} />
                <TextareaGroup icon={MapPin} label="Google Maps Link" value={settings.google_maps_link} onChange={(v: string) => update('google_maps_link', v)} placeholder="https://goo.gl/maps/..." rows={4} />
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

function MessageSquareWarning(props: any) {
  // Fallback icon for Zalo since lucide doesn't have it
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
