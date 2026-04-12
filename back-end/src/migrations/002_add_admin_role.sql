-- ============================================
-- Migration: Thêm cột role vào profiles
-- Chạy lệnh này trong Supabase SQL Editor
-- ============================================

-- 1. Thêm cột role
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. Set admin cho tài khoản của bạn (thay bằng email thật)
-- UPDATE profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com');

-- 3. RLS policy: Admin có thể đọc tất cả profiles
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 4. Admin có thể đọc tất cả orders
CREATE POLICY "admin_select_all_orders" ON orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 5. Admin có thể UPDATE order status
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 6. Admin có thể INSERT/UPDATE/DELETE products
CREATE POLICY "admin_all_products" ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 7. Admin có thể CRUD categories
CREATE POLICY "admin_all_categories" ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
