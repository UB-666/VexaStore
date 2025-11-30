-- ============================================================================
-- VexaStore Complete Database Setup
-- ============================================================================
-- This file sets up the entire database for the e-commerce platform
-- Run this ONCE in Supabase SQL Editor after creating your project
-- 
-- What this does:
-- 1. Creates all necessary tables (products, orders, user_roles)
-- 2. Sets up authentication and role-based access
-- 3. Configures Row Level Security (RLS) policies
-- 4. Adds sample products
-- 5. Creates indexes for performance
-- 6. Sets up triggers and functions
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image TEXT,
  inventory INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
  email TEXT,
  amount NUMERIC(10, 2),
  status TEXT DEFAULT 'created',
  stripe_session_id TEXT UNIQUE,
  customer_name TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  metadata JSONB
);

-- Order items table (optional, for detailed tracking)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_email_created ON orders(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_roles table
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user_role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user_role on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow developers to insert products" ON products;
DROP POLICY IF EXISTS "Allow developers to update products" ON products;
DROP POLICY IF EXISTS "Allow developers to delete products" ON products;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Service role full access" ON orders;
DROP POLICY IF EXISTS "Developers view all orders" ON orders;
DROP POLICY IF EXISTS "Developers update orders" ON orders;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON user_roles;

-- PRODUCTS POLICIES
CREATE POLICY "Allow public read access to products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Allow developers to insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'developer'
    )
  );

CREATE POLICY "Allow developers to update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'developer'
    )
  );

CREATE POLICY "Allow developers to delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'developer'
    )
  );

-- ORDERS POLICIES
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    email = (SELECT auth.jwt() ->> 'email')
  );

CREATE POLICY "Service role full access"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Developers view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'developer'
    )
  );

CREATE POLICY "Developers update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'developer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'developer'
    )
  );

-- USER_ROLES POLICIES
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Service role can manage roles"
  ON user_roles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ORDER_ITEMS POLICIES (if needed)
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.email = (SELECT auth.jwt() ->> 'email')
    )
  );

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample products
INSERT INTO products (title, slug, description, price, image, inventory) VALUES
  -- Clothing
  ('Blue Hoodie', 'blue-hoodie', 'Comfortable blue hoodie perfect for any season', 49.99, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', 100),
  ('Black T-Shirt', 'black-t-shirt', 'Classic cotton black t-shirt with premium fabric', 24.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 150),
  ('Denim Jeans', 'denim-jeans', 'Stylish slim-fit denim jeans with stretch comfort', 69.99, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 80),
  ('Leather Jacket', 'leather-jacket', 'Premium leather jacket with modern design', 199.99, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', 40),
  ('Running Sneakers', 'running-sneakers', 'Lightweight running shoes with superior cushioning', 89.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 90),
  ('Winter Scarf', 'winter-scarf', 'Warm wool blend scarf in multiple colors', 29.99, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=500', 120),
  
  -- Electronics
  ('Wireless Earbuds', 'wireless-earbuds', 'Compact earbuds with crystal clear sound quality', 79.99, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', 50),
  ('Smart Watch', 'smart-watch', 'Fitness tracking smartwatch with heart rate monitor', 249.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 60),
  ('Bluetooth Speaker', 'bluetooth-speaker', 'Portable waterproof speaker with 12-hour battery', 59.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 75),
  ('USB-C Cable', 'usb-c-cable', 'Fast charging USB-C cable 6ft braided nylon', 12.99, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500', 200),
  ('Phone Case', 'phone-case', 'Protective phone case with shock absorption', 19.99, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500', 150),
  ('Laptop Stand', 'laptop-stand', 'Ergonomic aluminum laptop stand with adjustable height', 39.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', 85),
  
  -- Home & Office
  ('Hardcover Notebook', 'notebook', 'Premium A5 hardcover notebook with lined pages', 9.99, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500', 200),
  ('Coffee Mug', 'coffee-mug', 'Ceramic coffee mug with ergonomic handle', 14.99, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500', 150),
  ('Desk Lamp', 'desk-lamp', 'LED desk lamp with adjustable brightness and color temperature', 44.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', 70),
  ('Backpack', 'backpack', 'Durable backpack with multiple compartments and laptop sleeve', 59.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 75),
  ('Water Bottle', 'water-bottle', 'Insulated stainless steel water bottle 32oz', 24.99, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', 180),
  ('Yoga Mat', 'yoga-mat', 'Non-slip yoga mat with carrying strap', 34.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', 95),
  ('Wall Art Print', 'wall-art-print', 'Modern abstract art print ready to frame', 29.99, 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=500', 110),
  ('Desk Organizer', 'desk-organizer', 'Bamboo desk organizer with multiple compartments', 27.99, 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=500', 130),
  
  -- Beauty & Personal Care
  ('Skincare Set', 'skincare-set', 'Complete skincare routine set with natural ingredients', 89.99, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', 55),
  ('Hair Dryer', 'hair-dryer', 'Professional ionic hair dryer with multiple heat settings', 69.99, 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500', 45),
  ('Essential Oil Set', 'essential-oil-set', 'Aromatherapy essential oil set with 6 natural scents', 39.99, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500', 88),
  
  -- Sports & Outdoors
  ('Camping Tent', 'camping-tent', 'Waterproof 4-person camping tent with easy setup', 149.99, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500', 35)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify RLS is enabled
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'products') THEN
    RAISE EXCEPTION 'Row Level Security is NOT enabled on products table!';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'orders') THEN
    RAISE EXCEPTION 'Row Level Security is NOT enabled on orders table!';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_roles') THEN
    RAISE EXCEPTION 'Row Level Security is NOT enabled on user_roles table!';
  END IF;
END $$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'VexaStore Database Setup Complete!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Tables created: products, orders, order_items, user_roles';
  RAISE NOTICE '✓ Indexes created for optimal performance';
  RAISE NOTICE '✓ Row Level Security enabled on all tables';
  RAISE NOTICE '✓ RLS policies configured for security';
  RAISE NOTICE '✓ Triggers set up for auto-updates';
  RAISE NOTICE '✓ Sample products inserted (24 items)';
  RAISE NOTICE '✓ Auth trigger configured for new users';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Configure your .env.local file with Supabase credentials';
  RAISE NOTICE '2. Run: npm install';
  RAISE NOTICE '3. Run: npm run dev';
  RAISE NOTICE '4. Start Stripe webhook: stripe listen --forward-to localhost:3000/api/stripe-webhook';
  RAISE NOTICE '';
  RAISE NOTICE 'Order Status Values:';
  RAISE NOTICE '  - paid: Payment received';
  RAISE NOTICE '  - processing: Order being prepared';
  RAISE NOTICE '  - shipped: Order dispatched';
  RAISE NOTICE '  - delivered: Order received by customer';
  RAISE NOTICE '  - completed: Order fulfilled';
  RAISE NOTICE '  - cancelled: Order cancelled';
  RAISE NOTICE '';
  RAISE NOTICE 'User Roles:';
  RAISE NOTICE '  - customer: Default role (automatic)';
  RAISE NOTICE '  - developer: Admin access (manual assignment)';
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
END $$;
