import { supabaseAdmin } from '@picklepro/back-end'
import {
  ADMIN_REALTIME_CHANNEL,
  ADMIN_REALTIME_EVENT,
  type AdminRealtimePayload,
} from '@/lib/realtime'

export async function notifyAdminRealtime(payload: Omit<AdminRealtimePayload, 'at'>) {
  const channel = supabaseAdmin.channel(ADMIN_REALTIME_CHANNEL)

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Realtime subscribe timeout'))
      }, 3000)

      channel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout)
          resolve()
        }
      })
    })

    await channel.send({
      type: 'broadcast',
      event: ADMIN_REALTIME_EVENT,
      payload: {
        ...payload,
        at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.warn('[Admin Realtime] Notify failed:', (error as Error).message)
  } finally {
    supabaseAdmin.removeChannel(channel)
  }
}
