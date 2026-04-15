export const ADMIN_REALTIME_CHANNEL = 'picklepro-admin-sync'
export const ADMIN_REALTIME_EVENT = 'invalidate'

export type AdminRealtimeScope =
  | 'products'
  | 'categories'
  | 'blogs'
  | 'slides'
  | 'announcements'
  | 'promotions'

export interface AdminRealtimePayload {
  scope: AdminRealtimeScope
  action: 'created' | 'updated' | 'deleted' | 'reordered' | 'imported'
  at: string
}
