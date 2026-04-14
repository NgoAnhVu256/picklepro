"use client"

import Link from "next/link"
import Image from "next/image"

const footerLinks = [
  { label: "LIÊN HỆ", href: "/contact" },
  { label: "CHÍNH SÁCH BẢO HÀNH", href: "/warranty" },
  { label: "CHÍNH SÁCH BẢO MẬT", href: "/privacy" },
  { label: "ĐIỀU KHOẢN SỬ DỤNG", href: "/terms" },
  { label: "PicklePro SHOP", href: "/products" },
]

import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react"

const socialLinks = [
  { icon: MessageCircle, href: "https://zalo.me/0846915120", label: "Zalo OA" },
  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61575468045037", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/picklepro", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com/picklepro", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-lime/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="PicklePro Logo" width={40} height={40} className="rounded-xl" />
            <span className="text-2xl font-bold bg-gradient-to-r from-lime-dark to-lime bg-clip-text text-transparent">
              PicklePro
            </span>
          </Link>

          {/* Links */}
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-4 md:gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-lime-dark transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
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
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-lime/10 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PicklePro. Tất cả quyền được bảo lưu. 
            <span className="text-lime-dark font-medium"> Copyright © by PicklePro. All rights reserved.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
