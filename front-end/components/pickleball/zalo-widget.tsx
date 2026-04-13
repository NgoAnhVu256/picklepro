"use client"

import Image from "next/image"
import Link from "next/link"

export function ZaloWidget() {
  return (
    <div className="fixed bottom-24 right-5 z-50 animate-bounce">
      <Link
        href="https://zalo.me/0373164472" // Replace with actual Zalo link
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-12 h-12 rounded-full overflow-hidden shadow-lg shadow-blue-500/30 hover:scale-110 transition-transform"
      >
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
          alt="Chat Zalo"
          fill
          className="object-cover"
        />
        {/* Ping effect */}
        <span className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping" />
      </Link>
    </div>
  )
}
