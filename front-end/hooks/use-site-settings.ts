/**
 * Zustand store for site-wide settings loaded from backend.
 * Used by Header, Footer, and any component that needs logo, name, social links, contact.
 */
import { create } from 'zustand'

export interface SiteSettingsStore {
  // Branding
  logoUrl: string
  faviconUrl: string
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
  zaloId: string
  tiktokUrl: string
  twitterUrl: string
  // Maps 
  googleMapsLink: string
  googleMapsEmbed: string
  // Footer Fast Links
  footerAboutUrl: string
  footerTermsUrl: string
  footerPolicyUrl: string
  footerContactUrl: string
  // SEO 
  seoDescription: string
  
  // State
  loaded: boolean
  load: () => Promise<void>
}

export const useSiteSettings = create<SiteSettingsStore>((set, get) => ({
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  storeName: 'PicklePro',
  primaryColor: '#2dd4bf',
  copyrightText: '',
  storePhone: '',
  storeEmail: '',
  storeAddress: '',
  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  zaloId: '',
  tiktokUrl: '',
  twitterUrl: '',
  googleMapsLink: '',
  googleMapsEmbed: '',
  footerAboutUrl: '/gioi-thieu',
  footerTermsUrl: '/terms',
  footerPolicyUrl: '/privacy',
  footerContactUrl: '/contact',
  seoDescription: 'Cửa hàng chuyên cung cấp thiết bị và phụ kiện Pickleball chính hãng tốt nhất.',
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
            faviconUrl:   s.favicon_url    || '/favicon.ico',
            storeName:    s.store_name     || 'PicklePro',
            primaryColor: s.primary_color  || '#2dd4bf',
            copyrightText: s.copyright_text || '',
            storePhone:   s.store_phone    || '',
            storeEmail:   s.store_email    || '',
            storeAddress: s.store_address  || '',
            facebookUrl:  s.facebook_url   || '',
            instagramUrl: s.instagram_url  || '',
            youtubeUrl:   s.youtube_url    || '',
            zaloId:       s.zalo_id        || s.zalo_url || '',
            tiktokUrl:    s.tiktok_url     || '',
            twitterUrl:   s.twitter_url    || '',
            googleMapsLink:  s.google_maps_link  || '',
            googleMapsEmbed: s.google_maps_embed || '',
            footerAboutUrl:  s.footer_about_url  || '/gioi-thieu',
            footerTermsUrl:  s.footer_terms_url  || '/terms',
            footerPolicyUrl: s.footer_policy_url || '/privacy',
            footerContactUrl: s.footer_contact_url || '/contact',
            seoDescription:  s.seo_description || 'Cửa hàng chuyên cung cấp thiết bị và phụ kiện Pickleball chính hãng tốt nhất.',
            loaded: true,
          })
          return
        }
      }
    } catch {}
    set({ loaded: true })
  },
}))
