/**
 * Zustand store for site-wide settings loaded from backend.
 * Used by Header, Footer, and any component that needs logo, name, social links, contact.
 */
import { create } from 'zustand'

interface SiteSettingsStore {
  // Branding
  logoUrl: string
  storeName: string
  primaryColor: string
  copyrightText: string
  // Contact info
  storePhone: string
  storeEmail: string
  storeAddress: string
  // Social links
  facebookUrl: string
  instagramUrl: string
  youtubeUrl: string
  zaloUrl: string
  tiktokUrl: string
  // State
  loaded: boolean
  load: () => Promise<void>
}

export const useSiteSettings = create<SiteSettingsStore>((set, get) => ({
  logoUrl: '/logo.png',
  storeName: 'PicklePro',
  primaryColor: '#84cc16',
  copyrightText: '',
  storePhone: '',
  storeEmail: '',
  storeAddress: '',
  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  zaloUrl: '',
  tiktokUrl: '',
  loaded: false,

  load: async () => {
    if (get().loaded) return
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const s = data.settings
        if (s) {
          set({
            logoUrl:      s.logo_url       || '/logo.png',
            storeName:    s.store_name     || 'PicklePro',
            primaryColor: s.primary_color  || '#84cc16',
            copyrightText: s.copyright_text || '',
            storePhone:   s.store_phone    || '',
            storeEmail:   s.store_email    || '',
            storeAddress: s.store_address  || '',
            facebookUrl:  s.facebook_url   || '',
            instagramUrl: s.instagram_url  || '',
            youtubeUrl:   s.youtube_url    || '',
            zaloUrl:      s.zalo_url       || '',
            tiktokUrl:    s.tiktok_url     || '',
            loaded: true,
          })
          return
        }
      }
    } catch {}
    set({ loaded: true })
  },
}))

