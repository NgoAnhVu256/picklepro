'use client'

import { ChatWidget } from '@/components/pickleball/chat-widget'
import { usePathname } from 'next/navigation'

export function ChatWidgetWrapper() {
  const pathname = usePathname()

  // Ẩn chatbot ở trang admin và trang đăng nhập/đăng ký
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth')) return null

  return <ChatWidget />
}
