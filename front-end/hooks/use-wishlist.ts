import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  productId: string
  name: string
  price: number
  image: string
  slug: string
}

interface WishlistState {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  hasItem: (productId: string) => boolean
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          if (state.items.find((i) => i.productId === item.productId)) {
            return state
          }
          return { items: [...state.items, item] }
        })
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },
      hasItem: (productId) => {
        return get().items.some(i => i.productId === productId)
      }
    }),
    {
      name: 'wishlist-storage', // Tên key trong localStorage
    }
  )
)
