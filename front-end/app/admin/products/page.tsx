'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, Star, Package, ToggleLeft, ToggleRight, AlertTriangle, Upload, ImageIcon, X, FileSpreadsheet, Download, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

const EMPTY_FORM = {
  name: '', brand: '', price: '', original_price: '', stock: '',
  description: '', category_id: '', is_featured: false, is_active: true,
  tags: '', specs: '', image_url: ''
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 20

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Import CSV
  const [showImport, setShowImport] = useState(false)
  const [importData, setImportData] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), search })
    const res = await fetch(`/api/admin/products?${params}`)
    const data = await res.json()
    setProducts(data.products ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []))
  }, [])

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setFormError(''); setShowModal(true) }
  const openEdit = (p: any) => {
    setEditing(p)
    setForm({
      name: p.name, brand: p.brand, price: String(p.price),
      original_price: String(p.original_price ?? ''),
      stock: String(p.stock), description: p.description ?? '',
      category_id: p.category_id ?? '', is_featured: p.is_featured,
      is_active: p.is_active, tags: (p.tags ?? []).join(', '),
      specs: p.specs ? JSON.stringify(p.specs, null, 2) : '',
      image_url: p.product_images?.[0]?.url || p.image_url || ''
    })
    setFormError('')
    setShowModal(true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'products')
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        setForm(f => ({ ...f, image_url: data.url }))
        toast.success('Tải ảnh thành công!')
      } else {
        toast.error(data.error || 'Upload thất bại')
      }
    } catch { 
      toast.error('Lỗi kết nối khi upload') 
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('Tên sản phẩm không được để trống')
      return
    }
    if (!form.price || isNaN(Number(form.price))) {
      setFormError('Giá sản phẩm không hợp lệ')
      return
    }
    setFormError('')
    setSaving(true)
    const payload: any = {
      name: form.name, brand: form.brand,
      price: Number(form.price), original_price: form.original_price ? Number(form.original_price) : null,
      stock: Number(form.stock), description: form.description || null,
      category_id: form.category_id || null, is_featured: form.is_featured,
      is_active: form.is_active,
      tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      specs: form.specs ? (() => { try { return JSON.parse(form.specs) } catch { return null } })() : null,
    }
    if (form.image_url) {
      payload.images = [{ url: form.image_url, is_primary: true }]
    }
    const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products'
    const method = editing ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Lỗi lưu sản phẩm')
      }
      toast.success(editing ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công')
      setShowModal(false)
      fetchProducts()
    } catch(e: any) {
      toast.error(e.message || 'Thao tác thất bại')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Không thể xoá sản phẩm này')
      toast.success('Xoá sản phẩm thành công')
      setDeleteTarget(null)
      fetchProducts()
    } catch(e: any) {
      setDeleteError(e.message)
    }
    setDeleting(false)
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sản phẩm</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} sản phẩm trong kho</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowImport(true); setImportData([]); setImportResult(null) }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-foreground font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            <FileSpreadsheet className="h-4 w-4" /> Import CSV
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-foreground transition-all shadow-lg shadow-lime/20">
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Tìm sản phẩm..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card text-card-foreground shadow-sm border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-lime text-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card text-card-foreground shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Sản phẩm', 'Brand', 'Giá', 'Kho', 'Trạng thái', 'Nổi bật', ''].map(h => (
                  <th key={h} className="text-left text-muted-foreground font-medium px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted-foreground py-12">
                  <Package className="h-10 w-10 mx-auto mb-2 text-gray-700" />
                  <p>Không tìm thấy sản phẩm</p>
                </td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-foreground font-medium line-clamp-1 max-w-[200px]">{p.name}</p>
                    <p className="text-muted-foreground text-xs">{p.categories?.name ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3 text-secondary-foreground">{p.brand}</td>
                  <td className="px-5 py-3 text-lime font-semibold">{formatVND(p.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-medium ${p.stock === 0 ? 'text-red-400' : p.stock < 5 ? 'text-yellow-400' : 'text-secondary-foreground'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      p.is_active ? 'text-lime bg-lime/10 border-lime/30' : 'text-muted-foreground bg-muted border-border'
                    }`}>
                      {p.is_active ? '● Hiển thị' : '○ Ẩn'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {p.is_featured ? <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> : <Star className="h-4 w-4 text-gray-700" />}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-muted-foreground text-sm">{total} sản phẩm · Trang {page}/{totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-all">← Trước</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-all">Sau →</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground shadow-sm rounded-2xl border border-border shadow-2xl">
            <div className="sticky top-0 bg-card text-card-foreground shadow-sm px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-foreground font-bold text-lg">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl animate-in fade-in">
                  ⚠️ {formError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Tên sản phẩm *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Thương hiệu *</label>
                  <input value={form.brand} onChange={e => setForm(f => ({...f, brand: e.target.value}))}
                    placeholder="JOOLA, Selkirk..."
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Danh mục</label>
                  <select value={form.category_id} onChange={e => setForm(f => ({...f, category_id: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Giá bán (VND) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Giá gốc (VND)</label>
                  <input type="number" value={form.original_price} onChange={e => setForm(f => ({...f, original_price: e.target.value}))}
                    placeholder="Để trống nếu không giảm giá"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Số lượng trong kho *</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Tags (cách nhau bằng dấu phẩy)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))}
                    placeholder="carbon, spin, power..."
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Mô tả sản phẩm</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Specs (JSON)</label>
                  <textarea value={form.specs} onChange={e => setForm(f => ({...f, specs: e.target.value}))}
                    rows={3} placeholder={'{"weight": "220g", "grip": "4.25"}'}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm font-mono resize-none" />
                </div>

                {/* Image Upload */}
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Hình ảnh sản phẩm</label>
                  <div className="flex items-start gap-4">
                    <div className="w-28 h-28 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                      {form.image_url ? (
                        <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-600 text-secondary-foreground text-sm cursor-pointer transition-all ${
                        uploading ? 'opacity-50' : 'hover:border-lime hover:text-lime'
                      }`}>
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Đang upload...' : 'Chọn ảnh'}
                        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                      </label>
                      <p className="text-muted-foreground text-xs">JPEG, PNG, WebP · Tối đa 5MB</p>
                      {form.image_url && (
                        <button type="button" onClick={() => setForm(f => ({...f, image_url: ''}))} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                          <X className="h-3 w-3" /> Xóa ảnh
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({...f, is_featured: e.target.checked}))}
                      className="accent-lime w-4 h-4" />
                    <span className="text-secondary-foreground text-sm">Sản phẩm nổi bật ⭐</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))}
                      className="accent-lime w-4 h-4" />
                    <span className="text-secondary-foreground text-sm">Hiển thị</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm">Hủy</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.brand || !form.price}
                className="px-5 py-2 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-foreground transition-all text-sm disabled:opacity-50">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card text-card-foreground shadow-sm rounded-2xl border border-red-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-foreground font-bold">Xác nhận xóa sản phẩm</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Thao tác này không thể hoàn tác</p>
              </div>
            </div>
            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-in zoom-in-95">
                ❌ {deleteError}
              </div>
            )}
            <p className="text-secondary-foreground text-sm mb-6">
              Bạn có chắc muốn xóa sản phẩm <strong className="text-foreground">"{deleteTarget.name}"</strong>?
            </p>
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

      {/* Import CSV Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground shadow-sm rounded-2xl border border-border shadow-2xl">
            <div className="sticky top-0 bg-card text-card-foreground shadow-sm px-6 py-4 border-b border-border flex items-center justify-between z-10">
              <h2 className="text-foreground font-bold text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-400" /> Import sản phẩm từ CSV
              </h2>
              <button onClick={() => setShowImport(false)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Download Template */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div>
                  <p className="text-foreground font-medium text-sm">📋 Tải file CSV mẫu</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Định dạng: name, brand, price, original_price, stock, category, description, tags, is_featured</p>
                </div>
                <button
                  onClick={() => {
                    const header = 'name,brand,price,original_price,stock,category,description,tags,is_featured\n'
                    const sample = 'Vợt JOOLA Hyperion CAS 16,JOOLA,4890000,5490000,50,Vợt Pickleball,Vợt carbon cao cấp,carbon;spin;pro,true\n'
                    const blob = new Blob([header + sample], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'products_template.csv'
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-foreground text-sm font-medium hover:bg-blue-700 transition-all shrink-0"
                >
                  <Download className="h-4 w-4" /> Tải mẫu
                </button>
              </div>

              {/* Upload Area */}
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (ev) => {
                      const text = ev.target?.result as string
                      
                      // Auto-detect delimiter: check first line for semicolons vs commas
                      const firstLine = text.split(/\r?\n/)[0] || ''
                      const semicolonCount = (firstLine.match(/;/g) || []).length
                      const commaCount = (firstLine.match(/,/g) || []).length
                      const delimiter = semicolonCount > commaCount ? ';' : ','
                      
                      // Smart CSV parser that handles quoted fields with dynamic delimiter
                      const parseCSVLine = (line: string): string[] => {
                        const result: string[] = []
                        let current = ''
                        let inQuotes = false
                        for (let i = 0; i < line.length; i++) {
                          const ch = line[i]
                          if (ch === '"') {
                            if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
                            else { inQuotes = !inQuotes }
                          } else if (ch === delimiter && !inQuotes) {
                            result.push(current.trim())
                            current = ''
                          } else {
                            current += ch
                          }
                        }
                        result.push(current.trim())
                        return result
                      }
                      
                      const lines = text.split(/\r?\n/).filter(l => l.trim())
                      if (lines.length < 2) { toast.error('File trống hoặc chỉ có header'); return }
                      const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/^\uFEFF/, ''))
                      const rows = lines.slice(1).map(line => {
                        const values = parseCSVLine(line)
                        const obj: any = {}
                        headers.forEach((h, i) => { obj[h] = values[i] || '' })
                        
                        // Normalize column name variants
                        if (obj.category_name && !obj.category) obj.category = obj.category_name
                        
                        // Handle PostgreSQL array format for tags: {tag1, tag2} → "tag1;tag2"
                        if (obj.tags && obj.tags.startsWith('{') && obj.tags.endsWith('}')) {
                          obj.tags = obj.tags.slice(1, -1) // remove { }
                        }
                        // Handle PostgreSQL array format for specs
                        if (obj.specs && obj.specs.startsWith('{') && obj.specs.endsWith('}')) {
                          const inner = obj.specs.slice(1, -1).trim()
                          obj.specs = inner || null
                        }
                        
                        // Handle image_url that may contain multiple comma-separated URLs
                        if (obj.image_url && !obj.images) {
                          // Split by comma+space pattern (URLs contain :// so we split by ", http")
                          const urls = obj.image_url.split(/,\s*(?=http)/).map((u: string) => u.trim()).filter(Boolean)
                          if (urls.length > 1) {
                            obj.images = urls.join(';')
                            obj.image_url = urls[0]
                          }
                        }
                        
                        return obj
                      }).filter(r => r.name)
                      setImportData(rows)
                      setImportResult(null)
                      if (rows.length > 0) toast.success(`Đã đọc ${rows.length} sản phẩm từ CSV`)
                    }
                    reader.readAsText(file, 'UTF-8')
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer"
                >
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-secondary-foreground font-medium">Nhấn để chọn file CSV</p>
                  <p className="text-muted-foreground text-xs mt-1">Hỗ trợ .csv — Mỗi dòng là 1 sản phẩm</p>
                </button>
              </div>

              {/* Preview */}
              {importData.length > 0 && !importResult && (
                <div>
                  <p className="text-foreground font-medium mb-3">📦 Preview: {importData.length} sản phẩm</p>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-3 py-2 text-left text-muted-foreground">#</th>
                          <th className="px-3 py-2 text-left text-muted-foreground">Tên</th>
                          <th className="px-3 py-2 text-left text-muted-foreground">Brand</th>
                          <th className="px-3 py-2 text-left text-muted-foreground">Giá</th>
                          <th className="px-3 py-2 text-left text-muted-foreground">Kho</th>
                          <th className="px-3 py-2 text-left text-muted-foreground">Danh mục</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importData.slice(0, 20).map((row, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="px-3 py-2 text-muted-foreground">{i+1}</td>
                            <td className="px-3 py-2 text-foreground max-w-[200px] truncate">{row.name}</td>
                            <td className="px-3 py-2 text-secondary-foreground">{row.brand}</td>
                            <td className="px-3 py-2 text-lime">{formatVND(Number(row.price) || 0)}</td>
                            <td className="px-3 py-2 text-secondary-foreground">{row.stock}</td>
                            <td className="px-3 py-2 text-muted-foreground">{row.category || row.category_name}</td>
                          </tr>
                        ))}
                        {importData.length > 20 && (
                          <tr><td colSpan={6} className="px-3 py-2 text-center text-muted-foreground">...và {importData.length - 20} sản phẩm khác</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Result */}
              {importResult && (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="flex-1 p-4 rounded-xl bg-lime/10 border border-lime/20 text-center">
                      <CheckCircle2 className="h-6 w-6 text-lime mx-auto mb-1" />
                      <p className="text-lime font-bold text-lg">{importResult.success}</p>
                      <p className="text-muted-foreground text-xs">Thành công</p>
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                      <XCircle className="h-6 w-6 text-red-400 mx-auto mb-1" />
                      <p className="text-red-400 font-bold text-lg">{importResult.failed}</p>
                      <p className="text-muted-foreground text-xs">Thất bại</p>
                    </div>
                  </div>
                  {importResult.errors?.length > 0 && (
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 max-h-40 overflow-y-auto">
                      {importResult.errors.map((err: string, i: number) => (
                        <p key={i} className="text-red-400 text-xs py-0.5">⚠ {err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowImport(false)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm">Đóng</button>
              {importData.length > 0 && !importResult && (
                <button
                  onClick={async () => {
                    setImporting(true)
                    try {
                      const res = await fetch('/api/admin/products/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ products: importData })
                      })
                      const result = await res.json()
                      setImportResult(result)
                      if (result.success > 0) fetchProducts()
                    } catch { toast.error('Lỗi import') }
                    setImporting(false)
                  }}
                  disabled={importing}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-foreground font-bold hover:bg-blue-700 transition-all text-sm disabled:opacity-50"
                >
                  {importing ? 'Đang import...' : `Import ${importData.length} sản phẩm`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
