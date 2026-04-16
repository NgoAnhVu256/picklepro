"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect } from "react"
import { useSiteSettings } from "@/hooks/use-site-settings"
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, ArrowRight, ShieldCheck, Truck, Clock } from "lucide-react"

// Social Icons Missing In Lucide
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.88a8.2 8.2 0 004.79 1.52V7a4.85 4.85 0 01-1.02-.31z"/>
    </svg>
  )
}

function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
  )
}

export function Footer() {
  const settings = useSiteSettings()

  useEffect(() => { settings.load() }, [])

  const socialLinks = [
    settings.facebookUrl && { icon: Facebook, href: settings.facebookUrl, label: "Facebook", bg: "hover:bg-blue-600" },
    settings.instagramUrl && { icon: Instagram, href: settings.instagramUrl, label: "Instagram", bg: "hover:bg-pink-600" },
    settings.youtubeUrl && { icon: Youtube, href: settings.youtubeUrl, label: "YouTube", bg: "hover:bg-red-600" },
    settings.tiktokUrl && { icon: TikTokIcon, href: settings.tiktokUrl, label: "TikTok", bg: "hover:bg-black" },
    settings.twitterUrl && { icon: XTwitterIcon, href: settings.twitterUrl, label: "X/Twitter", bg: "hover:bg-gray-800" },
    settings.zaloId && { icon: ZaloIcon, href: `https://zalo.me/${settings.zaloId}`, label: "Zalo", bg: "hover:bg-blue-500" },
  ].filter(Boolean) as { icon: any; href: string; label: string; bg: string }[]

  return (
    <footer className="bg-[#0f172a] text-gray-300 pt-16 border-t-[8px] border-primary">
      {/* Container */}
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Top Section: Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wide">HÀNG CHÍNH HÃNG 100%</h4>
              <p className="text-xs text-gray-400 mt-1">Cam kết xuất xứ rõ ràng</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-primary">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wide">GIAO HÀNG SIÊU TỐC</h4>
              <p className="text-xs text-gray-400 mt-1">Hỗ trợ ship toàn quốc</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-primary">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wide">HỖ TRỢ 24/7</h4>
              <p className="text-xs text-gray-400 mt-1">Sẵn sàng tư vấn nhiệt tình</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-12">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-white p-1 rounded-xl">
                <Image src={settings.logoUrl} alt={settings.storeName} width={48} height={48} className="rounded-lg object-cover" unoptimized />
              </div>
              <span className="text-2xl font-black text-white">{settings.storeName}</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              {settings.seoDescription}
            </p>
            
            <div className="space-y-3 pt-2">
              {settings.storeAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{settings.storeAddress}</span>
                </div>
              )}
              {settings.storePhone && (
                <a href={`tel:${settings.storePhone}`} className="flex items-center gap-3 hover:text-primary transition-colors group">
                  <Phone className="w-5 h-5 text-primary shrink-0 group-hover:animate-pulse" />
                  <span className="text-sm font-medium">{settings.storePhone}</span>
                </a>
              )}
              {settings.storeEmail && (
                <a href={`mailto:${settings.storeEmail}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">{settings.storeEmail}</span>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Customer Support */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider mb-6 pb-2 border-b-2 border-primary inline-block">HỖ TRỢ KHÁCH HÀNG</h3>
            <ul className="space-y-4">
              {[
                { label: "Chính sách bảo hành", href: settings.footerTermsUrl }, // Mismatch map fallback but generic terms
                { label: "Chính sách bảo mật", href: settings.footerPolicyUrl },
                { label: "Điều khoản dịch vụ", href: settings.footerTermsUrl },
                { label: "Tra cứu đơn hàng", href: "/account/orders" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-sm hover:text-primary flex items-center gap-2 transition-colors group">
                    <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider mb-6 pb-2 border-b-2 border-primary inline-block">LIÊN KẾT NHANH</h3>
            <ul className="space-y-4">
              {[
                { label: "Về chúng tôi", href: settings.footerAboutUrl },
                { label: "Cửa hàng sản phẩm", href: "/products" },
                { label: "Tin tức - Blog", href: "/blogs" },
                { label: "Liên hệ tư vấn", href: settings.footerContactUrl }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-sm hover:text-primary flex items-center gap-2 transition-colors group">
                    <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Social & Maps */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider mb-6 pb-2 border-b-2 border-primary inline-block">KẾT NỐI VỚI CHÚNG TÔI</h3>
            
            {/* Social Icons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300 ${social.bg}`}
                  aria-label={social.label}
                  rel="noopener noreferrer"
                  target="_blank"
                  title={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Google Map Mini Embed */}
            {settings.googleMapsEmbed && (
              <div className="rounded-xl overflow-hidden shadow-lg border border-gray-800 hidden lg:block">
                <iframe
                  src={settings.googleMapsEmbed.includes('src=') 
                        ? settings.googleMapsEmbed.split('src="')[1]?.split('"')[0] || settings.googleMapsEmbed
                        : settings.googleMapsEmbed}
                  width="100%"
                  height="120"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#0a0f1d] py-6 border-t border-gray-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            {settings.copyrightText || `© ${new Date().getFullYear()} ${settings.storeName}. All rights reserved.`}
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 uppercase">
            <span>Thiết kế & Phát triển độc quyền</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
