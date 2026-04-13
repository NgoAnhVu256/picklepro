"use client"

import { Calendar, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const blogCategories = [
  {
    name: "Kỹ thuật",
    articles: [
      {
        id: 1,
        title: "Top 10 kỹ thuật Dink cơ bản mà người chơi Pickleball cần biết",
        thumbnail: "🏓",
        date: "28/03/2026",
      },
      {
        id: 2,
        title: "Cách cầm vợt đúng kỹ thuật cho người mới bắt đầu",
        thumbnail: "✋",
        date: "25/03/2026",
      },
      {
        id: 3,
        title: "Bí quyết đánh serve mạnh và chính xác trong Pickleball",
        thumbnail: "💪",
        date: "20/03/2026",
      },
    ],
  },
  {
    name: "Review sản phẩm",
    articles: [
      {
        id: 4,
        title: "So sánh chi tiết: JOOLA vs Selkirk — Vợt nào phù hợp?",
        thumbnail: "⚖️",
        date: "26/03/2026",
      },
      {
        id: 5,
        title: "Review vợt JOOLA Ben Johns Hyperion CAS 16mm",
        thumbnail: "🔥",
        date: "22/03/2026",
      },
      {
        id: 6,
        title: "Top 5 giày chơi Pickleball tốt nhất 2026",
        thumbnail: "👟",
        date: "18/03/2026",
      },
    ],
  },
  {
    name: "Tin tức",
    articles: [
      {
        id: 7,
        title: "Giải Pickleball Việt Nam 2026 — Kết quả và điểm nổi bật",
        thumbnail: "🏆",
        date: "24/03/2026",
      },
      {
        id: 8,
        title: "Pickleball chính thức vào SEA Games 2027",
        thumbnail: "🎉",
        date: "15/03/2026",
      },
      {
        id: 9,
        title: "Cộng đồng Pickleball Việt Nam phát triển mạnh mẽ",
        thumbnail: "🌏",
        date: "10/03/2026",
      },
    ],
  },
  {
    name: "Hướng dẫn",
    articles: [
      {
        id: 10,
        title: "Cách chọn grip phù hợp: Overgrip vs Replacement grip",
        thumbnail: "🧤",
        date: "22/03/2026",
      },
      {
        id: 11,
        title: "Hướng dẫn bảo quản vợt Pickleball đúng cách",
        thumbnail: "🛡️",
        date: "16/03/2026",
      },
      {
        id: 12,
        title: "Chọn bóng Pickleball: Indoor vs Outdoor khác gì?",
        thumbnail: "⚾",
        date: "12/03/2026",
      },
    ],
  },
]

export function BlogSection() {
  return (
    <section
      className="py-12 sm:py-20"
      style={{ background: "linear-gradient(180deg, #04002A, #362012, #462915)" }}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            Bài Viết <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #B2FF73, #EDFEB9)" }}>Nổi Bật</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
            Cập nhật kiến thức, xu hướng và chia sẻ từ cộng đồng Pickleball
          </p>
        </div>

        {/* 4-Column Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {blogCategories.map((category) => (
            <div key={category.name}>
              {/* Category Header */}
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/10 italic">
                {category.name}
              </h3>

              {/* Articles */}
              <div className="space-y-4">
                {category.articles.map((article) => (
                  <Link
                    key={article.id}
                    href="#"
                    className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 shrink-0 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-md shadow-black/20 group-hover:shadow-lg group-hover:shadow-purple-500/10 transition-shadow">
                      {article.thumbnail}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-white transition-colors leading-snug">
                        {article.title}
                      </h4>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {article.date}
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Xem thêm */}
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors pt-1 pl-2"
                >
                  Xem thêm <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
