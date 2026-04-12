// ============================================
// Chat DTOs
// ============================================

// --- Request DTOs ---

export interface ChatRequestDTO {
  message: string
  conversationId?: string
}

// --- Response DTOs ---

export interface ChatResponseDTO {
  reply: string
  suggestedProducts?: {
    id: string
    name: string
    brand: string
    price: number
    slug: string
  }[]
}

// --- Internal ---

export interface RAGContext {
  products: {
    name: string
    brand: string
    price: number
    description: string | null
    specs: Record<string, string> | null
    rating: number
  }[]
  query: string
}
