import { Header } from "@/components/pickleball/header"
import { Hero } from "@/components/pickleball/hero"
import { Categories } from "@/components/pickleball/categories"
import { ProductGrid } from "@/components/pickleball/product-grid"
import { BlogSection } from "@/components/pickleball/blog-section"
import { PromoBanner } from "@/components/pickleball/promo-banner"
import { AnnouncementBar } from "@/components/pickleball/announcement-bar"
import { Footer } from "@/components/pickleball/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <Categories />
        <ProductGrid />
        <BlogSection />
        <PromoBanner />
      </main>
      <Footer />
    </div>
  )
}
