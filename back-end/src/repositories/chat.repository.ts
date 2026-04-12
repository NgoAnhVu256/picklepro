// ============================================
// Chat History Repository
// ============================================

import { supabaseAdmin } from '../config/supabase'
import type { ChatMessage, ChatMessageInsert } from '../types/database'

export class ChatRepository {
  async findByUserId(userId: string, limit = 20): Promise<ChatMessage[]> {
    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data ?? []
  }

  async create(message: ChatMessageInsert): Promise<ChatMessage> {
    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .insert(message)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async clearByUserId(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('chat_history')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  }
}
