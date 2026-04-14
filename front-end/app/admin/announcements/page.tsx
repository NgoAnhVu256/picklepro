'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Megaphone, AlertTriangle, GripVertical, Eye, EyeOff, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'

interface Announcement {
  id: string
  text: string
  link: string | null
  sort_order: number
  is_active: boolean
}

const EMPTY_FORM = { text: '', link: '', sort_order: 0, is_active: true }

export default function AdminAnnouncementsPage() {
  const toast = useToast()
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/announcements')
      const data = await res.json()
      setItems(data.announcements ?? [])
    } catch { toast.error('Lỗi tải dữ liệu') }
    setLoading(false)
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, sort_order: items.length })
    setShowModal(true)
  }

  const openEdit = (a: Announcement) => {
    setEditing(a)
    setForm({ text: a.text, link: a.link ?? '', sort_order: a.sort_order, is_active: a.is_active })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.text.trim()) { toast.error('Vui lòng nhập nội dung thông báo'); return }
    setSaving(true)
    const payload = { ...form, link: form.link || null }
    const url = editing ? `/api/admin/announcements/${editing.id}` : '/api/admin/announcements'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Đã cập nhật thông báo' : 'Đã thêm thông báo mới')
      setShowModal(false)
      fetch_()
    } else {
      toast.error('Có lỗi xảy ra, thử lại')
    }
  }

  const toggleActive = async (a: Announcement) => {
    await fetch(`/api/admin/announcements/${a.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...a, is_active: !a.is_active })
    })
    toast.success(a.is_active ? 'Đã tắt thông báo' : 'Đã bật thông báo')
    fetch_()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/admin/announcements/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    toast.success('Đã xóa thông báo')
    fetch_()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thông báo chạy</h1>
          <p className="text-muted-foreground text-sm mt-1">Quản lý các dòng chữ chạy trên thanh thông báo đầu trang</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-foreground transition-all shadow-lg shadow-lime/20">
          <Plus className="h-4 w-4" /> Thêm thông báo
        </button>
      </div>

      {/* Preview Bar */}
      <div
        className="rounded-2xl p-3 text-white text-sm font-semibold text-center overflow-hidden"
        style={{ background: 'linear-gradient(90deg, #7C3AED, #EC4899, #F97316, #EAB308, #10B981, #3B82F6)' }}
      >
        👀 Xem trước: {items.filter(i => i.is_active).map(i => i.text).join('  ●  ') || 'Chưa có thông báo nào được bật'}
      </div>

      {/* List */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Megaphone className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Chưa có thông báo nào</p>
            <p className="text-xs text-muted-foreground mt-1">Nhấn "Thêm thông báo" để bắt đầu</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                
                <div className={`w-2 h-2 rounded-full shrink-0 ${item.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${item.is_active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {item.text}
                  </p>
                  {item.link && (
                    <p className="text-xs text-blue-400 flex items-center gap-1 mt-0.5">
                      <LinkIcon className="h-3 w-3" /> {item.link}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleActive(item)} className={`p-1.5 rounded-lg transition-all ${item.is_active ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-muted-foreground hover:bg-muted'}`}>
                    {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground text-lg">{editing ? 'Sửa thông báo' : 'Thêm thông báo'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Nội dung thông báo *</label>
                <input value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  placeholder="VD: FLASH SALE — Giảm đến 50% tất cả vợt JOOLA! 🏓"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Link (không bắt buộc)</label>
                <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Thứ tự hiển thị</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-lime w-4 h-4" />
                <span className="text-sm text-secondary-foreground">Hiển thị ngay</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm">Hủy</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-foreground transition-all text-sm disabled:opacity-50">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm mới'}
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
                <h3 className="text-foreground font-bold">Xóa thông báo</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Thao tác này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-secondary-foreground text-sm mb-6 line-clamp-2">"{deleteTarget.text}"</p>
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
