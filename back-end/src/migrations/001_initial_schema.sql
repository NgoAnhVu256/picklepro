-- ============================================
-- PicklePro Database Schema
-- Supabase PostgreSQL
-- ============================================

-- ===========================================
-- 1. CATEGORIES
-- ===========================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ===========================================
-- 2. PRODUCTS
-- ===========================================
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  brand           TEXT NOT NULL,
  price           INTEGER NOT NULL CHECK (price >= 0),
  original_price  INTEGER CHECK (original_price >= 0),
  category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  rating          REAL NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count    INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  tags            TEXT[] DEFAULT '{}',
  specs           JSONB,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_search ON products USING GIN (to_tsvector('simple', name || ' ' || brand));

-- ===========================================
-- 3. PRODUCT IMAGES
-- ===========================================
CREATE TABLE IF NOT EXISTS product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_primary  BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ===========================================
-- 4. PROFILES (extends auth.users)
-- ===========================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  address     TEXT,
  avatar_url  TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile khi user mới đăng ký
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- 5. ORDERS
-- ===========================================
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'paid', 'shipping', 'completed', 'cancelled')),
  total_amount      INTEGER NOT NULL CHECK (total_amount >= 0),
  shipping_name     TEXT NOT NULL,
  shipping_address  TEXT NOT NULL,
  shipping_phone    TEXT NOT NULL,
  payment_method    TEXT NOT NULL CHECK (payment_method IN ('stripe', 'cod')),
  stripe_session_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe ON orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

-- ===========================================
-- 6. ORDER ITEMS
-- ===========================================
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  INTEGER NOT NULL CHECK (unit_price >= 0)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ===========================================
-- 7. REVIEWS
-- ===========================================
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)  -- Mỗi user chỉ review 1 lần/sản phẩm
);

CREATE INDEX idx_reviews_product ON reviews(product_id);

-- ===========================================
-- 8. CHAT HISTORY
-- ===========================================
CREATE TABLE IF NOT EXISTS chat_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_user ON chat_history(user_id);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Categories: Public read
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);

-- Products: Public read active products
CREATE POLICY "products_select" ON products FOR SELECT USING (is_active = true);

-- Product Images: Public read
CREATE POLICY "product_images_select" ON product_images FOR SELECT USING (true);

-- Profiles: Users can read/update own profile
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Orders: Users can read own orders
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_auth" ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order Items: Users can read own order items
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_insert_auth" ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Reviews: Public read, auth users can CRUD own
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);

CREATE POLICY "reviews_insert_auth" ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Chat History: Users can manage own chat
CREATE POLICY "chat_select_own" ON chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat_insert_auth" ON chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_delete_own" ON chat_history FOR DELETE
  USING (auth.uid() = user_id);
