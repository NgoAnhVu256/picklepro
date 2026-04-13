'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, ShoppingBag, Package, Users,
  ArrowUpRight, Clock, CheckCircle, Truck, XCircle, AlertCircle
} from 'lucide-react'

function formatVND(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: 'Chờ xử lý',  color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', icon: Clock },
  paid:      { label: 'Đã thanh toán', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', icon: CheckCircle },
  shipping:  { label: 'Đang giao',  color: 'text-purple-400 bg-purple-400/10 border-purple-400/30', icon: Truck },
  completed: { label: 'Hoàn thành', color: 'text-lime bg-lime/10 border-lime/30', icon: CheckCircle },
  cancelled: { label: 'Đã hủy',    color: 'text-red-400 bg-red-400/10 border-red-400/30', icon: XCircle },
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800/50 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800/50 animate-pulse" />
          <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800/50 animate-pulse" />
        </div>
      </div>
    )
  }

  const stats = data?.stats ?? {}
  const recentOrders = data?.recentOrders ?? []
  const topProducts = data?.topProducts ?? []
  const monthlyRevenue = data?.monthlyRevenue ?? []

  const statCards = [
    { label: 'Tổng doanh thu', value: formatVND(stats.totalRevenue ?? 0), icon: TrendingUp, color: 'from-lime/20 to-lime/5 border-lime/20', iconColor: 'text-lime' },
    { label: 'Đơn hàng', value: (stats.totalOrders ?? 0).toLocaleString(), icon: ShoppingBag, color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20', iconColor: 'text-blue-400' },
    { label: 'Sản phẩm', value: (stats.totalProducts ?? 0).toLocaleString(), icon: Package, color: 'from-purple-500/20 to-purple-500/5 border-purple-500/20', iconColor: 'text-purple-400' },
    { label: 'Khách hàng', value: (stats.totalCustomers ?? 0).toLocaleString(), icon: Users, color: 'from-orange-500/20 to-orange-500/5 border-orange-500/20', iconColor: 'text-orange-400' },
  ]

  // Bar chart height
  const maxRev = Math.max(...monthlyRevenue.map((m: any) => m.revenue), 1)

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Tổng quan hoạt động cửa hàng PicklePro</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.color} border p-5`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{card.label}</p>
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <p className={`text-2xl font-bold ${card.iconColor}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-gray-900 dark:text-white font-bold mb-6">Doanh thu 6 tháng gần nhất</h2>
          {monthlyRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Chưa có dữ liệu</div>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {monthlyRevenue.map((m: any) => {
                const height = Math.max((m.revenue / maxRev) * 100, 4)
                const monthName = new Date(m.month + '-01').toLocaleDateString('vi-VN', { month: 'short' })
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                    <p className="text-lime text-xs font-medium">{formatVND(m.revenue)}</p>
                    <div
                      className="w-full bg-gradient-to-t from-lime to-lime/60 rounded-t-lg transition-all duration-700"
                      style={{ height: `${height}%` }}
                    />
                    <p className="text-gray-500 text-xs">{monthName}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-gray-900 dark:text-white font-bold mb-4">Top sản phẩm bán chạy</h2>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Chưa có dữ liệu</p>
            ) : topProducts.map((p: any, i: number) => (
              <div key={p.slug} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === 0 ? 'bg-yellow-500/20 text-yellow-500 dark:text-yellow-400' :
                  i === 1 ? 'bg-gray-500/20 text-gray-500 dark:text-gray-400' :
                  i === 2 ? 'bg-orange-500/20 text-orange-500 dark:text-orange-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{p.name}</p>
                  <p className="text-gray-500 text-xs">{p.qty} đã bán · {formatVND(p.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-gray-900 dark:text-white font-bold">Đơn hàng gần đây</h2>
          <Link href="/admin/orders" className="text-lime-dark dark:text-lime text-sm hover:underline flex items-center gap-1">
            Xem tất cả <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left text-gray-500 font-medium px-6 py-3">Mã đơn</th>
                <th className="text-left text-gray-500 font-medium px-6 py-3">Khách hàng</th>
                <th className="text-left text-gray-500 font-medium px-6 py-3 hidden sm:table-cell">Tổng tiền</th>
                <th className="text-left text-gray-500 font-medium px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-500 py-10">Chưa có đơn hàng</td></tr>
              ) : recentOrders.map((order: any) => {
                const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
                return (
                  <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-lime-dark dark:text-lime hover:underline font-mono text-xs">
                        #{order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-900 dark:text-white">{order.shipping_name}</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-white hidden sm:table-cell font-medium">{formatVND(order.total_amount)}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.color}`}>
                        <s.icon className="h-3 w-3" />
                        {s.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
