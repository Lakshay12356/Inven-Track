# Supabase Database Setup Guide (Simplified Schema)

> Run this entire script in your Supabase SQL Editor to set up or reset the database.

```sql
-- ============================================================
-- CLEANUP (drop everything first)
-- ============================================================
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

-- ============================================================
-- PROFILES (auth bridge between Clerk and Supabase)
-- ============================================================
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'manager',
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS (with quantity directly on the product)
-- ============================================================
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  sale_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  buy_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sku)
);

-- ============================================================
-- BRANCHES
-- ============================================================
CREATE TABLE branches (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STORES (warehouses inside branches)
-- ============================================================
CREATE TABLE stores (
  id BIGSERIAL PRIMARY KEY,
  branch_id BIGINT REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'warehouse_store',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DELIVERY PARTNERS (created by managers)
-- ============================================================
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

-- ============================================================
-- DELIVERY ORDERS
-- ============================================================
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

-- ============================================================
-- DELIVERY ORDER ITEMS (products per delivery)
-- ============================================================
CREATE TABLE delivery_order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES delivery_orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'new_assignment')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can only access their own profile" ON profiles
  FOR ALL USING ((auth.jwt() ->> 'sub') = id);
CREATE POLICY "Allow profile creation" ON profiles
  FOR INSERT WITH CHECK (true);

-- PRODUCTS
CREATE POLICY "Users can only access their own products" ON products
  FOR ALL USING (user_id = (auth.jwt() ->> 'sub'));

-- BRANCHES
CREATE POLICY "Users can only access their own branches" ON branches
  FOR ALL USING (user_id = (auth.jwt() ->> 'sub'));

-- STORES (via branch owner)
CREATE POLICY "Stores access via branch owner" ON stores
  FOR ALL USING (EXISTS (
    SELECT 1 FROM branches b
    WHERE b.id = stores.branch_id
    AND b.user_id = (auth.jwt() ->> 'sub')
  ));

-- DELIVERY PARTNERS (manager owns via store chain, partner can view own record)
CREATE POLICY "Partners access via store owner" ON delivery_partners
  FOR ALL USING (EXISTS (
    SELECT 1 FROM stores s
    JOIN branches b ON s.branch_id = b.id
    WHERE s.id = delivery_partners.store_id
    AND b.user_id = (auth.jwt() ->> 'sub')
  ));
CREATE POLICY "Partners can view their own record" ON delivery_partners
  FOR SELECT USING (clerk_user_id = (auth.jwt() ->> 'sub'));

-- DELIVERY ORDERS (manager owns, assigned partner can view + update status)
CREATE POLICY "Orders access for managers" ON delivery_orders
  FOR ALL USING (manager_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "Orders access for assigned partners" ON delivery_orders
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM delivery_partners dp
    WHERE dp.id = delivery_orders.delivery_partner_id
    AND dp.clerk_user_id = (auth.jwt() ->> 'sub')
  ));
CREATE POLICY "Assigned partners can update order status" ON delivery_orders
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM delivery_partners dp
    WHERE dp.id = delivery_orders.delivery_partner_id
    AND dp.clerk_user_id = (auth.jwt() ->> 'sub')
  ));

-- DELIVERY ORDER ITEMS (via order ownership)
CREATE POLICY "Order items access via order" ON delivery_order_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM delivery_orders o
    WHERE o.id = delivery_order_items.order_id
    AND (
      o.manager_id = (auth.jwt() ->> 'sub')
      OR EXISTS (
        SELECT 1 FROM delivery_partners dp
        WHERE dp.id = o.delivery_partner_id
        AND dp.clerk_user_id = (auth.jwt() ->> 'sub')
      )
    )
  ));

-- NOTIFICATIONS
CREATE POLICY "Users can only access their own notifications" ON notifications
  FOR ALL USING (user_id = (auth.jwt() ->> 'sub'));
```

## Schema Summary

| Table | Purpose |
|-------|---------|
| `profiles` | User identity bridge (Clerk ID → Supabase), holds `role` and `company_name` |
| `products` | Product catalog with `quantity` directly on the row |
| `branches` | Business locations owned by managers |
| `stores` | Warehouses inside branches |
| `delivery_partners` | Partner accounts created by managers (linked to Clerk user) |
| `delivery_orders` | Customer delivery orders with status lifecycle |
| `delivery_order_items` | Line items linking products to orders |
| `notifications` | In-app notifications (low stock, new assignments) |

## Status Flow

```
pending → assigned → in_transit → completed
                    → cancelled
```

- **Manager** creates order → status is `pending` (no partner) or `assigned` (with partner)
- **Manager** can only READ status after assignment
- **Delivery Partner** updates: `assigned` → `in_transit` → `completed`
