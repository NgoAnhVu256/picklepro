'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, SlidersHorizontal, AlertTriangle, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'

interface Slide {
  id: string
  badge: string
  title: string
  title_highlight: string
  description: string
  button_text: string
  button_gradient: string
  bg_gradient: string
  href: string
  sort_order: number
  is_active: boolean
}

const GRADIENTS = [
  'linear-gradient(135deg, #5054FE, #9B56FF)',
  'linear-gradient(135deg, #FF6B6B, #FF8E53)',
  'linear-gradient(135deg, #11998E, #38EF7D)',
  'linear-gradient(135deg, #667EEA, #764BA2)',
  'linear-gradient(135deg, #F97316, #EAB308)',
  'linear-gradient(135deg, #EC4899, #F43F5E)',
]

const BG_GRADIENTS = [
  'from-purple-100 via-blue-50 to-pink-100',
  'from-orange-100 via-red-50 to-yellow-100',
  'from-green-100 via-teal-50 to-lime-100',
  'from-violet-100 via-purple-50 to-pink-100',
  'from-yellow-100 via-orange-50 to-red-100',
  'from-rose-100 via-pink-50 to-purple-100',
]

const EMPTY_FORM = {
  badge: '🔥 Hot Deal',
  title: '',
  title_highlight: '',
  description: '',
  button_text: 'Xem ngay',
  button_gradient: GRADIENTS[0],
  bg_gradient: BG_GRADIENTS[0],
  href: '/products',
  sort_order: 0,
  is_active: true,
}

export default function AdminSlidesPage() {
  const toast = useToast()
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Slide | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Slide | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchSlides = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/slides')
      const data = await res.json()
      setSlides(data.slides ?? [])
    } catch { toast.error('Lỗi tải dữ liệu') }
    setLoading(false)
  }, [])

  useEffect(() => { fetchSlides() }, [fetchSlides])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, sort_order: slides.length })
    setShowModal(true)
  }

  const openEdit = (s: Slide) => {
    setEditing(s)
    setForm({
      badge: s.badge, title: s.title, title_highlight: s.title_highlight,
      description: s.description, button_text: s.button_text,
      button_gradient: s.button_gradient, bg_gradient: s.bg_gradient,
      href: s.href, sort_order: s.sort_order, is_active: s.is_active,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề slide'); return }
    setSaving(true)
    const url = editing ? `/api/admin/slides/${editing.id}` : '/api/admin/slides'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Đã cập nhật slide' : 'Đã thêm slide mới')
      setShowModal(false)
      fetchSlides()
    } else {
      toast.error('Có lỗi xảy ra, thử lại')
    }
  }

  const toggleActive = async (s: Slide) => {
    await fetch(`/api/admin/slides/${s.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...s, is_active: !s.is_active })
    })
    toast.success(s.is_active ? 'Đã ẩn slide' : 'Đã hiện slide')
    fetchSlides()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/admin/slides/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    toast.success('Đã xóa slide')
    fetchSlides()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hero Slides</h1>
          <p className="text-muted-foreground text-sm mt-1">Quản lý banner chính trên trang chủ</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-foreground transition-all shadow-lg shadow-lime/20">
          <Plus className="h-4 w-4" /> Thêm slide
        </button>
      </div>

      {/* Slide Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-muted/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="p-16 text-center bg-card rounded-2xl border border-border">
          <SlidersHorizontal className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Chưa có slide nào</p>
          <p className="text-xs text-muted-foreground mt-1">Nhấn "Thêm slide" để tạo banner đầu tiên</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slides.map((slide) => (
            <div key={slide.id} className={`relative rounded-2xl overflow-hidden border-2 transition-all ${slide.is_active ? 'border-lime/30' : 'border-border opacity-60'}`}>
              {/* Preview */}
              <div className={`bg-gradient-to-br ${slide.bg_gradient} p-5`}>
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-white/60 mb-2">{slide.badge}</span>
                <h3 className="text-lg font-extrabold text-gray-900">
                  {slide.title} <span className="bg-clip-text text-transparent" style={{ backgroundImage: slide.button_gradient }}>{slide.title_highlight}</span>
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{slide.description}</p>
                <div className="mt-3 inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow"
                  style={{ background: slide.button_gradient }}>
                  {slide.button_text} <ArrowRight className="h-3 w-3" />
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <button onClick={() => toggleActive(slide)} className={`p-1.5 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm transition-all ${slide.is_active ? 'text-emerald-500' : 'text-gray-400'}`}>
                  {slide.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => openEdit(slide)} className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm text-blue-500 transition-all hover:bg-white">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleteTarget(slide)} className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm text-red-500 transition-all hover:bg-white">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {!slide.is_active && (
                <div className="absolute inset-0 bg-card/50 flex items-center justify-center rounded-2xl">
                  <span className="px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground text-xs font-medium">Đang ẩn</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl">
            <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground text-lg">{editing ? 'Sửa slide' : 'Thêm slide mới'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Badge (emoji + text)</label>
                  <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                    placeholder="🔥 Hot Deal"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Nút bấm</label>
                  <input value={form.button_text} onChange={e => setForm(f => ({ ...f, button_text: e.target.value }))}
                    placeholder="Xem ngay"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Tiêu đề *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="VD: Professional"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Tiêu đề nổi bật (gradient màu)</label>
                <input value={form.title_highlight} onChange={e => setForm(f => ({ ...f, title_highlight: e.target.value }))}
                  placeholder="VD: Pickleball Gear"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Mô tả ngắn về slide này..."
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm resize-none" />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Link điều hướng</label>
                <input value={form.href} onChange={e => setForm(f => ({ ...f, href: e.target.value }))}
                  placeholder="/products"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
              </div>

              {/* Gradient Picker */}
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-2 block">Màu nút & text nổi bật</label>
                <div className="flex gap-2 flex-wrap">
                  {GRADIENTS.map(g => (
                    <button key={g} onClick={() => setForm(f => ({ ...f, button_gradient: g }))}
                      className={`w-8 h-8 rounded-xl transition-all ${form.button_gradient === g ? 'ring-2 ring-white ring-offset-2 ring-offset-card scale-110' : 'hover:scale-105'}`}
                      style={{ background: g }} />
                  ))}
                </div>
              </div>

              {/* BG Gradient Picker */}
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-2 block">Màu nền slide</label>
                <div className="flex gap-2 flex-wrap">
                  {BG_GRADIENTS.map(g => (
                    <button key={g} onClick={() => setForm(f => ({ ...f, bg_gradient: g }))}
                      className={`w-8 h-8 rounded-xl bg-gradient-to-br transition-all ${g} ${form.bg_gradient === g ? 'ring-2 ring-lime ring-offset-2 ring-offset-card scale-110' : 'hover:scale-105'}`} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Thứ tự</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-lime w-4 h-4" />
                    <span className="text-sm text-secondary-foreground">Hiển thị ngay</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm">Hủy</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-foreground transition-all text-sm disabled:opacity-50">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm slide'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-red-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-foreground font-bold">Xóa slide</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Thao tác không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground mb-6">Xóa slide "<strong>{deleteTarget.title} {deleteTarget.title_highlight}</strong>"?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-all text-sm">Hủy</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all text-sm disabled:opacity-50">
                {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
