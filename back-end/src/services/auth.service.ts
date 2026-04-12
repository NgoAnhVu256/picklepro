// ============================================
// Auth Service
// Quản lý profile người dùng
// (Auth thực tế do Supabase Auth xử lý phía client)
// ============================================

import { ProfileRepository } from '../repositories/profile.repository'
import { updateProfileSchema } from '../validators/auth.validator'
import { ServiceError } from './product.service'
import type { ProfileResponse, UpdateProfileDTO } from '../types/auth.dto'

export class AuthService {
  private profileRepo: ProfileRepository

  constructor() {
    this.profileRepo = new ProfileRepository()
  }

  /**
   * Lấy hoặc tạo profile cho user
   * Gọi sau khi user đăng nhập lần đầu
   */
  async getOrCreateProfile(userId: string, email: string, fullName?: string): Promise<ProfileResponse> {
    let profile = await this.profileRepo.findById(userId)

    if (!profile) {
      profile = await this.profileRepo.create({
        id: userId,
        full_name: fullName ?? null,
        phone: null,
        address: null,
        avatar_url: null,
      })
    }

    return {
      id: profile.id,
      email,
      fullName: profile.full_name,
      phone: profile.phone,
      address: profile.address,
      avatarUrl: profile.avatar_url,
    }
  }

  /**
   * Cập nhật profile
   */
  async updateProfile(userId: string, rawInput: unknown): Promise<ProfileResponse> {
    const input = updateProfileSchema.parse(rawInput) as UpdateProfileDTO

    const existing = await this.profileRepo.findById(userId)
    if (!existing) {
      throw new ServiceError('PROFILE_NOT_FOUND', 'Không tìm thấy profile', 404)
    }

    const updated = await this.profileRepo.update(userId, {
      full_name: input.fullName,
      phone: input.phone,
      address: input.address,
      avatar_url: input.avatarUrl,
    })

    return {
      id: updated.id,
      email: '', // Email lấy từ Supabase Auth, không lưu trong profiles
      fullName: updated.full_name,
      phone: updated.phone,
      address: updated.address,
      avatarUrl: updated.avatar_url,
    }
  }
}
