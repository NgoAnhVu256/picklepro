/**
 * Zustand store for site-wide settings loaded from backend.
 * Used by Header, Footer, and any component that needs the logo URL or store name.
 */
import { create } from 'zustand'

interface SiteSettingsStore {
  logoUrl: string
  storeName: string
  primaryColor: string
  loaded: boolean
  load: () => Promise<void>
}

export const useSiteSettings = create<SiteSettingsStore>((set, get) => ({
  logoUrl: '/logo.png',
  storeName: 'PicklePro',
  primaryColor: '#84cc16',
  loaded: false,

  load: async () => {
    // Only fetch once per session
    if (get().loaded) return
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const s = data.settings
        if (s) {
          set({
            logoUrl: s.logo_url || '/logo.png',
            storeName: s.store_name || 'PicklePro',
            primaryColor: s.primary_color || '#84cc16',
            loaded: true,
          })
          return
        }
      }
    } catch {}
    set({ loaded: true }) // fallback - don't retry
  },
}))
