// ============================================
// Seed: Danh mục sản phẩm
// ============================================

import type { CategoryInsert } from '../types/database'

export const categoriesSeed: CategoryInsert[] = [
  { name: 'Vợt Pickleball', slug: 'vot-pickleball', icon: '🏓', description: 'Vợt thi đấu và tập luyện từ các thương hiệu hàng đầu', sort_order: 1 },
  { name: 'Bóng Pickleball', slug: 'bong-pickleball', icon: '⚾', description: 'Bóng outdoor, indoor chính hãng', sort_order: 2 },
  { name: 'Túi & Balo', slug: 'tui-balo', icon: '🎒', description: 'Túi đựng vợt, balo thể thao chuyên dụng', sort_order: 3 },
  { name: 'Phụ kiện Grip', slug: 'phu-kien-grip', icon: '🧤', description: 'Overgrip, replacement grip, cán vợt', sort_order: 4 },
  { name: 'Giày thể thao', slug: 'giay-the-thao', icon: '👟', description: 'Giày chuyên dụng cho Pickleball', sort_order: 5 },
  { name: 'Quần áo', slug: 'quan-ao', icon: '👕', description: 'Quần áo thể thao Pickleball', sort_order: 6 },
  { name: 'Lưới & Sân', slug: 'luoi-san', icon: '🥅', description: 'Lưới di động, phụ kiện sân', sort_order: 7 },
  { name: 'Combo tiết kiệm', slug: 'combo-tiet-kiem', icon: '🎁', description: 'Bộ combo vợt + phụ kiện giá ưu đãi', sort_order: 8 },
]
