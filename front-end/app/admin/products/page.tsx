'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, Star, Package, ToggleLeft, ToggleRight, AlertTriangle, Upload, ImageIcon, X, FileSpreadsheet, Download, CheckCircle2, XCircle } from 'lucide-react'

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

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)

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

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowModal(true) }
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
      if (data.url) setForm(f => ({ ...f, image_url: data.url }))
      else alert(data.error || 'Upload thất bại')
    } catch { alert('Lỗi upload') }
    setUploading(false)
  }

  const handleSave = async () => {
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
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    setShowModal(false)
    fetchProducts()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/admin/products/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    fetchProducts()
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sản phẩm</h1>
          <p className="text-gray-400 text-sm mt-1">{total} sản phẩm trong kho</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowImport(true); setImportData([]); setImportResult(null) }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            <FileSpreadsheet className="h-4 w-4" /> Import CSV
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-white transition-all shadow-lg shadow-lime/20">
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Tìm sản phẩm..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-lime text-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Sản phẩm', 'Brand', 'Giá', 'Kho', 'Trạng thái', 'Nổi bật', ''].map(h => (
                  <th key={h} className="text-left text-gray-500 font-medium px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-12">
                  <Package className="h-10 w-10 mx-auto mb-2 text-gray-700" />
                  <p>Không tìm thấy sản phẩm</p>
                </td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-white font-medium line-clamp-1 max-w-[200px]">{p.name}</p>
                    <p className="text-gray-500 text-xs">{p.categories?.name ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-300">{p.brand}</td>
                  <td className="px-5 py-3 text-lime font-semibold">{formatVND(p.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-medium ${p.stock === 0 ? 'text-red-400' : p.stock < 5 ? 'text-yellow-400' : 'text-gray-300'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      p.is_active ? 'text-lime bg-lime/10 border-lime/30' : 'text-gray-400 bg-gray-800 border-gray-700'
                    }`}>
                      {p.is_active ? '● Hiển thị' : '○ Ẩn'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {p.is_featured ? <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> : <Star className="h-4 w-4 text-gray-700" />}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
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
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
            <p className="text-gray-500 text-sm">{total} sản phẩm · Trang {page}/{totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 transition-all">← Trước</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 transition-all">Sau →</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
            <div className="sticky top-0 bg-gray-900 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Tên sản phẩm *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Thương hiệu *</label>
                  <input value={form.brand} onChange={e => setForm(f => ({...f, brand: e.target.value}))}
                    placeholder="JOOLA, Selkirk..."
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Danh mục</label>
                  <select value={form.category_id} onChange={e => setForm(f => ({...f, category_id: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-lime text-sm">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Giá bán (VND) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Giá gốc (VND)</label>
                  <input type="number" value={form.original_price} onChange={e => setForm(f => ({...f, original_price: e.target.value}))}
                    placeholder="Để trống nếu không giảm giá"
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Số lượng trong kho *</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Tags (cách nhau bằng dấu phẩy)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))}
                    placeholder="carbon, spin, power..."
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-lime text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Mô tả sản phẩm</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-lime text-sm resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Specs (JSON)</label>
                  <textarea value={form.specs} onChange={e => setForm(f => ({...f, specs: e.target.value}))}
                    rows={3} placeholder={'{"weight": "220g", "grip": "4.25"}'}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-lime text-sm font-mono resize-none" />
                </div>

                {/* Image Upload */}
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Hình ảnh sản phẩm</label>
                  <div className="flex items-start gap-4">
                    <div className="w-28 h-28 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                      {form.image_url ? (
                        <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-600 text-gray-300 text-sm cursor-pointer transition-all ${
                        uploading ? 'opacity-50' : 'hover:border-lime hover:text-lime'
                      }`}>
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Đang upload...' : 'Chọn ảnh'}
                        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                      </label>
                      <p className="text-gray-500 text-xs">JPEG, PNG, WebP · Tối đa 5MB</p>
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
                    <span className="text-gray-300 text-sm">Sản phẩm nổi bật ⭐</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))}
                      className="accent-lime w-4 h-4" />
                    <span className="text-gray-300 text-sm">Hiển thị</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-800 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm">Hủy</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.brand || !form.price}
                className="px-5 py-2 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-white transition-all text-sm disabled:opacity-50">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-gray-900 rounded-2xl border border-red-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Xác nhận xóa</h3>
                <p className="text-gray-400 text-xs mt-0.5">Thao tác này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Bạn có chắc muốn ẩn sản phẩm <strong className="text-white">"{deleteTarget.name}"</strong>?
              Sản phẩm sẽ không hiển thị trên cửa hàng.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm">Hủy</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all text-sm disabled:opacity-50">
                {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
            <div className="sticky top-0 bg-gray-900 px-6 py-4 border-b border-gray-800 flex items-center justify-between z-10">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-400" /> Import sản phẩm từ CSV
              </h2>
              <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Download Template */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div>
                  <p className="text-white font-medium text-sm">📋 Tải file CSV mẫu</p>
                  <p className="text-gray-400 text-xs mt-0.5">Định dạng: name, brand, price, original_price, stock, category, description, tags, is_featured</p>
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shrink-0"
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
                      const lines = text.split('\n').filter(l => l.trim())
                      if (lines.length < 2) { alert('File trống hoặc chỉ có header'); return }
                      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
                      const rows = lines.slice(1).map(line => {
                        const values = line.split(',').map(v => v.trim())
                        const obj: any = {}
                        headers.forEach((h, i) => { obj[h] = values[i] || '' })
                        return obj
                      }).filter(r => r.name)
                      setImportData(rows)
                      setImportResult(null)
                    }
                    reader.readAsText(file)
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer"
                >
                  <Upload className="h-10 w-10 mx-auto mb-3 text-gray-500" />
                  <p className="text-gray-300 font-medium">Nhấn để chọn file CSV</p>
                  <p className="text-gray-500 text-xs mt-1">Hỗ trợ .csv — Mỗi dòng là 1 sản phẩm</p>
                </button>
              </div>

              {/* Preview */}
              {importData.length > 0 && !importResult && (
                <div>
                  <p className="text-white font-medium mb-3">📦 Preview: {importData.length} sản phẩm</p>
                  <div className="overflow-x-auto rounded-xl border border-gray-800">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-800">
                          <th className="px-3 py-2 text-left text-gray-400">#</th>
                          <th className="px-3 py-2 text-left text-gray-400">Tên</th>
                          <th className="px-3 py-2 text-left text-gray-400">Brand</th>
                          <th className="px-3 py-2 text-left text-gray-400">Giá</th>
                          <th className="px-3 py-2 text-left text-gray-400">Kho</th>
                          <th className="px-3 py-2 text-left text-gray-400">Danh mục</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importData.slice(0, 20).map((row, i) => (
                          <tr key={i} className="border-t border-gray-800/50">
                            <td className="px-3 py-2 text-gray-500">{i+1}</td>
                            <td className="px-3 py-2 text-white max-w-[200px] truncate">{row.name}</td>
                            <td className="px-3 py-2 text-gray-300">{row.brand}</td>
                            <td className="px-3 py-2 text-lime">{formatVND(Number(row.price) || 0)}</td>
                            <td className="px-3 py-2 text-gray-300">{row.stock}</td>
                            <td className="px-3 py-2 text-gray-400">{row.category}</td>
                          </tr>
                        ))}
                        {importData.length > 20 && (
                          <tr><td colSpan={6} className="px-3 py-2 text-center text-gray-500">...và {importData.length - 20} sản phẩm khác</td></tr>
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
                      <p className="text-gray-400 text-xs">Thành công</p>
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                      <XCircle className="h-6 w-6 text-red-400 mx-auto mb-1" />
                      <p className="text-red-400 font-bold text-lg">{importResult.failed}</p>
                      <p className="text-gray-400 text-xs">Thất bại</p>
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

            <div className="px-6 py-4 border-t border-gray-800 flex gap-3 justify-end">
              <button onClick={() => setShowImport(false)}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm">Đóng</button>
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
                    } catch { alert('Lỗi import') }
                    setImporting(false)
                  }}
                  disabled={importing}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all text-sm disabled:opacity-50"
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
