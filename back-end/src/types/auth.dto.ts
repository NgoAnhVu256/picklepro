// ============================================
// Auth DTOs
// ============================================

// --- Request DTOs ---

export interface LoginDTO {
  email: string
  password: string
}

export interface RegisterDTO {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface UpdateProfileDTO {
  fullName?: string
  phone?: string
  address?: string
  avatarUrl?: string
}

// --- Response DTOs ---

export interface AuthResponse {
  user: {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
  }
  session: {
    accessToken: string
    refreshToken: string
    expiresAt: number
  }
}

export interface ProfileResponse {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  address: string | null
  avatarUrl: string | null
}
