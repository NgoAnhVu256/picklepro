/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  // === VPS Performance Optimizations ===
  // Build dạng standalone - nhẹ hơn ~70%, phù hợp deploy VPS
  output: 'standalone',
  // Bật gzip/brotli built-in
  compress: true,
  // Ẩn "X-Powered-By: Next.js" header (bảo mật)
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xvkotjznfupazecaaucl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Kích thước ảnh tối ưu cho responsive
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Định dạng ảnh hiện đại, nhẹ hơn JPEG 30-50%
    formats: ['image/avif', 'image/webp'],
    // Cache ảnh đã tối ưu trong 7 ngày (trước là 24h)
    minimumCacheTTL: 604800,
  },

  // Caching headers cho static assets — cải thiện tốc độ lần truy cập thứ 2+
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/logo.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
    ]
  },

  // Tree-shaking tốt hơn cho các thư viện lớn
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-icons',
    ],
  },

  // Transpile back-end workspace package
  transpilePackages: ['@picklepro/back-end'],

  // Expose env vars to Next.js runtime
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    ZALO_CHAT_LINK: process.env.ZALO_CHAT_LINK,
    VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE,
    VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET,
    VNPAY_URL: process.env.VNPAY_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
}

export default nextConfig
