// ============================================
// Seed: Danh mục sản phẩm
// ============================================

import type { CategoryInsert } from '../types/database'

export const categoriesSeed: CategoryInsert[] = [
  { name: 'Vợt Pickleball', slug: 'vot-pickleball', icon: '🏓', description: 'Vợt thi đấu và tập luyện từ các thương hiệu hàng đầu' },
  { name: 'Bóng Pickleball', slug: 'bong-pickleball', icon: '⚾', description: 'Bóng outdoor, indoor chính hãng' },
  { name: 'Túi & Balo', slug: 'tui-balo', icon: '🎒', description: 'Túi đựng vợt, balo thể thao chuyên dụng' },
  { name: 'Phụ kiện Grip', slug: 'phu-kien-grip', icon: '🧤', description: 'Overgrip, replacement grip, cán vợt' },
  { name: 'Giày thể thao', slug: 'giay-the-thao', icon: '👟', description: 'Giày chuyên dụng cho Pickleball' },
  { name: 'Quần áo', slug: 'quan-ao', icon: '👕', description: 'Quần áo thể thao Pickleball' },
  { name: 'Lưới & Sân', slug: 'luoi-san', icon: '🥅', description: 'Lưới di động, phụ kiện sân' },
  { name: 'Combo tiết kiệm', slug: 'combo-tiet-kiem', icon: '🎁', description: 'Bộ combo vợt + phụ kiện giá ưu đãi' },
]
