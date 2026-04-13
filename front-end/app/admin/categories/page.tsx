'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, FolderOpen, AlertTriangle, Upload, ImageIcon, X } from 'lucide-react'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', sort_order: '0', image_url: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', sort_order: String(categories.length + 1), image_url: '' })
    setShowModal(true)
  }

  const openEdit = (c: any) => {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug ?? '', description: c.description ?? '', sort_order: String(c.sort_order ?? 0), image_url: c.image_url ?? '' })
    setShowModal(true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'categories')
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setForm(f => ({ ...f, image_url: data.url }))
      else alert(data.error || 'Upload thất bại')
    } catch { alert('Lỗi upload') }
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload: any = { name: form.name, description: form.description, sort_order: Number(form.sort_order) }
    if (form.slug) payload.slug = form.slug
    if (form.image_url) payload.image_url = form.image_url
    const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    setShowModal(false)
    fetchCategories()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    fetchCategories()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Danh mục</h1>
          <p className="text-muted-foreground text-sm mt-1">{categories.length} danh mục sản phẩm</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-foreground transition-all shadow-lg shadow-lime/20">
          <Plus className="h-4 w-4" /> Thêm danh mục
        </button>
      </div>

      <div className="rounded-2xl bg-card text-card-foreground shadow-sm border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Mã danh mục', 'Hình ảnh', 'Tên danh mục', 'Slug', 'Thứ tự', 'Số SP', ''].map(h => (
                <th key={h} className="text-left text-muted-foreground font-medium px-5 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : categories.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted-foreground py-12">
                <FolderOpen className="h-10 w-10 mx-auto mb-2 text-gray-700" />
                <p>Chưa có danh mục nào</p>
              </td></tr>
            ) : categories.map(c => (
              <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 text-secondary-foreground font-mono text-xs w-48 break-all">
                  {c.id}
                </td>
                <td className="px-5 py-3">
                  <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <p className="text-foreground font-medium">{c.name}</p>
                  {c.description && <p className="text-muted-foreground text-xs">{c.description}</p>}
                </td>
                <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{c.slug}</td>
                <td className="px-5 py-3 text-secondary-foreground">{c.sort_order}</td>
                <td className="px-5 py-3 text-secondary-foreground">{c.products?.[0]?.count ?? 0}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card text-card-foreground shadow-sm rounded-2xl border border-border shadow-2xl">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-foreground font-bold text-lg">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Tên danh mục *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Đường dẫn tĩnh (Slug) - Tự động nếu để trống</label>
                <input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Mô tả</label>
                <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Thứ tự hiển thị</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({...f, sort_order: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
              </div>
              {/* Image Upload */}
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Hình ảnh danh mục</label>
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {form.image_url ? (
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-600 text-secondary-foreground text-xs cursor-pointer transition-all ${
                      uploading ? 'opacity-50' : 'hover:border-lime hover:text-lime'
                    }`}>
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? 'Uploading...' : 'Chọn ảnh'}
                      <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                    </label>
                    {form.image_url && (
                      <button type="button" onClick={() => setForm(f => ({...f, image_url: ''}))} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                        <X className="h-3 w-3" /> Xóa ảnh
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm">Hủy</button>
              <button onClick={handleSave} disabled={saving || !form.name}
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
          <div className="w-full max-w-sm bg-card text-card-foreground shadow-sm rounded-2xl border border-red-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-foreground font-bold">Xác nhận xóa danh mục</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Thao tác này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-secondary-foreground text-sm mb-6">Xóa danh mục <strong className="text-foreground">"{deleteTarget.name}"</strong>? Nếu có sản phẩm trong danh mục này, thao tác sẽ thất bại.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm">Hủy</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-foreground font-bold hover:bg-red-600 transition-all text-sm disabled:opacity-50">
                {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
