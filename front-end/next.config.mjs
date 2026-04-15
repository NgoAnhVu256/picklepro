/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
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
  },
}

export default nextConfig
