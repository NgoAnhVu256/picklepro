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

const GRADIENTS = [
  'linear-gradient(90deg, #7C3AED, #EC4899)', // Purple -> Pink
  'linear-gradient(90deg, #F97316, #EAB308)', // Orange -> Yellow
  'linear-gradient(90deg, #10B981, #3B82F6)', // Green -> Blue
  'linear-gradient(90deg, #EC4899, #F97316)', // Pink -> Orange
  'linear-gradient(90deg, #3B82F6, #7C3AED)'  // Blue -> Purple
]

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fade, setFade] = useState(true) // For animation

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

  const items = announcements.length > 0 ? announcements : FALLBACK

  useEffect(() => {
    if (items.length <= 1) return

    const timer = setInterval(() => {
      setFade(false) // Start fade out
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length)
        setFade(true) // Fade back in
      }, 300) // 300ms for text transition
    }, 3000) // Change every 3s

    return () => clearInterval(timer)
  }, [items.length])

  if (!isVisible) return null

  // Mượt mà đổi gradient theo index
  const currentGradient = GRADIENTS[currentIndex % GRADIENTS.length]
  const currentItem = items[currentIndex]
  const isImage = currentItem?.startsWith('http') || currentItem?.startsWith('/')

  return (
    <div
      className={`relative overflow-hidden transition-all duration-700 ease-in-out ${!isImage && 'py-2.5 px-4 shadow-sm'}`}
      style={!isImage ? { background: currentGradient } : { background: '#000' }}
    >
      {isImage ? (
         <img src={currentItem} alt="Announcement Banner" className={`w-full max-h-[80px] object-cover transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`} />
      ) : (
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-3 max-w-[1200px] mx-auto">
            {/* Icon */}
            <Megaphone className="h-4 w-4 text-white shrink-0 hidden sm:block" />

            {/* Central Message */}
            <div className="flex-1 flex justify-center overflow-hidden">
              <span 
                className={`text-sm font-semibold text-white whitespace-nowrap text-center transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
              >
                {currentItem}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/90 hover:text-white transition-colors z-10 ${isImage ? 'bg-black/30 hover:bg-black/50' : 'hover:bg-white/20'}`}
        aria-label="Đóng thông báo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
