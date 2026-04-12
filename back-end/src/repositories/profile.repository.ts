// ============================================
// Profile Repository
// ============================================

import { supabaseAdmin } from '../config/supabase'
import type { Profile, ProfileInsert, ProfileUpdate } from '../types/database'

export class ProfileRepository {
  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return null
    if (error) throw error
    return data
  }

  async create(profile: ProfileInsert): Promise<Profile> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert(profile)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
