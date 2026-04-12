'use client'

import { ChatWidget } from '@/components/pickleball/chat-widget'
import { usePathname } from 'next/navigation'

export function ChatWidgetWrapper() {
  const pathname = usePathname()

  // Ẩn chatbot ở trang admin
  if (pathname?.startsWith('/admin')) return null

  return <ChatWidget />
}
