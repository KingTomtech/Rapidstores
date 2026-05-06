-- Supabase Database Schema for Rapid Stores
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== PROFILES TABLE ====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== PRODUCTS TABLE ====================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  is_manufactured BOOLEAN DEFAULT FALSE,
  custom_options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster searches
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== CARTS TABLE ====================
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

-- RLS for carts
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON carts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cart"
  ON carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON carts FOR UPDATE
  USING (auth.uid() = user_id);

-- ==================== CART ITEMS TABLE ====================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);

-- RLS for cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE id = cart_items.cart_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE id = cart_items.cart_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE id = cart_items.cart_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE id = cart_items.cart_id AND user_id = auth.uid()
    )
  );

-- ==================== ORDERS TABLE ====================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'ready', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'mobile_money' CHECK (payment_method IN ('mobile_money', 'voucher', 'cash')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  delivery_address TEXT,
  phone_number TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== ORDER ITEMS TABLE ====================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- RLS for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== VOUCHERS TABLE ====================
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);

-- RLS for vouchers
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vouchers are viewable by everyone"
  ON vouchers FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage vouchers"
  ON vouchers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== MANUFACTURING ORDERS TABLE ====================
CREATE TABLE IF NOT EXISTS manufacturing_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  specifications JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_production', 'completed', 'delivered')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  estimated_completion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manufacturing_orders_customer_id ON manufacturing_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_manufacturing_orders_status ON manufacturing_orders(status);

-- RLS for manufacturing_orders
ALTER TABLE manufacturing_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own manufacturing orders"
  ON manufacturing_orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Admins can view all manufacturing orders"
  ON manufacturing_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update manufacturing orders"
  ON manufacturing_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== FUNCTIONS & TRIGGERS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manufacturing_orders_updated_at BEFORE UPDATE ON manufacturing_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== SEED DATA ====================

-- Insert admin user (you'll need to create this via Supabase Auth UI or API)
-- Then update their role:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@rapidstores.co.zm';

-- Sample products
INSERT INTO products (name, description, price, category, stock_quantity, is_manufactured) VALUES
('Single Foam Mattress', 'High-quality foam mattress, 3 inches thick. Perfect for single beds.', 450.00, 'Mattresses', 50, true),
('Double Foam Mattress', 'Comfortable double foam mattress, 4 inches thick.', 750.00, 'Mattresses', 30, true),
('Queen Spring Mattress', 'Premium spring mattress with pillow top. Queen size.', 1200.00, 'Mattresses', 20, true),
('King Divan Base', 'Sturdy divan base with storage. King size.', 1500.00, 'Furniture', 15, true),
('Foam Pillow', 'Soft foam pillow with breathable cover.', 85.00, 'Accessories', 100, true),
('Mattress Protector', 'Waterproof mattress protector. All sizes available.', 120.00, 'Accessories', 80, false),
('Rice 10kg', 'Premium quality rice. 10kg bag.', 180.00, 'Groceries', 200, false),
('Cooking Oil 2L', 'Sunflower cooking oil. 2 litre bottle.', 65.00, 'Groceries', 150, false),
('Sugar 5kg', 'White refined sugar. 5kg pack.', 95.00, 'Groceries', 180, false),
('Maize Meal 10kg', 'Breakfast mealie meal. 10kg bag.', 120.00, 'Groceries', 250, false),
('Tea Bags 100s', 'Black tea bags. Box of 100.', 45.00, 'Groceries', 120, false),
('Bread Loaf', 'Fresh white bread loaf.', 15.00, 'Groceries', 50, false),
('Milk 1L', 'Full cream long life milk. 1 litre.', 25.00, 'Groceries', 100, false),
('Eggs 30pk', 'Fresh farm eggs. Pack of 30.', 85.00, 'Groceries', 60, false),
('Chicken 1kg', 'Frozen whole chicken. 1kg.', 55.00, 'Groceries', 80, false);

-- Sample vouchers
INSERT INTO vouchers (code, discount_type, discount_value, min_order_amount, max_uses, expires_at) VALUES
('WELCOME10', 'percentage', 10.00, 100.00, 100, NOW() + INTERVAL '30 days'),
('RAPID50', 'fixed', 50.00, 300.00, 50, NOW() + INTERVAL '60 days'),
('MATTRESS20', 'percentage', 20.00, 500.00, 30, NOW() + INTERVAL '90 days');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active) WHERE is_active = true;
