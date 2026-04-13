"use client"

import Image from "next/image"
import Link from "next/link"

export function ZaloWidget() {
  return (
    <Link
        href="https://zalo.me/0373164472"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[96px] right-6 z-40 w-14 h-14 bg-transparent border-none p-0 cursor-pointer group flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
      >
        {/* Glow & Ping Effects like Chatbot */}
        <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping pointer-events-none" />
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl group-hover:bg-blue-500/30 transition-all opacity-0 group-hover:opacity-100 pointer-events-none" />
        
        {/* Core Widget */}
        <div className="relative w-12 h-12 rounded-full shadow-lg shadow-blue-500/30 overflow-hidden flex items-center justify-center bg-white">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
            alt="Chat Zalo"
            fill
            className="object-cover scale-110"
          />
        </div>
    </Link>
  )
}
