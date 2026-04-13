"use client"

import { useState } from "react"
import { X } from "lucide-react"

const announcements = [
  "🔥 FLASH SALE — Giảm đến 50% tất cả vợt JOOLA!",
  "🚚 Miễn phí vận chuyển cho đơn hàng từ 500K",
  "🏆 PicklePro — Cửa hàng Pickleball uy tín #1 Việt Nam",
  "🎁 Tặng Grip cao cấp khi mua vợt trên 3 triệu",
  "⭐ Đăng ký VIP — Giảm thêm 10% mọi đơn hàng",
]

// Repeat text for seamless loop
const marqueeText = announcements.join("     ●     ")

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div
      className="relative overflow-hidden py-2 px-4"
      style={{ background: "linear-gradient(90deg, #EDFEB9, #B2FF73, #EDFEB9)" }}
    >
      <div className="flex items-center">
        {/* Marquee - scrolling horizontally */}
        <div className="flex-1 overflow-hidden">
          <div className="marquee-track">
            <span className="marquee-content text-sm font-semibold text-black whitespace-nowrap">
              {marqueeText}     ●     {marqueeText}
            </span>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={() => setIsVisible(false)}
          className="shrink-0 ml-3 p-1 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Đóng thông báo"
        >
          <X className="h-4 w-4 text-black/60" />
        </button>
      </div>

      <style jsx>{`
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
        .marquee-content {
          display: inline-block;
          padding-right: 60px;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
