// ============================================
// Seed: Sản phẩm Pickleball
// Dữ liệu thật từ các thương hiệu nổi tiếng
// ============================================

// Lưu ý: category_id sẽ được map khi chạy seed
// Sử dụng categorySlug để reference

export interface ProductSeedItem {
  name: string
  slug: string
  description: string
  brand: string
  price: number
  original_price: number | null
  categorySlug: string
  stock: number
  tags: string[]
  specs: Record<string, string>
  is_featured: boolean
}

export const productsSeed: ProductSeedItem[] = [
  // === VỢT PICKLEBALL ===
  {
    name: 'JOOLA Ben Johns Hyperion CFS 16',
    slug: 'joola-ben-johns-hyperion-cfs-16',
    description: 'Vợt Pickleball cao cấp được thiết kế cùng tay vợt số 1 thế giới Ben Johns. Công nghệ Carbon Friction Surface mang lại spin cực đại.',
    brand: 'JOOLA',
    price: 4990000,
    original_price: 5990000,
    categorySlug: 'vot-pickleball',
    stock: 25,
    tags: ['best-seller', 'pro', 'carbon'],
    specs: { 'Trọng lượng': '7.8 oz', 'Bề mặt': 'Carbon Friction Surface', 'Lõi': 'Polymer Honeycomb 16mm', 'Grip': '4.25"', 'Chiều dài': '16.5"' },
    is_featured: true,
  },
  {
    name: 'Selkirk VANGUARD Power Air Invikta',
    slug: 'selkirk-vanguard-power-air-invikta',
    description: 'Thiết kế khí động học với công nghệ Air Dynamic Throat cho khả năng swing nhanh hơn. Bề mặt ProSpin+ Texture tạo spin mạnh mẽ.',
    brand: 'Selkirk',
    price: 6490000,
    original_price: 7490000,
    categorySlug: 'vot-pickleball',
    stock: 15,
    tags: ['pro', 'power', 'spin'],
    specs: { 'Trọng lượng': '7.7-8.1 oz', 'Bề mặt': 'ProSpin+ NextGen Texture', 'Lõi': 'X5 Polypropylene Honeycomb', 'Grip': '4.25"', 'Chiều dài': '16.5"' },
    is_featured: true,
  },
  {
    name: 'Paddletek Bantam EX-L Pro',
    slug: 'paddletek-bantam-ex-l-pro',
    description: 'Vợt huyền thoại của Paddletek, được tin dùng bởi nhiều pro player. Smart Response Technology mang lại cảm giác chạm bóng tuyệt vời.',
    brand: 'Paddletek',
    price: 3990000,
    original_price: 4590000,
    categorySlug: 'vot-pickleball',
    stock: 30,
    tags: ['classic', 'control', 'midweight'],
    specs: { 'Trọng lượng': '7.6-7.9 oz', 'Bề mặt': 'Textured Fiberglass', 'Lõi': 'Polymer Honeycomb', 'Grip': '4.25"', 'Chiều dài': '15.75"' },
    is_featured: true,
  },
  {
    name: 'HEAD Radical Elite',
    slug: 'head-radical-elite',
    description: 'Vợt entry-level tốt nhất từ HEAD. Nhẹ, dễ điều khiển, phù hợp người mới bắt đầu.',
    brand: 'HEAD',
    price: 2990000,
    original_price: 3490000,
    categorySlug: 'vot-pickleball',
    stock: 40,
    tags: ['beginner', 'lightweight', 'value'],
    specs: { 'Trọng lượng': '7.6 oz', 'Bề mặt': 'Fiberglass', 'Lõi': 'Optimized Tubular Construction', 'Grip': '4.25"', 'Chiều dài': '15.87"' },
    is_featured: true,
  },
  {
    name: 'Franklin Ben Johns Signature',
    slug: 'franklin-ben-johns-signature',
    description: 'Vợt bán chạy nhất tại Mỹ. MaxGrit texture cho spin tối đa, thiết kế từ Ben Johns.',
    brand: 'Franklin',
    price: 1990000,
    original_price: 2490000,
    categorySlug: 'vot-pickleball',
    stock: 50,
    tags: ['best-seller', 'value', 'spin'],
    specs: { 'Trọng lượng': '8.0 oz', 'Bề mặt': 'MaxGrit Carbon Fiber', 'Lõi': 'Polypropylene Honeycomb 16mm', 'Grip': '4.25"', 'Chiều dài': '16.5"' },
    is_featured: true,
  },
  {
    name: 'Engage Pursuit Pro MX 6.0',
    slug: 'engage-pursuit-pro-mx-60',
    description: 'Vợt cao cấp với công nghệ ControlPro Black. Lõi 6.0 dày mang lại sweet spot rộng và cảm giác mềm mại.',
    brand: 'Engage',
    price: 5490000,
    original_price: null,
    categorySlug: 'vot-pickleball',
    stock: 20,
    tags: ['premium', 'control', 'thick-core'],
    specs: { 'Trọng lượng': '7.9-8.3 oz', 'Bề mặt': 'ControlPro Black', 'Lõi': 'Proprietary Polymer 6.0', 'Grip': '4.25"', 'Chiều dài': '16.4"' },
    is_featured: true,
  },
  {
    name: 'CRBN 2X Power Series',
    slug: 'crbn-2x-power-series',
    description: 'Bề mặt Carbon 2X cho spin vượt trội. Raw carbon fiber không sơn, cảm giác bóng trung thực nhất.',
    brand: 'CRBN',
    price: 5990000,
    original_price: 6490000,
    categorySlug: 'vot-pickleball',
    stock: 12,
    tags: ['pro', 'spin', 'raw-carbon'],
    specs: { 'Trọng lượng': '8.0 oz', 'Bề mặt': 'Raw Toray T700 Carbon Fiber', 'Lõi': 'Polymer Honeycomb 14mm', 'Grip': '4.25"', 'Chiều dài': '16.5"' },
    is_featured: false,
  },
  {
    name: 'Diadem Warrior V2',
    slug: 'diadem-warrior-v2',
    description: 'Vợt thermoformed edge với power tối đa. Edge Guard tích hợp tăng độ bền và diện tích đánh.',
    brand: 'Diadem',
    price: 4490000,
    original_price: 4990000,
    categorySlug: 'vot-pickleball',
    stock: 18,
    tags: ['power', 'thermoformed', 'edgeless'],
    specs: { 'Trọng lượng': '8.0-8.4 oz', 'Bề mặt': 'Carbon Fiber', 'Lõi': 'Polypropylene Honeycomb 16mm', 'Grip': '4.25"', 'Chiều dài': '16.5"' },
    is_featured: false,
  },

  // === BÓNG PICKLEBALL ===
  {
    name: 'Franklin X-40 Outdoor Ball (12 pack)',
    slug: 'franklin-x40-outdoor-12',
    description: 'Bóng outdoor chính thức của nhiều giải đấu lớn. 40 lỗ, chống gió tốt.',
    brand: 'Franklin',
    price: 790000,
    original_price: 890000,
    categorySlug: 'bong-pickleball',
    stock: 100,
    tags: ['outdoor', 'tournament', 'pack-12'],
    specs: { 'Số lỗ': '40', 'Đường kính': '2.87"', 'Trọng lượng': '0.88 oz', 'Tiêu chuẩn': 'USAPA Approved' },
    is_featured: false,
  },
  {
    name: 'Dura Fast 40 Outdoor Ball (4 pack)',
    slug: 'dura-fast-40-outdoor-4',
    description: 'Bóng outdoor phổ biến nhất thế giới. Độ bền cao, bounce ổn định.',
    brand: 'Onix',
    price: 350000,
    original_price: null,
    categorySlug: 'bong-pickleball',
    stock: 200,
    tags: ['outdoor', 'durable', 'pack-4'],
    specs: { 'Số lỗ': '40', 'Đường kính': '2.87"', 'Trọng lượng': '0.92 oz', 'Tiêu chuẩn': 'USAPA Approved' },
    is_featured: false,
  },

  // === TÚI & BALO ===
  {
    name: 'JOOLA Tour Elite Bag',
    slug: 'joola-tour-elite-bag',
    description: 'Balo chuyên dụng Pickleball với ngăn chứa 4 vợt, túi giày riêng, ngăn laptop 15".',
    brand: 'JOOLA',
    price: 2490000,
    original_price: 2990000,
    categorySlug: 'tui-balo',
    stock: 35,
    tags: ['pro-bag', 'laptop', 'ventilated'],
    specs: { 'Dung tích': '35L', 'Ngăn vợt': '4 vợt', 'Chất liệu': 'Polyester 600D chống nước', 'Đặc biệt': 'Ngăn giày riêng, quai đệm EVA' },
    is_featured: false,
  },

  // === PHỤ KIỆN GRIP ===
  {
    name: 'Selkirk Overgrip Pack (3 cuộn)',
    slug: 'selkirk-overgrip-3-pack',
    description: 'Overgrip cao cấp, hút mồ hôi tốt, cảm giác mềm mại. Phù hợp mọi loại vợt.',
    brand: 'Selkirk',
    price: 290000,
    original_price: null,
    categorySlug: 'phu-kien-grip',
    stock: 150,
    tags: ['overgrip', 'sweat-absorb', 'pack-3'],
    specs: { 'Số lượng': '3 cuộn', 'Độ dày': '0.6mm', 'Chất liệu': 'PU Tacky', 'Màu': 'Trắng/Đen/Xanh' },
    is_featured: false,
  },

  // === GIÀY THỂ THAO ===
  {
    name: 'K-Swiss Express Light Pickleball',
    slug: 'k-swiss-express-light-pickleball',
    description: 'Giày chuyên Pickleball nhẹ nhất dòng K-Swiss. Đế Aösta 7.0 bám sân tốt, đệm DragGuard bảo vệ mũi giày.',
    brand: 'K-Swiss',
    price: 2790000,
    original_price: 3290000,
    categorySlug: 'giay-the-thao',
    stock: 22,
    tags: ['court-shoe', 'lightweight', 'non-marking'],
    specs: { 'Đế': 'Aösta 7.0 Rubber', 'Đệm': 'K-EVA midsole', 'Upper': 'Synthetic Mesh', 'Trọng lượng': '280g (size 42)' },
    is_featured: false,
  },

  // === QUẦN ÁO ===
  {
    name: 'JOOLA Ben Johns Tournament Shirt',
    slug: 'joola-ben-johns-tournament-shirt',
    description: 'Áo thi đấu chính thức của Ben Johns. Chất liệu DryFit, thoáng khí, chống UV.',
    brand: 'JOOLA',
    price: 890000,
    original_price: 990000,
    categorySlug: 'quan-ao',
    stock: 60,
    tags: ['tournament', 'dryfit', 'uv-protection'],
    specs: { 'Chất liệu': '100% Polyester DryFit', 'Công nghệ': 'UV Protection 50+', 'Size': 'S / M / L / XL / XXL' },
    is_featured: false,
  },

  // === LƯỚI & SÂN ===
  {
    name: 'ONIX Portable Pickleball Net',
    slug: 'onix-portable-net',
    description: 'Lưới Pickleball di động, dễ lắp đặt trong 5 phút. Khung thép chắc chắn, đạt chuẩn USAPA.',
    brand: 'Onix',
    price: 4990000,
    original_price: 5990000,
    categorySlug: 'luoi-san',
    stock: 10,
    tags: ['portable', 'regulation-size', 'steel-frame'],
    specs: { 'Kích thước': '22 feet (regulation)', 'Khung': 'Thép sơn tĩnh điện', 'Trọng lượng': '14 kg', 'Lắp đặt': '5 phút, không cần dụng cụ' },
    is_featured: false,
  },

  // === COMBO ===
  {
    name: 'Combo Starter Kit (Vợt + Bóng + Grip)',
    slug: 'combo-starter-kit',
    description: 'Bộ khởi đầu hoàn hảo: 1 vợt HEAD Radical Elite + 4 bóng Franklin X-40 + 3 Overgrip. Tiết kiệm 30% so với mua lẻ.',
    brand: 'PicklePro',
    price: 3490000,
    original_price: 4990000,
    categorySlug: 'combo-tiet-kiem',
    stock: 20,
    tags: ['combo', 'beginner', 'save-30'],
    specs: { 'Bao gồm': 'Vợt HEAD Radical Elite + 4 bóng + 3 Overgrip', 'Tiết kiệm': '30% so với mua lẻ', 'Phù hợp': 'Người mới bắt đầu' },
    is_featured: false,
  },
  {
    name: 'Combo Pro Player (Vợt JOOLA + Túi + Grip)',
    slug: 'combo-pro-player',
    description: 'Combo cho tay chơi chuyên nghiệp: Vợt JOOLA Hyperion CFS 16 + Túi JOOLA Tour Elite + Overgrip Selkirk.',
    brand: 'PicklePro',
    price: 7190000,
    original_price: 8770000,
    categorySlug: 'combo-tiet-kiem',
    stock: 8,
    tags: ['combo', 'pro', 'save-18'],
    specs: { 'Bao gồm': 'Vợt JOOLA Hyperion + Túi JOOLA Tour Elite + Overgrip Selkirk', 'Tiết kiệm': '18% so với mua lẻ', 'Phù hợp': 'Tay chơi chuyên nghiệp' },
    is_featured: false,
  },
]
