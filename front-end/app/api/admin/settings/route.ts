import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../_helpers'

const SETTINGS_KEY = 'system_settings'

export async function GET() {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  try {
    const { data } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .single()

    return NextResponse.json({ settings: data?.value ?? null })
  } catch {
    // Table may not exist yet — return defaults
    return NextResponse.json({ settings: null })
  }
}

export async function PUT(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  try {
    const { settings } = await req.json()

    const { error } = await supabaseAdmin
      .from('app_settings')
      .upsert({
        key: SETTINGS_KEY,
        value: settings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('[Admin Settings] Error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
