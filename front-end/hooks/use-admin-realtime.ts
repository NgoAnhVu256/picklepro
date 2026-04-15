'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ADMIN_REALTIME_CHANNEL,
  ADMIN_REALTIME_EVENT,
  type AdminRealtimePayload,
  type AdminRealtimeScope,
} from '@/lib/realtime'

interface UseAdminRealtimeOptions {
  scopes: AdminRealtimeScope[]
  onChange: (payload: AdminRealtimePayload) => void
}

export function useAdminRealtime({ scopes, onChange }: UseAdminRealtimeOptions) {
  const callbackRef = useRef(onChange)
  callbackRef.current = onChange

  useEffect(() => {
    const supabase = createClient()
    const scopeSet = new Set(scopes)

    const channel = supabase
      .channel(ADMIN_REALTIME_CHANNEL)
      .on('broadcast', { event: ADMIN_REALTIME_EVENT }, ({ payload }) => {
        const data = payload as AdminRealtimePayload | undefined
        if (!data || !data.scope || !scopeSet.has(data.scope)) return
        callbackRef.current(data)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [scopes])
}
