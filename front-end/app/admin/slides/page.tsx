'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, SlidersHorizontal, AlertTriangle, Eye, EyeOff, Upload, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'
import Image from 'next/image'

interface Slide {
  id: string
  badge: string // stored as Position
  title: string
  title_highlight: string
  description: string
  button_text: string
  button_gradient: string
  bg_gradient: string // stored as Image URL
  href: string
  sort_order: number
  is_active: boolean
}


const EMPTY_FORM = {
  position: 'hero',
  title: '',
  image_url: '',
  href: '',
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
  const [uploading, setUploading] = useState(false)
  const [filterPos, setFilterPos] = useState('all')

  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setForm({ ...EMPTY_FORM, position: filterPos !== 'all' ? filterPos : 'hero', sort_order: slides.length })
    setShowModal(true)
  }

  const openEdit = (s: Slide) => {
    setEditing(s)
    setForm({
      position: s.badge || 'hero',
      title: s.title || '',
      image_url: s.bg_gradient || '',
      href: s.href || '',
      sort_order: s.sort_order || 0,
      is_active: s.is_active,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.image_url.trim()) { toast.error('Vui lòng cung cấp hình ảnh banner'); return }
    setSaving(true)
    const url = editing ? `/api/admin/slides/${editing.id}` : '/api/admin/slides'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Đã cập nhật banner' : 'Đã thêm banner mới')
      setShowModal(false)
      fetchSlides()
    } else {
      toast.error('Có lỗi xảy ra, thử lại')
    }
  }

  const toggleActive = async (s: Slide) => {
    await fetch(`/api/admin/slides/${s.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...s, is_active: !s.is_active, position: s.badge, image_url: s.bg_gradient })
    })
    toast.success(s.is_active ? 'Đã ẩn banner' : 'Đã hiện banner')
    fetchSlides()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/admin/slides/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    toast.success('Đã xóa banner')
    fetchSlides()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'banners')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) setForm(f => ({ ...f, image_url: data.url }))
      else toast.error(data.error)
    } catch { toast.error('Lỗi upload ảnh') }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const filteredSlides = slides;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Banners</h1>
          <p className="text-muted-foreground text-sm mt-1">Cài đặt hình ảnh cho khu vực Hero Section</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-foreground transition-all shadow-lg shadow-lime/20">
          <Plus className="h-4 w-4" /> Thêm Banner
        </button>
      </div>

      {/* Filter removed since there is only one layout now */}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="h-48 bg-muted/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredSlides.length === 0 ? (
        <div className="p-16 text-center bg-card rounded-2xl border border-border">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Chưa có banner nào ở khu vực này</p>
          <p className="text-xs text-muted-foreground mt-1">Nhấn "Thêm Banner" để tải lên</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlides.map((slide) => (
            <div key={slide.id} className={`relative rounded-2xl overflow-hidden border transition-all bg-card shadow-sm ${slide.is_active ? 'border-border' : 'border-border opacity-60'}`}>
              <div className="aspect-[16/9] relative bg-gray-100 flex items-center justify-center overflow-hidden">
                {slide.bg_gradient && (slide.bg_gradient.startsWith('http') || slide.bg_gradient.startsWith('/')) ? (
                  <Image src={slide.bg_gradient} alt={slide.title || 'Banner'} fill className="object-cover" />
                ) : (
                   <span className="text-xs text-gray-400">Không có ảnh</span>
                )}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white rounded text-[10px] font-bold">
                  Banner Carousel
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-sm line-clamp-1">{slide.title || '(Không tiêu đề)'}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1 truncate">Link: {slide.href || 'Không có'}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">Thứ tự: {slide.sort_order}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(slide)} className={`p-1.5 rounded-lg bg-gray-100 transition-all ${slide.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-200'}`}>
                      {slide.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button onClick={() => openEdit(slide)} className="p-1.5 rounded-lg bg-blue-50 text-blue-500 transition-all hover:bg-blue-100">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(slide)} className="p-1.5 rounded-lg bg-red-50 text-red-500 transition-all hover:bg-red-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {!slide.is_active && (
                <div className="absolute inset-0 bg-white/40 flex items-center justify-center pointer-events-none">
                  <span className="px-3 py-1 bg-white border border-gray-200 text-gray-500 text-xs font-bold rounded-full shadow-sm shadow-black/5">Đã Ẩn</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
           <div className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl relative flex flex-col">
              <div className="sticky top-0 bg-card/95 backdrop-blur z-10 px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
                <h2 className="font-bold text-foreground text-lg">{editing ? 'Sửa Banner' : 'Thêm Banner mới'}</h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
              </div>
              
              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="hidden">
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">Vị trí hiển thị</label>
                  <input value={form.position} readOnly />
                </div>

                {/* Image Upload Area */}
                <div>
                   <label className="text-sm font-semibold text-gray-900 mb-2 block">Hình ảnh Banner (Kích thước lớn) *</label>
                   
                   <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden mb-3 relative bg-gray-50 transition-colors hover:bg-gray-100">
                      {form.image_url ? (
                         <div className="relative aspect-[21/9] w-full">
                            <Image src={form.image_url} alt="Preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center transition-all opacity-0 hover:opacity-100 cursor-pointer"
                                 onClick={() => fileInputRef.current?.click()}>
                               <span className="text-white bg-black/50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"><Upload className="w-4 h-4"/> Đổi ảnh khác</span>
                            </div>
                         </div>
                      ) : (
                         <div className="py-12 flex flex-col items-center justify-center text-gray-500 cursor-pointer"
                              onClick={() => fileInputRef.current?.click()}>
                            {uploading ? (
                               <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin mb-2" />
                            ) : (
                               <Upload className="w-8 h-8 text-gray-400 mb-3" />
                            )}
                            <p className="text-sm font-medium">{uploading ? 'Đang tải lên...' : 'Nhấn để upload banner'}</p>
                            <p className="text-[11px] text-gray-400 mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                         </div>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                   </div>
                   
                   <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                          placeholder="Hoặc dán URL banner..."
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-lime/50" />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">Link khi click banner (tùy chọn)</label>
                  <input value={form.href} onChange={e => setForm(f => ({ ...f, href: e.target.value }))}
                    placeholder="VD: /products?category=vot-pickleball"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-lime/50" />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">Tiêu đề Banner (tùy chọn)</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="VD: Siêu sale mùa hè"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-lime/50" />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">Thứ tự ưu tiên</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-lime/50" />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" id="activeCheck" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} 
                         className="w-5 h-5 accent-[#c2e55c] rounded cursor-pointer" />
                  <label htmlFor="activeCheck" className="text-sm font-medium text-gray-900 cursor-pointer">Hiển thị trên trang chủ</label>
                </div>

              </div>

              <div className="px-6 py-4 border-t border-border flex gap-3 justify-end shrink-0 bg-gray-50/50 rounded-b-2xl">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-500 hover:text-gray-900 transition-colors text-sm">Hủy</button>
                <button onClick={handleSave} disabled={saving || !form.image_url}
                  className="px-6 py-2.5 rounded-xl bg-[#d4f962] text-black font-bold hover:bg-[#c2e55c] transition-colors text-sm shadow disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm Slider'}
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
               <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="text-foreground font-bold">Xóa Banner</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Không thể hoàn tác thao tác này.</p>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground mb-6">Bạn có chắc muốn xóa thẻ banner này không?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-all text-sm font-medium">Hủy</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all text-sm disabled:opacity-50">
                {deleting ? 'Đang xóa...' : 'Xóa ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
