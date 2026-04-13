"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

const announcements = [
  "🔥 FLASH SALE - Giảm đến 50% tất cả vợt JOOLA — Chỉ hôm nay!",
  "🚚 Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên",
  "🏆 PicklePro — Cửa hàng Pickleball uy tín số 1 Việt Nam",
  "🎁 Tặng Grip cao cấp khi mua vợt trên 3.000.000đ",
  "⭐ Đăng ký thành viên VIP — Giảm thêm 10% mọi đơn hàng",
]

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="relative overflow-hidden py-2.5 px-4"
      style={{ background: "linear-gradient(90deg, #EDFEB9, #B2FF73, #EDFEB9)" }}
    >
      <div className="container mx-auto flex items-center justify-center gap-3">
        <div className="overflow-hidden flex-1 text-center">
          <div
            className="transition-all duration-500 ease-in-out"
            key={currentIndex}
            style={{ animation: "slideUp 0.5s ease-out" }}
          >
            <p className="text-sm font-semibold text-black tracking-wide whitespace-nowrap">
              {announcements[currentIndex]}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Đóng thông báo"
        >
          <X className="h-4 w-4 text-black/60" />
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
