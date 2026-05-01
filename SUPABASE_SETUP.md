# Supabase Database Setup Guide (Authoritative)

This guide contains the definitive SQL schema for the Inven-Track application. Run this script in your Supabase SQL Editor to ensure perfect alignment with the application code.

## 1. Unified Reset & Creation Script

> [!CAUTION]
> **Data Loss**: Running this script will DROP existing tables. Back up data if necessary.

```sql
-- CLEANUP
DROP VIEW IF EXISTS tenant_daily_analytics CASCADE;
DROP VIEW IF EXISTS tenant_stock_alerts CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS delivery_order_items CASCADE;
DROP TABLE IF EXISTS delivery_orders CASCADE;
DROP TABLE IF EXISTS delivery_partners CASCADE;
DROP TABLE IF EXISTS stock_levels CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- CORE TABLES
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'manager',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  sale_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sku)
);

CREATE TABLE branches (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stores (
  id BIGSERIAL PRIMARY KEY,
  branch_id BIGINT REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'warehouse_store',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_levels (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  store_id BIGINT REFERENCES stores(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, store_id)
);

CREATE TABLE delivery_partners (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT REFERENCES stores(id) ON DELETE CASCADE,
  clerk_user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL UNIQUE,
  company_name TEXT NOT NULL,
  contact_info TEXT,
  rating DECIMAL(3, 1) DEFAULT 4.5,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Pending Review')),
  region TEXT DEFAULT 'Local Region',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_orders (
  id BIGSERIAL PRIMARY KEY,
  manager_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  delivery_partner_id BIGINT REFERENCES delivery_partners(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_transit', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES delivery_orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE inventory_movements (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  from_store_id BIGINT REFERENCES stores(id) ON DELETE SET NULL,
  to_store_id BIGINT REFERENCES stores(id) ON DELETE SET NULL,
  delivery_partner_id BIGINT REFERENCES delivery_partners(id) ON DELETE SET NULL,
  delivery_order_id BIGINT REFERENCES delivery_orders(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('transfer', 'return', 'fulfillment', 'adjustment')),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own profile" ON profiles FOR ALL USING ((auth.jwt() ->> 'sub') = id);
CREATE POLICY "Allow profile creation" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can only access their own products" ON products FOR ALL USING (user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "Users can only access their own branches" ON branches FOR ALL USING (user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "Stores access via branch owner" ON stores FOR ALL USING (EXISTS (SELECT 1 FROM branches b WHERE b.id = stores.branch_id AND b.user_id = (auth.jwt() ->> 'sub')));
CREATE POLICY "Stock access via product owner" ON stock_levels FOR ALL USING (EXISTS (SELECT 1 FROM products p WHERE p.id = stock_levels.product_id AND p.user_id = (auth.jwt() ->> 'sub')));
CREATE POLICY "Partners access via store owner" ON delivery_partners FOR ALL USING (EXISTS (SELECT 1 FROM stores s JOIN branches b ON s.branch_id = b.id WHERE s.id = delivery_partners.store_id AND b.user_id = (auth.jwt() ->> 'sub')));
CREATE POLICY "Partners can view their own record" ON delivery_partners FOR SELECT USING (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "Orders access for managers" ON delivery_orders FOR ALL USING (manager_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "Orders access for assigned partners" ON delivery_orders FOR SELECT USING (EXISTS (SELECT 1 FROM delivery_partners dp WHERE dp.id = delivery_orders.delivery_partner_id AND dp.clerk_user_id = (auth.jwt() ->> 'sub')));
CREATE POLICY "Assigned partners can update order status" ON delivery_orders FOR UPDATE USING (EXISTS (SELECT 1 FROM delivery_partners dp WHERE dp.id = delivery_orders.delivery_partner_id AND dp.clerk_user_id = (auth.jwt() ->> 'sub')));
CREATE POLICY "Order items access via order" ON delivery_order_items FOR ALL USING (EXISTS (SELECT 1 FROM delivery_orders o WHERE o.id = delivery_order_items.order_id AND (o.manager_id = (auth.jwt() ->> 'sub') OR EXISTS (SELECT 1 FROM delivery_partners dp WHERE dp.id = o.delivery_partner_id AND dp.clerk_user_id = (auth.jwt() ->> 'sub')))));
CREATE POLICY "Movements access via product owner" ON inventory_movements FOR ALL USING (EXISTS (SELECT 1 FROM products p WHERE p.id = inventory_movements.product_id AND p.user_id = (auth.jwt() ->> 'sub')));

-- ANALYTICS VIEWS
CREATE OR REPLACE VIEW tenant_daily_analytics AS
SELECT 
    p.user_id,
    DATE(im.created_at) as analytics_date,
    SUM(CASE WHEN im.type = 'fulfillment' THEN im.quantity * p.sale_price ELSE 0 END) as daily_revenue,
    SUM(CASE WHEN im.type = 'fulfillment' THEN im.quantity * (p.sale_price * 0.3) ELSE 0 END) as daily_profit -- Estimated 30% margin for demo
FROM products p
JOIN inventory_movements im ON p.id = im.product_id
GROUP BY p.user_id, DATE(im.created_at);

CREATE OR REPLACE VIEW tenant_stock_alerts AS
SELECT 
    p.user_id,
    p.id as product_id,
    p.name as product_name,
    p.sku as product_sku,
    SUM(sl.quantity) as total_quantity
FROM products p
JOIN stock_levels sl ON p.id = sl.product_id
GROUP BY p.user_id, p.id, p.name, p.sku
HAVING SUM(sl.quantity) < 50;
```
