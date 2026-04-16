-- ============================================================
-- Migration 004: Category Attributes
-- Thêm cột attributes vào bảng categories
-- Chạy trong Supabase SQL Editor
-- ============================================================

-- Thêm cột attributes nếu chưa có
ALTER TABLE categories ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '[]'::jsonb;

-- Cập nhật attributes theo từng nhóm danh mục

-- Vợt pickleball: Màu sắc + Phiên bản (14mm / 16mm)
UPDATE categories SET attributes = '[
  {"key":"colors","label":"Màu sắc","type":"multi-text","placeholder":"VD: Đỏ, Xanh, Đen"},
  {"key":"version","label":"Phiên bản","type":"select","options":["14mm","16mm"],"placeholder":"Chọn phiên bản"}
]'::jsonb
WHERE slug IN ('vot-pickleball','paddle','vot');

-- Quần áo: Màu sắc + Size
UPDATE categories SET attributes = '[
  {"key":"colors","label":"Màu sắc","type":"multi-text","placeholder":"VD: Trắng, Đen, Xanh"},
  {"key":"sizes","label":"Size","type":"multi-text","placeholder":"VD: S, M, L, XL, XXL"}
]'::jsonb
WHERE slug IN ('quan-ao','ao','quan','quan-ao-the-thao','clothing','apparel');

-- Giày: Màu sắc + Size
UPDATE categories SET attributes = '[
  {"key":"colors","label":"Màu sắc","type":"multi-text","placeholder":"VD: Trắng, Đen, Xám"},
  {"key":"sizes","label":"Size giày","type":"multi-text","placeholder":"VD: 38, 39, 40, 41, 42, 43"}
]'::jsonb
WHERE slug IN ('giay-the-thao','giay-pickleball','giay','shoes');

-- Balo / Túi: Màu sắc
UPDATE categories SET attributes = '[
  {"key":"colors","label":"Màu sắc","type":"multi-text","placeholder":"VD: Đen, Xanh Navy, Xám"}
]'::jsonb
WHERE slug IN ('tui-balo','balo','tui','balo-pickleball','bag','backpack');

-- Phụ kiện: không cần attributes riêng
UPDATE categories SET attributes = '[]'::jsonb
WHERE slug IN ('phu-kien','grip','phu-kien-grip','accessories') AND (attributes IS NULL OR attributes = '[]'::jsonb);
