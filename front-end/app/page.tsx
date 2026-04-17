import { Header } from "@/components/pickleball/header"
import { Hero } from "@/components/pickleball/hero"
import { Categories } from "@/components/pickleball/categories"
import { MarketingBanners } from "@/components/pickleball/marketing-banners"
import { ProductGrid } from "@/components/pickleball/product-grid"
import { BlogSection } from "@/components/pickleball/blog-section"
import { PromoBanner } from "@/components/pickleball/promo-banner"
import { AnnouncementBar } from "@/components/pickleball/announcement-bar"
import { Footer } from "@/components/pickleball/footer"
import { PromoPopup } from "@/components/pickleball/promo-popup"
import { getHomepageData } from "@/lib/server-data"

// ISR: Tự động làm mới trang sau 60 giây
// CDN sẽ cache trang và phục vụ tức thì cho mọi khách hàng
export const revalidate = 60

export default async function Home() {
  const { products, categories, slides, blogs } = await getHomepageData()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9] text-gray-900">
      <AnnouncementBar initialSlides={slides} />
      <Header />
      <main>
        <Hero initialSlides={slides} />
        <Categories initialCategories={categories} />
        <MarketingBanners initialSlides={slides} />
        <ProductGrid initialProducts={products} />
        <BlogSection initialBlogs={blogs} />
        <PromoBanner initialSlides={slides} />
      </main>
      <Footer />
      <PromoPopup />
    </div>
  )
}
