-- ============================================================
-- Migration 003: Tạo bảng app_settings + seed dữ liệu mặc định
-- Chạy trong Supabase SQL Editor
-- ============================================================

-- Tạo bảng nếu chưa có
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed dữ liệu mặc định cho PicklePro
-- (dùng INSERT ... ON CONFLICT để không ghi đè nếu đã có)
INSERT INTO app_settings (key, value)
VALUES (
  'system_settings',
  '{
    "currency": "VND - Việt Nam Đồng",
    "timezone": "Asia/Ho_Chi_Minh (UTC+7)",
    "language": "Tiếng Việt",
    "date_format": "dd/mm/yyyy",
    "vat_rate": 8,
    "import_tax_rate": 0,
    "store_name": "PicklePro",
    "store_phone": "0373 164 472",
    "store_email": "support@picklepro.vn",
    "store_address": "Phú Yên, Việt Nam",
    "store_website": "https://picklepro.vn",
    "primary_color": "#84cc16",
    "logo_url": "/logo.png",
    "announcement_enabled": true,
    "maintenance_mode": false,
    "facebook_url": "https://www.facebook.com/profile.php?id=61575468045037",
    "instagram_url": "https://instagram.com/picklepro",
    "youtube_url": "https://youtube.com/picklepro",
    "zalo_link": "https://zalo.me/0373164472",
    "tiktok_url": "",
    "seo_title": "PicklePro - Cửa hàng Vợt Pickleball cao cấp số 1 Việt Nam",
    "seo_description": "Cửa hàng vợt Pickleball cao cấp số 1 Việt Nam. Đa dạng thương hiệu JOOLA, Selkirk, Paddletek, HEAD. Bảo hành chính hãng, giao hàng toàn quốc.",
    "seo_keywords": "pickleball, vợt pickleball, picklepro, JOOLA, Selkirk, HEAD",
    "og_image_url": "/og-image.png"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Bật RLS bảo vệ (chỉ service_role mới đọc/ghi được)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: chỉ service_role (backend) mới được đọc/ghi
CREATE POLICY "service_role_only" ON app_settings
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
