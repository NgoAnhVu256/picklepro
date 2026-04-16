"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect } from "react"
import { useSiteSettings } from "@/hooks/use-site-settings"
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react"

// SiTikTok via simple SVG (lucide doesn't have TikTok)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.88a8.2 8.2 0 004.79 1.52V7a4.85 4.85 0 01-1.02-.31z"/>
    </svg>
  )
}

const footerLinks = [
  { label: "LIÊN HỆ", href: "/contact" },
  { label: "CHÍNH SÁCH BẢO HÀNH", href: "/warranty" },
  { label: "CHÍNH SÁCH BẢO MẬT", href: "/privacy" },
  { label: "ĐIỀU KHOẢN SỬ DỤNG", href: "/terms" },
  { label: "SHOP", href: "/products" },
]

export function Footer() {
  const { logoUrl, storeName, load: loadSettings,
    facebookUrl, instagramUrl, youtubeUrl, zaloUrl, tiktokUrl,
    storePhone, storeEmail, storeAddress, copyrightText,
  } = useSiteSettings()

  useEffect(() => { loadSettings() }, [loadSettings])

  const socialLinks = [
    zaloUrl      && { icon: MessageCircle, href: zaloUrl,     label: "Zalo" },
    facebookUrl  && { icon: Facebook,      href: facebookUrl, label: "Facebook" },
    instagramUrl && { icon: Instagram,     href: instagramUrl,label: "Instagram" },
    youtubeUrl   && { icon: Youtube,       href: youtubeUrl,  label: "YouTube" },
    tiktokUrl    && { icon: TikTokIcon,    href: tiktokUrl,   label: "TikTok" },
  ].filter(Boolean) as { icon: any; href: string; label: string }[]

  return (
    <footer className="bg-white border-t border-lime/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Logo + Contact */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image src={logoUrl} alt={`${storeName} Logo`} width={80} height={80} className="rounded-xl" unoptimized />
              <span className="text-2xl font-bold text-black">{storeName}</span>
            </Link>
            {storePhone && (
              <a href={`tel:${storePhone}`} className="text-sm text-gray-600 hover:text-lime-dark transition-colors">
                📞 {storePhone}
              </a>
            )}
            {storeEmail && (
              <a href={`mailto:${storeEmail}`} className="text-sm text-gray-600 hover:text-lime-dark transition-colors">
                ✉️ {storeEmail}
              </a>
            )}
            {storeAddress && (
              <p className="text-sm text-gray-600 max-w-xs">📍 {storeAddress}</p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Links */}
            <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-4 md:gap-6">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-black font-bold hover:text-lime-dark transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center text-lime-dark hover:bg-lime hover:text-lime-dark transition-all"
                    aria-label={social.label}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-lime/10 text-center">
          <p className="text-sm text-black font-light">
            {copyrightText || `© ${new Date().getFullYear()} ${storeName}. Tất cả quyền được bảo lưu.`}
          </p>
        </div>
      </div>
    </footer>
  )
}
