#!/bin/bash
# ============================================================
# Script setup PM2 ecosystem cho PicklePro VPS
# Chạy 1 lần trên VPS: bash setup-pm2.sh
# ============================================================

cat > /var/www/picklepro/ecosystem.config.js << 'ECOSYSTEM'
module.exports = {
  apps: [
    {
      name: 'picklepro',
      cwd: '/var/www/picklepro/front-end',
      script: 'node',
      args: '.next/standalone/server.js',

      // Cluster mode — dùng tất cả CPU cores cho high traffic
      instances: 2,
      exec_mode: 'cluster',

      // Môi trường production
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },

      // Auto restart nếu crash
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      restart_delay: 3000,

      // Logs
      error_file: '/var/log/picklepro/err.log',
      out_file: '/var/log/picklepro/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Zero-downtime: chờ app sẵn sàng trước khi reload
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
ECOSYSTEM

mkdir -p /var/log/picklepro
echo "✅ ecosystem.config.js đã tạo tại /var/www/picklepro/"
echo "👉 Chạy tiếp: pm2 start /var/www/picklepro/ecosystem.config.js --env production && pm2 save && pm2 startup"
