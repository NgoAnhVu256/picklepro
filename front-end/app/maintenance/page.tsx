import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đang bảo trì | PicklePro',
  description: 'Website đang được nâng cấp. Vui lòng quay lại sau.',
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return (
    <html lang="vi">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white', padding: '2rem', maxWidth: '480px' }}>
          {/* Logo */}
          <div style={{ marginBottom: '2rem' }}>
            <img src="/logo.png" alt="PicklePro" width={100} height={100} style={{ borderRadius: '20px', objectFit: 'contain' }} />
          </div>

          {/* Icon */}
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔧</div>

          {/* Title */}
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(90deg, #84cc16, #eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Đang bảo trì
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            PicklePro đang được nâng cấp để phục vụ bạn tốt hơn.<br />
            Chúng tôi sẽ trở lại sớm!
          </p>

          {/* Divider */}
          <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, #84cc16, #eab308)', margin: '0 auto 1.5rem', borderRadius: '2px' }} />

          {/* Contact */}
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Liên hệ hỗ trợ:{' '}
            <a href="https://zalo.me/0373164472" style={{ color: '#84cc16', textDecoration: 'none', fontWeight: 600 }}>
              Zalo: 0373 164 472
            </a>
          </p>

          {/* Admin link */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #1e293b' }}>
            <a
              href="/admin"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.2rem', borderRadius: '10px',
                background: 'rgba(132, 204, 22, 0.1)', color: '#84cc16',
                border: '1px solid rgba(132, 204, 22, 0.3)',
                textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              🛠 Admin — Tắt bảo trì
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
