'use client'

import { useState, useEffect } from 'react'
import { X, Megaphone } from 'lucide-react'

interface Announcement {
  id: string
  text: string
  link: string | null
  is_active: boolean
}

const FALLBACK = [
  'FLASH SALE — Giảm đến 50% tất cả vợt JOOLA! 🏓',
  'Miễn phí vận chuyển cho đơn hàng từ 500K 🚚',
  'PicklePro — Cửa hàng Pickleball uy tín #1 Việt Nam 🏆',
  'Tặng Grip cao cấp khi mua vợt trên 3 triệu 🎁',
  'Đăng ký VIP — Giảm thêm 10% mọi đơn hàng ✨',
]

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [announcements, setAnnouncements] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/admin/announcements')
      .then(r => r.json())
      .then(data => {
        const active = (data.announcements ?? [])
          .filter((a: Announcement) => a.is_active)
          .map((a: Announcement) => a.text)
        setAnnouncements(active.length > 0 ? active : FALLBACK)
      })
      .catch(() => setAnnouncements(FALLBACK))
  }, [])

  if (!isVisible) return null

  const items = announcements.length > 0 ? announcements : FALLBACK
  const marqueeText = items.join('     ●     ')

  return (
    <div
      className="relative overflow-hidden py-2.5 px-4 shadow-sm"
      style={{
        background: 'linear-gradient(90deg, #7C3AED, #EC4899, #F97316, #EAB308, #10B981, #3B82F6, #7C3AED)',
        backgroundSize: '400% 100%',
        animation: 'gradientShift 8s ease infinite',
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll 45s linear infinite;
        }
        .marquee-content {
          display: inline-block;
          padding-right: 80px;
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex items-center gap-3">
        {/* Icon */}
        <Megaphone className="h-4 w-4 text-white/90 shrink-0 hidden sm:block" />

        {/* Scrolling text */}
        <div className="flex-1 overflow-hidden">
          <div className="marquee-track">
            <span className="marquee-content text-sm font-semibold text-white whitespace-nowrap drop-shadow-sm">
              {marqueeText}
            </span>
            <span className="marquee-content text-sm font-semibold text-white whitespace-nowrap drop-shadow-sm">
              {marqueeText}
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="shrink-0 ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Đóng thông báo"
        >
          <X className="h-4 w-4 text-white/80" />
        </button>
      </div>
    </div>
  )
}
