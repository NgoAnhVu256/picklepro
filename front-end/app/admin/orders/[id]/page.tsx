'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle, Truck, XCircle, ChevronDown } from 'lucide-react'

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

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then(r => r.json())
      .then(d => { setOrder(d); setLoading(false) })
  }, [params.id])

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    const res = await fetch(`/api/admin/orders/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    const data = await res.json()
    setOrder((prev: any) => ({ ...prev, status: data.status ?? newStatus }))
    setUpdating(false)
  }

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-gray-800/50 animate-pulse" />)}
    </div>
  )

  if (!order || order.error) return (
    <div className="text-center py-20 text-gray-500">
      <p className="text-lg">Không tìm thấy đơn hàng</p>
      <Link href="/admin/orders" className="text-lime hover:underline text-sm mt-2 block">← Quay lại</Link>
    </div>
  )

  const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Chi tiết đơn hàng</h1>
          <p className="text-gray-400 text-sm font-mono">#{order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Thông tin giao hàng */}
        <div className="md:col-span-2 rounded-2xl bg-gray-900 border border-gray-800 p-5 space-y-3">
          <h2 className="text-white font-bold">Thông tin giao hàng</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-500">Người nhận</p><p className="text-white font-medium">{order.shipping_name}</p></div>
            <div><p className="text-gray-500">Số điện thoại</p><p className="text-white">{order.shipping_phone}</p></div>
            <div className="col-span-2"><p className="text-gray-500">Địa chỉ</p><p className="text-white">{order.shipping_address}</p></div>
            <div><p className="text-gray-500">Thanh toán</p><p className="text-white uppercase">{order.payment_method}</p></div>
            <div><p className="text-gray-500">Ngày đặt</p><p className="text-white">{new Date(order.created_at).toLocaleString('vi-VN')}</p></div>
          </div>
        </div>

        {/* Trạng thái */}
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-5 space-y-4">
          <h2 className="text-white font-bold">Trạng thái</h2>
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${s.color}`}>
            <s.icon className="h-4 w-4" /> {s.label}
          </span>
          <div>
            <p className="text-gray-500 text-xs mb-2">Đổi trạng thái:</p>
            <div className="relative">
              <select
                value={order.status}
                disabled={updating}
                onChange={e => updateStatus(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-lime disabled:opacity-50"
              >
                {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                  <option key={val} value={val}>{cfg.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-800">
            <p className="text-gray-500 text-xs">Tổng tiền</p>
            <p className="text-lime font-bold text-xl">{formatVND(order.total_amount)}</p>
          </div>
        </div>
      </div>

      {/* Sản phẩm trong đơn */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-bold">Sản phẩm đã đặt</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Sản phẩm', 'Brand', 'Đơn giá', 'SL', 'Thành tiền'].map(h => (
                <th key={h} className="text-left text-gray-500 font-medium px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(order.order_items ?? []).map((item: any) => (
              <tr key={item.id} className="border-b border-gray-800/50">
                <td className="px-5 py-3 text-white font-medium">{item.products?.name ?? '—'}</td>
                <td className="px-5 py-3 text-gray-400">{item.products?.brand ?? '—'}</td>
                <td className="px-5 py-3 text-gray-300">{formatVND(item.unit_price)}</td>
                <td className="px-5 py-3 text-gray-300">×{item.quantity}</td>
                <td className="px-5 py-3 text-lime font-semibold">{formatVND(item.unit_price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-700">
            <tr>
              <td colSpan={4} className="px-5 py-3 text-right text-gray-400 font-medium">Tổng cộng:</td>
              <td className="px-5 py-3 text-lime font-bold text-lg">{formatVND(order.total_amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
