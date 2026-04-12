// ============================================
// Database Types
// Định nghĩa kiểu dữ liệu cho toàn bộ bảng Supabase
// ============================================

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      products: {
        Row: Product
        Insert: ProductInsert
        Update: ProductUpdate
      }
      product_images: {
        Row: ProductImage
        Insert: ProductImageInsert
        Update: ProductImageUpdate
      }
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      orders: {
        Row: Order
        Insert: OrderInsert
        Update: OrderUpdate
      }
      order_items: {
        Row: OrderItem
        Insert: OrderItemInsert
        Update: OrderItemUpdate
      }
      reviews: {
        Row: Review
        Insert: ReviewInsert
        Update: ReviewUpdate
      }
      chat_history: {
        Row: ChatMessage
        Insert: ChatMessageInsert
        Update: ChatMessageUpdate
      }
    }
  }
}

// --- Categories ---
export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  sort_order: number
  created_at: string
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at'>
export type CategoryUpdate = Partial<CategoryInsert>

// --- Products ---
export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  brand: string
  price: number
  original_price: number | null
  category_id: string
  rating: number
  review_count: number
  stock: number
  tags: string[]
  specs: Record<string, string> | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count'>
export type ProductUpdate = Partial<ProductInsert>

// --- Product Images ---
export interface ProductImage {
  id: string
  product_id: string
  url: string
  sort_order: number
  is_primary: boolean
}

export type ProductImageInsert = Omit<ProductImage, 'id'>
export type ProductImageUpdate = Partial<ProductImageInsert>

// --- Profiles ---
export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  address: string | null
  avatar_url: string | null
  updated_at: string
}

export type ProfileInsert = Omit<Profile, 'updated_at'>
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'updated_at'>>

// --- Orders ---
export type OrderStatus = 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled'

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total_amount: number
  shipping_name: string
  shipping_address: string
  shipping_phone: string
  payment_method: string
  stripe_session_id: string | null
  created_at: string
  updated_at: string
}

export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at' | 'status'> & {
  status?: OrderStatus
}
export type OrderUpdate = Partial<Omit<Order, 'id' | 'user_id' | 'created_at'>>

// --- Order Items ---
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
}

export type OrderItemInsert = Omit<OrderItem, 'id'>
export type OrderItemUpdate = Partial<OrderItemInsert>

// --- Reviews ---
export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
}

export type ReviewInsert = Omit<Review, 'id' | 'created_at'>
export type ReviewUpdate = Partial<Omit<Review, 'id' | 'product_id' | 'user_id' | 'created_at'>>

// --- Chat History ---
export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  user_id: string
  role: ChatRole
  content: string
  created_at: string
}

export type ChatMessageInsert = Omit<ChatMessage, 'id' | 'created_at'>
export type ChatMessageUpdate = Partial<ChatMessageInsert>

// --- Relations (Joined queries) ---
export interface ProductWithCategory extends Product {
  categories: Pick<Category, 'name' | 'slug'> | null
}

export interface ProductWithImages extends Product {
  product_images: ProductImage[]
}

export interface ProductFull extends Product {
  categories: Pick<Category, 'name' | 'slug'> | null
  product_images: ProductImage[]
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { products: Pick<Product, 'name' | 'slug' | 'brand'> })[]
}
