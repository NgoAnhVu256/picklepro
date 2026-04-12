'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Clock, CheckCircle, Truck, XCircle, ShoppingBag, Eye, ChevronDown } from 'lucide-react'

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: 'Chờ xử lý',     color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', icon: Clock },
  paid:      { label: 'Đã thanh toán', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', icon: CheckCircle },
  shipping:  { label: 'Đang giao',     color: 'text-purple-400 bg-purple-400/10 border-purple-400/30', icon: Truck },
  completed: { label: 'Hoàn thành',   color: 'text-lime bg-lime/10 border-lime/30', icon: CheckCircle },
  cancelled: { label: 'Đã hủy',       color: 'text-red-400 bg-red-400/10 border-red-400/30', icon: XCircle },
}

const ALL_STATUSES = ['', 'pending', 'paid', 'shipping', 'completed', 'cancelled']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [updating, setUpdating] = useState<string | null>(null)
  const LIMIT = 20

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), ...(status && { status }) })
    const res = await fetch(`/api/admin/orders?${params}`)
    const data = await res.json()
    setOrders(data.orders ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, status])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    setUpdating(null)
    fetchOrders()
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Đơn hàng</h1>
          <p className="text-gray-400 text-sm mt-1">{total} đơn hàng</p>
        </div>
        {/* Filter by status */}
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map(s => {
            const cfg = s ? STATUS_CONFIG[s] : null
            return (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1) }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  status === s
                    ? 'bg-lime/20 text-lime border-lime/40'
                    : 'text-gray-400 border-gray-700 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                {s ? cfg?.label : 'Tất cả'}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Mã đơn', 'Khách hàng', 'SĐT', 'Tổng tiền', 'Ngày tạo', 'Trạng thái', 'Đổi trạng thái'].map(h => (
                  <th key={h} className="text-left text-gray-500 font-medium px-5 py-3 whitespace-nowrap">{h}</th>
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
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-12">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-gray-700" />
                  <p>Không có đơn hàng nào</p>
                </td></tr>
              ) : orders.map(order => {
                const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
                return (
                  <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`}
                        className="text-lime hover:underline font-mono text-xs">
                        #{order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-white">{order.shipping_name}</td>
                    <td className="px-5 py-3 text-gray-400">{order.shipping_phone}</td>
                    <td className="px-5 py-3 text-lime font-semibold">{formatVND(order.total_amount)}</td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.color}`}>
                        <s.icon className="h-3 w-3" />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="relative">
                        <select
                          value={order.status}
                          disabled={updating === order.id}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          className="appearance-none pl-2 pr-6 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs focus:outline-none focus:border-lime disabled:opacity-50 cursor-pointer"
                        >
                          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                            <option key={val} value={val}>{cfg.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
            <p className="text-gray-500 text-sm">{total} đơn · Trang {page}/{totalPages}</p>
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
