'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign, ShoppingCart, Package, Users,
  ArrowRight, ShoppingCart as ShoppingCartEmpty
} from 'lucide-react'

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ'
}

const STATUS_MAP: Record<string, { label: string; dot: string; badgeText: string; badgeBg: string }> = {
  pending:   { label: 'Chờ xử lý',      dot: 'bg-yellow-400', badgeText: 'text-yellow-600', badgeBg: 'bg-yellow-50' },
  paid:      { label: 'Đã thanh toán',  dot: 'bg-blue-400',   badgeText: 'text-blue-600',   badgeBg: 'bg-blue-50' },
  shipping:  { label: 'Đang giao',      dot: 'bg-purple-400', badgeText: 'text-purple-600', badgeBg: 'bg-purple-50' },
  completed: { label: 'Hoàn thành',     dot: 'bg-emerald-400',badgeText: 'text-emerald-600',badgeBg: 'bg-emerald-50' },
  cancelled: { label: 'Đã hủy',         dot: 'bg-red-400',    badgeText: 'text-red-600',    badgeBg: 'bg-red-50' },
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
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-gray-200" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="h-96 rounded-2xl bg-gray-200" />
          <div className="xl:col-span-2 h-96 rounded-2xl bg-gray-200" />
        </div>
      </div>
    )
  }

  const stats = data?.stats ?? {}
  const statusCounts = data?.statusCounts ?? { pending: 0, paid: 0, shipping: 0, completed: 0, cancelled: 0 }
  const recentOrders = data?.recentOrders ?? []

  const statCards = [
    { 
      title: 'Tổng doanh thu', 
      value: formatVND(stats.totalRevenue ?? 0), 
      subtext: 'Từ đơn thành công', 
      icon: DollarSign, 
      iconBg: 'bg-[#4ade80]', 
      iconColor: 'text-white',
      trend: '+12%',
      trendColor: 'text-emerald-500'
    },
    { 
      title: 'Tổng đơn hàng', 
      value: (stats.totalOrders ?? 0).toString(), 
      subtext: `${statusCounts.pending ?? 0} đang chờ xử lý`, 
      icon: ShoppingCart, 
      iconBg: 'bg-[#3b82f6]', 
      iconColor: 'text-white',
      trend: '+8%',
      trendColor: 'text-emerald-500'
    },
    { 
      title: 'Sản phẩm', 
      value: (stats.totalProducts ?? 0).toString(), 
      subtext: 'Đang kinh doanh', 
      icon: Package, 
      iconBg: 'bg-[#f97316]', 
      iconColor: 'text-white',
      trend: '+5%',
      trendColor: 'text-emerald-500'
    },
    { 
      title: 'Khách hàng', 
      value: (stats.totalCustomers ?? 0).toString(), 
      subtext: 'Tài khoản đăng ký', 
      icon: Users, 
      iconBg: 'bg-[#a855f7]', 
      iconColor: 'text-white',
      trend: '+16%',
      trendColor: 'text-emerald-500'
    },
  ]

  return (
    <div className="space-y-6">
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 tracking-tight">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-[140px]">
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.iconBg} shadow-sm`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} strokeWidth={2.5} />
              </div>
              <div className="flex items-center gap-1 text-[13px] font-bold">
                <span className={card.trendColor}>
                  <svg className="w-3.5 h-3.5 inline mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  {card.trend}
                </span>
              </div>
            </div>
            
            <div className="mt-2">
              <h3 className="text-2xl font-black text-gray-800">{card.value}</h3>
              <p className="text-[13px] font-bold text-gray-800 mt-1">{card.title}</p>
              <p className="text-[12px] text-gray-400 font-medium mt-0.5">{card.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Order Statuses */}
        <div className="space-y-6">
          <div className="bg-white rounded-[20px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-[12px] font-bold text-gray-400 tracking-wider uppercase">Trạng thái đơn hàng</h2>
            </div>
            <div className="p-4 space-y-2">
              {['pending', 'paid', 'shipping', 'completed', 'cancelled'].map(statusKey => {
                const config = STATUS_MAP[statusKey]
                const count = statusCounts[statusKey] || 0
                return (
                  <div key={statusKey} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`}></div>
                      <span className="text-[14px] font-semibold text-gray-600">{config.label}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[13px] font-bold ${config.badgeBg} ${config.badgeText}`}>
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[#4ade80] rounded-[20px] shadow-sm p-6 text-white">
            <h2 className="text-[11px] font-bold tracking-widest uppercase opacity-90 mb-4">Doanh thu tổng</h2>
            <h3 className="text-3xl font-black">{formatVND(stats.totalRevenue ?? 0)}</h3>
            <div className="flex items-center gap-1 text-[13px] font-medium opacity-90 mt-2">
              <ArrowRight className="w-4 h-4" />
              <span>Từ đơn thanh toán thành công</span>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Orders Table */}
        <div className="xl:col-span-2 bg-white rounded-[20px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="text-[12px] font-bold text-gray-400 tracking-wider uppercase">Đơn hàng gần đây</h2>
            <Link href="/admin/orders" className="text-[13px] font-bold text-[#4ade80] hover:text-[#22c55e] flex items-center gap-1 transition-colors">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a1a] text-white text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4 rounded-l-lg">Mã đơn</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Tổng tiền</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 rounded-r-lg">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-300">
                        <ShoppingCartEmpty className="w-16 h-16 mb-4 opacity-50" strokeWidth={1} />
                        <p className="text-[14px] font-medium">Chưa có đơn hàng nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order: any) => {
                    const statusConfig = STATUS_MAP[order.status] || STATUS_MAP.pending
                    const date = new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    
                    return (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <Link href={`/admin/orders/${order.id}`} className="text-[14px] font-bold text-gray-800 hover:text-[#4ade80] transition-colors">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[14px] font-semibold text-gray-700">{order.shipping_name}</p>
                          <p className="text-[12px] font-medium text-gray-400">{order.shipping_phone}</p>
                        </td>
                        <td className="px-6 py-4 text-[14px] font-extrabold text-[#4ade80]">
                          {formatVND(order.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
                            <span className="text-[13px] font-semibold text-gray-600">{statusConfig.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-medium text-gray-500">
                          {date}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
