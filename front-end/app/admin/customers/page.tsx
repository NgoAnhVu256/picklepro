'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Users, ShoppingBag } from 'lucide-react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 20

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search })
    const res = await fetch(`/api/admin/customers?${params}`)
    const data = await res.json()
    setCustomers(data.customers ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, search])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Khách hàng</h1>
          <p className="text-gray-400 text-sm mt-1">{total} tài khoản đã đăng ký</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Tìm khách hàng..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-lime text-sm"
        />
      </div>

      <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Khách hàng', 'Số điện thoại', 'Số đơn hàng', 'Vai trò', 'Cập nhật lần cuối'].map(h => (
                  <th key={h} className="text-left text-gray-500 font-medium px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-500 py-12">
                  <Users className="h-10 w-10 mx-auto mb-2 text-gray-700" />
                  <p>Không tìm thấy khách hàng</p>
                </td></tr>
              ) : customers.map(c => (
                <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lime/30 to-lime/10 border border-lime/20 flex items-center justify-center text-lime font-bold text-sm shrink-0">
                        {c.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-white font-medium">{c.full_name || 'Chưa cập nhật'}</p>
                        <p className="text-gray-500 text-xs font-mono">{c.id.slice(0, 12)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-300">{c.phone || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5 text-gray-300">
                      <ShoppingBag className="h-3.5 w-3.5 text-gray-500" />
                      {c.orderCount} đơn
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      c.role === 'admin'
                        ? 'text-lime bg-lime/10 border-lime/30'
                        : 'text-gray-400 bg-gray-800 border-gray-700'
                    }`}>
                      {c.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(c.updated_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
            <p className="text-gray-500 text-sm">{total} khách · Trang {page}/{totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 transition-all">← Trước</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 transition-all">Sau →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
