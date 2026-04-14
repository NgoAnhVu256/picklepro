import { Header } from "@/components/pickleball/header"
import { Categories } from "@/components/pickleball/categories"
import { ProductGrid } from "@/components/pickleball/product-grid"
import { HomeContent } from "@/components/pickleball/home-content"
import { PromoBanner } from "@/components/pickleball/promo-banner"
import { AnnouncementBar } from "@/components/pickleball/announcement-bar"
import { Footer } from "@/components/pickleball/footer"
import { BlogSection } from "@/components/pickleball/blog-section"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AnnouncementBar />
      <Header />
      <main>
        {/* Categories quick nav */}
        <Categories />
        {/* Main 3-column content: Hero slider + Blog layout like PikLab */}
        <HomeContent />
        {/* Products section */}
        <ProductGrid />
        {/* Promo banner */}
        <PromoBanner />
        {/* Dark blog section ngay trên footer */}
        <BlogSection />
      </main>
      <Footer />
    </div>
  )
}
