-- ============================================
-- Migration 005: Add SEO fields to blogs table
-- ============================================

-- Tạo bảng blogs nếu chưa tồn tại (có thể được tạo ngoài migration)
CREATE TABLE IF NOT EXISTS blogs (
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
);

-- Thêm cột SEO (dùng IF NOT EXISTS để idempotent)
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_title        TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_description  TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_keywords    TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS canonical_url    TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS robots_index     TEXT NOT NULL DEFAULT 'index';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS robots_follow    TEXT NOT NULL DEFAULT 'follow';

-- Open Graph
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS og_title         TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS og_description   TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS og_image         TEXT;

-- Schema.org Article type
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS structured_data  JSONB;

-- Excerpt cho listing page
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt          TEXT;

-- Read time (phút)
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS read_time        INTEGER;

-- Views counter
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS view_count       INTEGER NOT NULL DEFAULT 0;

-- Indexes cho SEO lookup
CREATE INDEX IF NOT EXISTS idx_blogs_slug        ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published   ON blogs(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_blogs_category    ON blogs(category_name);
CREATE INDEX IF NOT EXISTS idx_blogs_created     ON blogs(created_at DESC);

-- RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Public: đọc bài đã published
CREATE POLICY IF NOT EXISTS "blogs_select_published" ON blogs
  FOR SELECT USING (is_published = true);

-- Comment: Admin dùng service_role key (bypass RLS) để CRUD
