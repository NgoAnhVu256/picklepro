/**
 * Script chạy migration 005: thêm cột SEO vào bảng blogs
 * Chạy: npx tsx src/scripts/migrate-blog-seo.ts
 */

import * as dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function runMigration() {
  console.log('🔄 Running migration 005: Add SEO fields to blogs table...\n')

  const statements = [
    // Tạo bảng blogs nếu chưa có
    `CREATE TABLE IF NOT EXISTS blogs (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title         TEXT NOT NULL,
      slug          TEXT NOT NULL UNIQUE,
      category_name TEXT NOT NULL DEFAULT 'Tin tức',
      thumbnail     TEXT,
      content       TEXT,
      author        TEXT NOT NULL DEFAULT 'Admin',
      is_published  BOOLEAN NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    // SEO columns
    `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_title        TEXT`,
    `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_description  TEXT`,
    `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_keywords    TEXT`,
    `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS canonical_url    TEXT`,
    `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS robots_index     TEXT NOT NULL DEFAULT 'index'`,
    `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS robots_follow    TEXT NOT NULL DEFAULT 'follow'`,
    // Open Graph
    `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS og_title         TEXT`,
    `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS og_description   TEXT`,
    `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS og_image         TEXT`,
    // Content helpers
    `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt          TEXT`,
    `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS read_time        INTEGER`,
    `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS view_count       INTEGER NOT NULL DEFAULT 0`,
    // Indexes
    `CREATE INDEX IF NOT EXISTS idx_blogs_slug      ON blogs(slug)`,
    `CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(is_published) WHERE is_published = true`,
    `CREATE INDEX IF NOT EXISTS idx_blogs_category  ON blogs(category_name)`,
    `CREATE INDEX IF NOT EXISTS idx_blogs_created   ON blogs(created_at DESC)`,
    // RLS
    `ALTER TABLE blogs ENABLE ROW LEVEL SECURITY`,
  ]

  let success = 0
  let failed = 0

  for (const sql of statements) {
    const short = sql.trim().slice(0, 60).replace(/\s+/g, ' ')
    try {
      const { error } = await supabase.rpc('exec_sql' as any, { sql_query: sql })
      if (error) {
        // Fallback: try direct query
        const { error: e2 } = await (supabase as any).from('_').select('*').limit(0)
        // If we get here the RPC doesn't exist, use raw query approach
        throw error
      }
      console.log(`  ✅ ${short}...`)
      success++
    } catch {
      // Some Supabase tiers don't allow exec_sql RPC
      // Show manual instruction
      console.log(`  ⚠️  Manual: ${short}...`)
      failed++
    }
  }

  console.log(`\n📊 Result: ${success} ok, ${failed} need manual run`)

  if (failed > 0) {
    console.log('\n⚡ Copy và chạy SQL này trong Supabase SQL Editor:\n')
    console.log('------ CUT HERE ------')
    console.log(statements.join(';\n') + ';')
    console.log('------ END ------')
  }
}

runMigration().catch(console.error)
