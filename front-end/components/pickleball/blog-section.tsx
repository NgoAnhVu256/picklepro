"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const articles = [
  {
    id: 1,
    title: "Top 10 kỹ thuật Dink cơ bản mà người chơi Pickleball cần biết",
    excerpt: "Hướng dẫn chi tiết các kỹ thuật dink từ cơ bản đến nâng cao...",
    author: "PicklePro",
    date: "28 tháng 3, 2026",
    image: "🏓",
    category: "Kỹ thuật"
  },
  {
    id: 2,
    title: "So sánh chi tiết: JOOLA vs Selkirk - Vợt nào phù hợp với bạn?",
    excerpt: "Đánh giá toàn diện 2 thương hiệu vợt Pickleball hàng đầu...",
    author: "PicklePro",
    date: "25 tháng 3, 2026",
    image: "⚖️",
    category: "Review"
  },
  {
    id: 3,
    title: "Giải Pickleball Việt Nam 2026 - Điểm nổi bật và kết quả",
    excerpt: "Tổng hợp những khoảnh khắc đáng nhớ từ giải đấu quốc gia...",
    author: "PicklePro",
    date: "20 tháng 3, 2026",
    image: "🏆",
    category: "Tin tức"
  },
  {
    id: 4,
    title: "Cách chọn grip phù hợp: Overgrip vs Replacement grip",
    excerpt: "Hướng dẫn lựa chọn loại grip phù hợp với lối chơi của bạn...",
    author: "PicklePro",
    date: "18 tháng 3, 2026",
    image: "🧤",
    category: "Hướng dẫn"
  },
]

export function BlogSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length)
  }

  return (
    <section className="py-10 sm:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3">
            Dòng Chảy <span className="text-lime-dark">Sáng Tạo</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Cập nhật cảm hứng, xu hướng và chia sẻ từ cộng đồng Pickleball
          </p>
        </div>

        {/* Blog Cards with Navigation */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-lime/20 flex items-center justify-center hover:bg-lime/10 transition-colors hidden md:flex"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-lime/20 flex items-center justify-center hover:bg-lime/10 transition-colors hidden md:flex"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-4 bg-gradient-to-br from-lime-light/30 to-white border border-lime/10">
                  <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-6xl group-hover:scale-110 transition-transform duration-300">
                    {article.image}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Category Badge */}
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-lime/90 text-lime-dark text-[10px] sm:text-xs font-bold rounded-full">
                    {article.category}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-xs sm:text-base font-bold text-foreground line-clamp-2 group-hover:text-lime-dark transition-colors">
                    {article.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-muted-foreground">
                    <span className="hidden sm:inline">{article.author}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-0.5 sm:gap-1">
                      <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {article.date}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button 
            variant="outline" 
            className="border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-semibold rounded-full px-8"
          >
            Xem tất cả bài viết
          </Button>
        </div>
      </div>
    </section>
  )
}
