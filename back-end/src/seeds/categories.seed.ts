// ============================================
// Seed: Danh mục sản phẩm
// ============================================

import type { CategoryInsert } from '../types/database'

export const categoriesSeed: CategoryInsert[] = [
  { name: 'Vợt Pickleball',  slug: 'vot-pickleball',  icon: '🏓', sort_order: 1, description: 'Vợt thi đấu và tập luyện từ các thương hiệu hàng đầu' },
  { name: 'Bóng Pickleball', slug: 'bong-pickleball', icon: '⚾', sort_order: 2, description: 'Bóng outdoor, indoor chính hãng' },
  { name: 'Túi & Balo',      slug: 'tui-balo',        icon: '🎒', sort_order: 3, description: 'Túi đựng vợt, balo thể thao chuyên dụng' },
  { name: 'Phụ kiện Grip',   slug: 'phu-kien-grip',   icon: '🧤', sort_order: 4, description: 'Overgrip, replacement grip, cán vợt' },
  { name: 'Giày thể thao',   slug: 'giay-the-thao',   icon: '👟', sort_order: 5, description: 'Giày chuyên dụng cho Pickleball' },
  { name: 'Quần áo',         slug: 'quan-ao',          icon: '👕', sort_order: 6, description: 'Quần áo thể thao Pickleball' },
  { name: 'Lưới & Sân',      slug: 'luoi-san',         icon: '🥅', sort_order: 7, description: 'Lưới di động, phụ kiện sân' },
  { name: 'Combo tiết kiệm', slug: 'combo-tiet-kiem',  icon: '🎁', sort_order: 8, description: 'Bộ combo vợt + phụ kiện giá ưu đãi' },
]
