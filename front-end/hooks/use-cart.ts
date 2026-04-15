// ============================================
// Cart Store (Zustand)
// State management cho giỏ hàng, persist localStorage
// ============================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  brand: string
  price: number
  quantity: number
  image?: string
  slug: string
  color?: string | null
  size?: string | null
}

interface CartState {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string, color?: string | null, size?: string | null) => void
  updateQuantity: (productId: string, color: string | null | undefined, size: string | null | undefined, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void

  // Computed (getters)
  getTotalItems: () => number
  getTotalPrice: () => number
}

// Utility function to identify unique items in the cart
const isSameCartItem = (a: CartItem, b: Partial<CartItem>) => 
  a.productId === b.productId && (a.color || null) === (b.color || null) && (a.size || null) === (b.size || null)

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => isSameCartItem(i, item))

          if (existing) {
            return {
              items: state.items.map((i) =>
                isSameCartItem(i, item)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }

          return {
            items: [...state.items, { ...item, quantity, color: item.color || null, size: item.size || null }],
          }
        })
      },

      removeItem: (productId, color = null, size = null) => {
        set((state) => ({
          items: state.items.filter((i) => !isSameCartItem(i, { productId, color, size })),
        }))
      },

      updateQuantity: (productId, color, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, color, size)
          return
        }
        if (quantity > 99) return // Giới hạn tối đa 99 sản phẩm
        set((state) => ({
          items: state.items.map((i) =>
            isSameCartItem(i, { productId, color, size }) ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'picklepro-cart', // localStorage key
      partialize: (state) => ({ items: state.items }), // Chỉ persist items
    }
  )
)
