'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams?.toString() || '')
    nextParams.set('mode', 'register')
    router.replace(`/auth/login?${nextParams.toString()}`)
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
    </div>
  )
}
