"use client"

import { usePathname } from "next/navigation"
import { ZaloWidget } from "./zalo-widget"

export function ZaloWidgetWrapper() {
  const pathname = usePathname()
  
  if (pathname?.startsWith('/admin')) {
    return null
  }
  
  return <ZaloWidget />
}
