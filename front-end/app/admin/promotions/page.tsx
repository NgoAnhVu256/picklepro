'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Percent, Tag, Calendar, ToggleLeft, ToggleRight, AlertTriangle, Copy, CheckCircle, Search, Gift } from 'lucide-react'

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

interface Promotion {
  id: string
  code: string
  description: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order_value: number
  max_discount: number | null
  usage_limit: number
  used_count: number
  starts_at: string
  expires_at: string
  is_active: boolean
  created_at: string
}

const EMPTY_FORM = {
  code: '',
  description: '',
  discount_type: 'percent' as 'percent' | 'fixed',
  discount_value: '',
  min_order_value: '',
  max_discount: '',
  usage_limit: '',
  starts_at: '',
  expires_at: '',
  is_active: true,
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState('')

  const fetchPromotions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/promotions?search=${search}`)
      const data = await res.json()
      setPromotions(data.promotions ?? [])
    } catch { }
    setLoading(false)
  }, [search])

  useEffect(() => { fetchPromotions() }, [fetchPromotions])

  const openAdd = () => {
    setEditing(null)
    const now = new Date()
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    setForm({
      ...EMPTY_FORM,
      starts_at: now.toISOString().slice(0, 16),
      expires_at: nextMonth.toISOString().slice(0, 16),
    })
    setShowModal(true)
  }

  const openEdit = (p: Promotion) => {
    setEditing(p)
    setForm({
      code: p.code,
      description: p.description,
      discount_type: p.discount_type,
      discount_value: String(p.discount_value),
      min_order_value: String(p.min_order_value),
      max_discount: p.max_discount ? String(p.max_discount) : '',
      usage_limit: String(p.usage_limit),
      starts_at: p.starts_at?.slice(0, 16) || '',
      expires_at: p.expires_at?.slice(0, 16) || '',
      is_active: p.is_active,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      min_order_value: Number(form.min_order_value) || 0,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      usage_limit: Number(form.usage_limit) || 100,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : new Date().toISOString(),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    }
    const url = editing ? `/api/admin/promotions/${editing.id}` : '/api/admin/promotions'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    setShowModal(false)
    fetchPromotions()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/admin/promotions/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    fetchPromotions()
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(''), 2000)
  }

  const isExpired = (p: Promotion) => p.expires_at && new Date(p.expires_at) < new Date()
  const isUpcoming = (p: Promotion) => p.starts_at && new Date(p.starts_at) > new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Khuyến mãi</h1>
          <p className="text-muted-foreground text-sm mt-1">{promotions.length} mã khuyến mãi</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-foreground transition-all shadow-lg shadow-lime/20">
          <Plus className="h-4 w-4" /> Tạo mã KM
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm mã khuyến mãi..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card text-card-foreground shadow-sm border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-lime text-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card text-card-foreground shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Mã', 'Mô tả', 'Giảm giá', 'Đơn tối thiểu', 'Đã dùng', 'Thời hạn', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left text-muted-foreground font-medium px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : promotions.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted-foreground py-12">
                  <Gift className="h-10 w-10 mx-auto mb-2 text-gray-700" />
                  <p>Chưa có mã khuyến mãi nào</p>
                  <p className="text-xs mt-1">Nhấn "Tạo mã KM" để bắt đầu</p>
                </td></tr>
              ) : promotions.map(p => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <button onClick={() => copyCode(p.code)} className="flex items-center gap-1.5 group">
                      <code className="text-lime font-bold tracking-wider">{p.code}</code>
                      {copied === p.code
                        ? <CheckCircle className="h-3.5 w-3.5 text-lime" />
                        : <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-muted-foreground transition-colors" />}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-secondary-foreground max-w-[200px] truncate">{p.description || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="text-foreground font-semibold">
                      {p.discount_type === 'percent' ? `${p.discount_value}%` : formatVND(p.discount_value)}
                    </span>
                    {p.max_discount && p.discount_type === 'percent' && (
                      <span className="text-muted-foreground text-xs block">tối đa {formatVND(p.max_discount)}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.min_order_value > 0 ? formatVND(p.min_order_value) : '—'}</td>
                  <td className="px-5 py-3">
                    <span className="text-secondary-foreground">{p.used_count}</span>
                    <span className="text-muted-foreground">/{p.usage_limit}</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {p.expires_at ? new Date(p.expires_at).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                  </td>
                  <td className="px-5 py-3">
                    {isExpired(p) ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-red-400 bg-red-400/10 border border-red-400/30">Hết hạn</span>
                    ) : isUpcoming(p) ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-blue-400 bg-blue-400/10 border border-blue-400/30">Sắp tới</span>
                    ) : p.is_active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-lime bg-lime/10 border border-lime/30">● Đang chạy</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground bg-muted border border-border">○ Tắt</span>
                    )}
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
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card text-card-foreground shadow-sm rounded-2xl border border-border shadow-2xl">
            <div className="sticky top-0 bg-card text-card-foreground shadow-sm px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-foreground font-bold text-lg">{editing ? 'Sửa khuyến mãi' : 'Tạo mã khuyến mãi'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Mã khuyến mãi *</label>
                <input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))}
                  placeholder="VD: GIAM20, FREESHIP..."
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm font-mono tracking-wider uppercase" />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Mô tả</label>
                <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  placeholder="Giảm 20% cho đơn từ 500K"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Loại giảm giá</label>
                  <select value={form.discount_type} onChange={e => setForm(f => ({...f, discount_type: e.target.value as any}))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm">
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VND)</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">
                    {form.discount_type === 'percent' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VND)'}
                  </label>
                  <input type="number" value={form.discount_value} onChange={e => setForm(f => ({...f, discount_value: e.target.value}))}
                    placeholder={form.discount_type === 'percent' ? '20' : '100000'}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Đơn tối thiểu (VND)</label>
                  <input type="number" value={form.min_order_value} onChange={e => setForm(f => ({...f, min_order_value: e.target.value}))}
                    placeholder="500000"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Giảm tối đa (VND)</label>
                  <input type="number" value={form.max_discount} onChange={e => setForm(f => ({...f, max_discount: e.target.value}))}
                    placeholder="Để trống = không giới hạn"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Số lượt sử dụng tối đa</label>
                <input type="number" value={form.usage_limit} onChange={e => setForm(f => ({...f, usage_limit: e.target.value}))}
                  placeholder="100"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Bắt đầu</label>
                  <input type="datetime-local" value={form.starts_at} onChange={e => setForm(f => ({...f, starts_at: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Hết hạn</label>
                  <input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({...f, expires_at: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-lime text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))}
                  className="accent-lime w-4 h-4" />
                <span className="text-secondary-foreground text-sm">Kích hoạt ngay</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm">Hủy</button>
              <button onClick={handleSave} disabled={saving || !form.code || !form.discount_value}
                className="px-5 py-2 rounded-xl bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-foreground transition-all text-sm disabled:opacity-50">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mã'}
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
                <h3 className="text-foreground font-bold">Xóa mã khuyến mãi</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Thao tác này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-secondary-foreground text-sm mb-6">
              Bạn có chắc muốn xóa mã <code className="text-lime font-bold">{deleteTarget.code}</code>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm">Hủy</button>
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
