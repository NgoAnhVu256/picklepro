'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Upload, ImageIcon, Search, Globe,
  ChevronDown, ChevronUp, Eye, EyeOff, Clock, Hash
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

// ─── Types ───────────────────────────────────────────────
interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  category_name: string
  thumbnail: string
  content: string
  author: string
  is_published: boolean
  // SEO
  seo_title: string
  seo_description: string
  meta_keywords: string
  canonical_url: string
  robots_index: 'index' | 'noindex'
  robots_follow: 'follow' | 'nofollow'
  // Open Graph
  og_title: string
  og_description: string
  og_image: string
}

interface BlogEditorFormProps {
  mode: 'new' | 'edit'
  blogId?: string
  initialData?: Partial<BlogFormData>
}

const CATEGORIES = [
  'Tin tức', 'Kỹ thuật', 'Review sản phẩm',
  'Hướng dẫn', 'Art & Design', 'Photograph - Nhiếp ảnh'
]

const EMPTY_FORM: BlogFormData = {
  title: '', slug: '', excerpt: '', category_name: 'Tin tức',
  thumbnail: '', content: '', author: 'Admin', is_published: true,
  seo_title: '', seo_description: '', meta_keywords: '',
  canonical_url: '', robots_index: 'index', robots_follow: 'follow',
  og_title: '', og_description: '', og_image: '',
}

// ─── Slug generator ───────────────────────────────────────
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ─── Counter badge ────────────────────────────────────────
function CharBadge({ val, max, warn = 0.85 }: { val: number; max: number; warn?: number }) {
  const ratio = val / max
  const color = ratio > 1 ? 'text-red-500' : ratio > warn ? 'text-amber-500' : 'text-muted-foreground'
  return <span className={`text-xs font-mono ${color}`}>{val}/{max}</span>
}

// ─── Section collapse wrapper ─────────────────────────────
function Section({
  icon, title, subtitle, children, defaultOpen = true
}: {
  icon: React.ReactNode; title: string; subtitle?: string;
  children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted/40 transition-colors text-left"
      >
        <span className="p-2 bg-muted rounded-lg text-foreground">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 space-y-5 border-t border-border">{children}</div>}
    </div>
  )
}

// ─── Input helpers ────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
      {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

const inputCls = "w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm placeholder:text-muted-foreground/50"
const textareaCls = `${inputCls} resize-none`

// ─── Google SERP Preview ──────────────────────────────────
function SerpPreview({ title, description, url }: { title: string; description: string; url: string }) {
  const displayTitle = title || 'Tiêu đề bài viết'
  const displayDesc = description || 'Mô tả meta sẽ hiển thị ở đây...'
  const displayUrl = url || 'picklepro.vn/blogs/slug-bai-viet'
  return (
    <div className="rounded-xl border border-border bg-background p-4 space-y-1">
      <p className="text-xs text-muted-foreground font-medium mb-2">👀 GOOGLE SEARCH PREVIEW</p>
      <p className="text-[#1a0dab] dark:text-[#8ab4f8] text-lg font-medium leading-tight truncate">
        {displayTitle.length > 60 ? displayTitle.slice(0, 60) + '…' : displayTitle}
      </p>
      <p className="text-[#006621] dark:text-[#34a853] text-xs">{displayUrl}</p>
      <p className="text-[#545454] dark:text-[#bdc1c6] text-sm leading-relaxed line-clamp-2">{displayDesc}</p>
    </div>
  )
}

// ─── OG Preview ───────────────────────────────────────────
function OgPreview({ title, description, image }: { title: string; description: string; image: string }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-background">
      <p className="text-xs text-muted-foreground font-medium px-3 pt-3 mb-2">📱 SOCIAL SHARE PREVIEW</p>
      {image ? (
        <div className="relative w-full h-40 bg-muted">
          <Image src={image} alt="OG Preview" fill className="object-cover" />
        </div>
      ) : (
        <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground">
          <ImageIcon className="h-8 w-8 opacity-30" />
        </div>
      )}
      <div className="p-4 border-t border-border space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">PICKLEPRO.VN</p>
        <p className="text-sm font-semibold text-foreground line-clamp-1">{title || 'OG Title'}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{description || 'OG Description'}</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────
export function BlogEditorForm({ mode, blogId, initialData }: BlogEditorFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingOg, setUploadingOg] = useState(false)
  const [autoSlug, setAutoSlug] = useState(mode === 'new')

  const [form, setForm] = useState<BlogFormData>({ ...EMPTY_FORM, ...initialData })

  const set = useCallback(<K extends keyof BlogFormData>(key: K, val: BlogFormData[K]) => {
    setForm(f => {
      const next = { ...f, [key]: val }
      // Auto-generate slug from title
      if (key === 'title' && autoSlug) {
        next.slug = generateSlug(val as string)
      }
      // Auto-fill SEO title if empty
      if (key === 'title' && !f.seo_title) {
        next.seo_title = val as string
      }
      // Auto-fill OG title if empty
      if (key === 'title' && !f.og_title) {
        next.og_title = val as string
      }
      // Auto-fill seo_description from excerpt if changed
      if (key === 'excerpt' && !f.seo_description) {
        next.seo_description = (val as string).slice(0, 160)
      }
      return next
    })
  }, [autoSlug])

  // ── Upload thumbnail
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail' | 'og_image') => {
    const file = e.target.files?.[0]
    if (!file) return
    if (field === 'thumbnail') setUploading(true)
    else setUploadingOg(true)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'blogs')
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        set(field, data.url)
        toast.success('Tải ảnh thành công!')
      } else {
        toast.error(data.error || 'Upload thất bại')
      }
    } catch {
      toast.error('Lỗi kết nối khi upload')
    }
    if (field === 'thumbnail') setUploading(false)
    else setUploadingOg(false)
    e.target.value = ''
  }

  // ── Save
  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Vui lòng nhập Tiêu đề bài viết'); return }
    if (!form.content.trim()) { toast.error('Vui lòng nhập Nội dung bài viết'); return }
    if (form.seo_title && form.seo_title.length > 60) {
      toast.warning('SEO Title nên ≤ 60 ký tự để hiển thị đầy đủ trên Google')
    }
    if (form.seo_description && form.seo_description.length > 160) {
      toast.warning('SEO Description nên ≤ 160 ký tự')
    }

    setSaving(true)
    try {
      const url = mode === 'new' ? '/api/admin/blogs' : `/api/admin/blogs/${blogId}`
      const method = mode === 'new' ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Lỗi lưu bài')
      }
      toast.success(mode === 'new' ? 'Thêm bài viết thành công!' : 'Cập nhật bài viết thành công!')
      router.push('/admin/blogs')
    } catch (e: any) {
      toast.error(e.message)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/blogs" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === 'new' ? 'Viết bài mới' : 'Sửa bài viết'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Điền đầy đủ SEO để bài viết xuất hiện cao trên Google
          </p>
        </div>
      </div>

      {/* ═══════════ SECTION 1: Basic Info ═══════════ */}
      <Section icon={<Hash className="h-4 w-4" />} title="Thông tin bài viết" subtitle="Tiêu đề, slug, danh mục, ảnh đại diện">

        {/* Title */}
        <div>
          <Label required>Tiêu đề bài viết</Label>
          <input
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Nhập tiêu đề hấp dẫn..."
            className={inputCls}
          />
          <p className="text-xs text-muted-foreground mt-1">Tiêu đề sẽ tự động điền vào SEO Title và OG Title bên dưới nếu bạn chưa điền</p>
        </div>

        {/* Slug */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label>Đường dẫn tĩnh (Slug)</Label>
            <button
              type="button"
              onClick={() => {
                setAutoSlug(!autoSlug)
                if (!autoSlug) set('slug', generateSlug(form.title))
              }}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${autoSlug ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'}`}
            >
              {autoSlug ? '🔄 Tự động' : '✏️ Thủ công'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">picklepro.vn/blogs/</span>
            <input
              value={form.slug}
              onChange={e => { setAutoSlug(false); set('slug', e.target.value) }}
              placeholder="slug-bai-viet"
              className={inputCls}
            />
          </div>
        </div>

        {/* Row: Category + Author */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Danh mục</Label>
            <select
              value={form.category_name}
              onChange={e => set('category_name', e.target.value)}
              className={inputCls}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>Tác giả</Label>
            <input
              value={form.author}
              onChange={e => set('author', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <Label>Tóm tắt bài viết (Excerpt)</Label>
          <textarea
            value={form.excerpt}
            onChange={e => set('excerpt', e.target.value)}
            rows={2}
            placeholder="Tóm tắt ngắn gọn 1-2 câu, hiển thị trên trang listing..."
            className={textareaCls}
            maxLength={300}
          />
          <div className="flex justify-end mt-1">
            <CharBadge val={form.excerpt.length} max={300} warn={0.8} />
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div>
          <Label>Ảnh đại diện bài viết</Label>
          <div className="flex items-start gap-5">
            {form.thumbnail ? (
              <div className="relative w-32 h-32 rounded-xl border border-border overflow-hidden shrink-0">
                <Image src={form.thumbnail} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => set('thumbnail', '')}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs font-medium"
                >
                  Xoá
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground shrink-0">
                <ImageIcon className="h-7 w-7 mb-1 opacity-40" />
                <span className="text-xs">Chưa có ảnh</span>
              </div>
            )}
            <div className="space-y-2">
              <label className="flex items-center gap-2 px-4 py-2.5 border border-primary text-primary hover:bg-primary/5 rounded-xl cursor-pointer transition-colors w-fit text-sm font-medium">
                <Upload className="h-4 w-4" />
                {uploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
                <input type="file" accept="image/*" onChange={e => handleUpload(e, 'thumbnail')} className="hidden" disabled={uploading} />
              </label>
              <p className="text-xs text-muted-foreground">Khuyến nghị: 1200×630px, dưới 2MB</p>
            </div>
          </div>
        </div>

        {/* Publish toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border">
          <div>
            <p className="text-sm font-medium">Trạng thái xuất bản</p>
            <p className="text-xs text-muted-foreground">{form.is_published ? 'Hiển thị công khai' : 'Lưu nháp, chưa hiển thị'}</p>
          </div>
          <button
            type="button"
            onClick={() => set('is_published', !form.is_published)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${form.is_published
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
              : 'bg-muted text-muted-foreground border border-border'}`}
          >
            {form.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {form.is_published ? 'Đã xuất bản' : 'Bản nháp'}
          </button>
        </div>
      </Section>

      {/* ═══════════ SECTION 2: Content ═══════════ */}
      <Section icon={<Clock className="h-4 w-4" />} title="Nội dung bài viết" subtitle="Soạn thảo nội dung với trình editor">
        <RichTextEditor
          value={form.content}
          onChange={val => set('content', val)}
        />
      </Section>

      {/* ═══════════ SECTION 3: SEO ═══════════ */}
      <Section
        icon={<Search className="h-4 w-4" />}
        title="SEO Optimization"
        subtitle="Meta title, description, keywords, canonical URL, robots"
        defaultOpen={true}
      >
        {/* SERP Preview */}
        <SerpPreview
          title={form.seo_title || form.title}
          description={form.seo_description || form.excerpt}
          url={`picklepro.vn/blogs/${form.slug || 'slug-bai-viet'}`}
        />

        {/* SEO Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label required>SEO Meta Title</Label>
            <CharBadge val={form.seo_title.length} max={60} />
          </div>
          <input
            value={form.seo_title}
            onChange={e => set('seo_title', e.target.value)}
            placeholder={form.title || 'Tiêu đề SEO — tối đa 60 ký tự'}
            className={inputCls}
            maxLength={70}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {form.seo_title.length === 0 && 'Trống → tự động dùng tiêu đề bài viết. Nên viết 50–60 ký tự.'}
            {form.seo_title.length > 0 && form.seo_title.length <= 60 && '✅ Độ dài tốt'}
            {form.seo_title.length > 60 && '⚠️ Có thể bị cắt trên Google'}
          </p>
        </div>

        {/* SEO Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label required>SEO Meta Description</Label>
            <CharBadge val={form.seo_description.length} max={160} />
          </div>
          <textarea
            value={form.seo_description}
            onChange={e => set('seo_description', e.target.value)}
            rows={3}
            placeholder="Mô tả ngắn xuất hiện dưới tiêu đề trên Google — 120 đến 160 ký tự là lý tưởng"
            className={textareaCls}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {form.seo_description.length === 0 && 'Trống → Google tự chọn đoạn từ nội dung bài (không kiểm soát được)'}
            {form.seo_description.length > 0 && form.seo_description.length < 120 && '⚠️ Nên viết thêm, tối thiểu 120 ký tự'}
            {form.seo_description.length >= 120 && form.seo_description.length <= 160 && '✅ Độ dài lý tưởng'}
            {form.seo_description.length > 160 && '⚠️ Có thể bị cắt bớt'}
          </p>
        </div>

        {/* Meta Keywords */}
        <div>
          <Label>Meta Keywords</Label>
          <input
            value={form.meta_keywords}
            onChange={e => set('meta_keywords', e.target.value)}
            placeholder="pickleball, vợt pickleball, mua vợt pickleball Hà Nội (phân cách bởi dấu phẩy)"
            className={inputCls}
          />
          <p className="text-xs text-muted-foreground mt-1">Google không dùng meta keywords để xếp hạng, nhưng hữu ích cho tìm kiếm nội bộ</p>
        </div>

        {/* Canonical URL */}
        <div>
          <Label>Canonical URL</Label>
          <input
            value={form.canonical_url}
            onChange={e => set('canonical_url', e.target.value)}
            placeholder={`https://picklepro.vn/blogs/${form.slug || 'slug-bai-viet'}`}
            className={inputCls}
          />
          <p className="text-xs text-muted-foreground mt-1">Để trống → tự động dùng URL hiện tại. Chỉ điền khi bài viết được đăng nhiều nơi</p>
        </div>

        {/* Indexing + Following */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Indexing (Robot Index)</Label>
            <div className="flex gap-3 mt-2">
              {(['index', 'noindex'] as const).map(v => (
                <label key={v} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all flex-1 ${form.robots_index === v ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:bg-muted/60'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.robots_index === v ? 'border-primary' : 'border-muted-foreground/40'}`}>
                    {form.robots_index === v && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <input type="radio" name="robots_index" value={v} checked={form.robots_index === v} onChange={() => set('robots_index', v)} className="hidden" />
                  <span className="text-sm font-medium uppercase">{v}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {form.robots_index === 'noindex' ? '⛔ Bài viết sẽ KHÔNG xuất hiện trên Google' : '✅ Google sẽ index bài viết này'}
            </p>
          </div>

          <div>
            <Label>Following (Robot Follow)</Label>
            <div className="flex gap-3 mt-2">
              {(['follow', 'nofollow'] as const).map(v => (
                <label key={v} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all flex-1 ${form.robots_follow === v ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:bg-muted/60'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.robots_follow === v ? 'border-primary' : 'border-muted-foreground/40'}`}>
                    {form.robots_follow === v && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <input type="radio" name="robots_follow" value={v} checked={form.robots_follow === v} onChange={() => set('robots_follow', v)} className="hidden" />
                  <span className="text-sm font-medium uppercase">{v}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {form.robots_follow === 'nofollow' ? '⛔ Google không theo link trong bài' : '✅ Google theo dõi các link trong bài'}
            </p>
          </div>
        </div>
      </Section>

      {/* ═══════════ SECTION 4: Open Graph ═══════════ */}
      <Section
        icon={<Globe className="h-4 w-4" />}
        title="Open Graph Protocols"
        subtitle="Hiển thị khi chia sẻ lên Facebook, Zalo, Twitter..."
        defaultOpen={true}
      >
        {/* OG Preview */}
        <OgPreview
          title={form.og_title || form.seo_title || form.title}
          description={form.og_description || form.seo_description || form.excerpt}
          image={form.og_image || form.thumbnail}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* OG Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>OG Title</Label>
              <CharBadge val={form.og_title.length} max={65} />
            </div>
            <input
              value={form.og_title}
              onChange={e => set('og_title', e.target.value)}
              placeholder={form.title || 'Tiêu đề khi chia sẻ lên mạng xã hội'}
              className={inputCls}
              maxLength={80}
            />
            <p className="text-xs text-muted-foreground mt-1">Trống → dùng tiêu đề bài viết</p>
          </div>

          {/* OG Image Upload */}
          <div>
            <Label>OG Share Image</Label>
            <div className="flex items-start gap-3">
              {form.og_image || form.thumbnail ? (
                <div className="relative w-20 h-14 rounded-lg border border-border overflow-hidden shrink-0">
                  <Image src={form.og_image || form.thumbnail} alt="" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-20 h-14 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground shrink-0">
                  <ImageIcon className="h-5 w-5 opacity-40" />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 px-3 py-2 border border-border text-muted-foreground hover:bg-muted text-xs rounded-xl cursor-pointer transition-colors w-fit">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingOg ? 'Đang tải...' : 'Chọn ảnh OG'}
                  <input type="file" accept="image/*" onChange={e => handleUpload(e, 'og_image')} className="hidden" disabled={uploadingOg} />
                </label>
                {form.og_image !== form.thumbnail && form.thumbnail && (
                  <button type="button" onClick={() => set('og_image', '')} className="text-xs text-primary underline">Dùng ảnh đại diện</button>
                )}
                <p className="text-xs text-muted-foreground">1200×630px, &lt;1MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* OG Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label>OG Description</Label>
            <CharBadge val={form.og_description.length} max={200} />
          </div>
          <textarea
            value={form.og_description}
            onChange={e => set('og_description', e.target.value)}
            rows={2}
            placeholder={form.seo_description || 'Mô tả khi chia sẻ lên mạng xã hội...'}
            className={textareaCls}
            maxLength={220}
          />
          <p className="text-xs text-muted-foreground mt-1">Trống → dùng SEO Description</p>
        </div>
      </Section>

      {/* ═══════════ Save button ═══════════ */}
      <div className="flex items-center justify-between py-4 sticky bottom-0 bg-background/80 backdrop-blur border-t border-border rounded-t-xl px-4 -mx-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {form.seo_title && form.seo_description && form.og_image ? (
            <span className="text-emerald-600 font-medium">✅ SEO đầy đủ</span>
          ) : (
            <span className="text-amber-600">⚠️ SEO chưa hoàn thiện — {[
              !form.seo_title && 'thiếu SEO Title',
              !form.seo_description && 'thiếu Meta Description',
              !form.og_image && 'thiếu OG Image',
            ].filter(Boolean).join(', ')}</span>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/blogs"
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Huỷ
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-colors disabled:opacity-60 text-sm"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
                {mode === 'new' ? 'Đang lưu...' : 'Đang cập nhật...'}
              </span>
            ) : (
              mode === 'new' ? 'Đăng bài viết' : 'Cập nhật bài viết'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
