# Supabase Database Setup Guide

This guide will help you set up your Supabase database tables for the IMS application.

## Required Tables

### 1. Users Table

Create a table named `users` to store Clerk user IDs and associate them with Supabase records:

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
```

### 2. Products Table

Create a table named `products` with the following structure. Note: `user_id` links products to specific users:

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sku) -- Ensure SKU is unique per user
);

-- Create index for faster user-based queries
CREATE INDEX idx_products_user_id ON products(user_id);
```

### 3. Delivery Partners Table

Create a table named `delivery_partners` with the following structure. Note: `user_id` links delivery partners to specific users:

```sql
CREATE TABLE delivery_partners (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rating DECIMAL(3, 1) NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Pending Review')),
  region TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster user-based queries
CREATE INDEX idx_delivery_partners_user_id ON delivery_partners(user_id);
```

### 4. Deliveries Table (Optional - for tracking deliveries)

Create a table named `deliveries` with the following structure. Note: `user_id` links deliveries to specific users:

```sql
CREATE TABLE deliveries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  partner_id BIGINT REFERENCES delivery_partners(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster user-based queries
CREATE INDEX idx_deliveries_user_id ON deliveries(user_id);
```

### 5. Customers Table (Optional - for customer tracking)

Create a table named `customers` with the following structure. Note: `user_id` links customers to specific users:

```sql
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster user-based queries
CREATE INDEX idx_customers_user_id ON customers(user_id);
```

## Row Level Security (RLS)

Enable RLS on all tables and create policies. Since we're using Clerk for authentication, we'll use a function to get the current user's ID from the JWT token.

First, create a function to get the current Clerk user ID from the request:

```sql
-- Function to get current user ID from JWT (Clerk user ID stored in JWT)
-- Note: This assumes Clerk user ID is passed in the request headers or JWT
-- You may need to adjust this based on how Clerk integrates with Supabase

-- For now, we'll use a simpler approach: store Clerk user ID in a custom claim
-- You'll need to set up Clerk webhooks to sync users to Supabase, or
-- use a server-side function to get/set the user_id

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Users table policies (users can only see/update their own record)
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (true); -- Adjust based on your auth setup

CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (true); -- Adjust based on your auth setup

-- Products policies (users can only access their own products)
-- Note: These policies assume user_id is set correctly via application logic
-- For stricter security, you'd need to verify the user_id matches the authenticated user
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (true); -- Will be filtered by user_id in application code

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (true); -- Application ensures correct user_id

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (true); -- Application ensures correct user_id

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (true); -- Application ensures correct user_id

-- Delivery partners policies
CREATE POLICY "Users can view own delivery partners" ON delivery_partners
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own delivery partners" ON delivery_partners
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own delivery partners" ON delivery_partners
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own delivery partners" ON delivery_partners
  FOR DELETE USING (true);

-- Deliveries policies
CREATE POLICY "Users can view own deliveries" ON deliveries
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own deliveries" ON deliveries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own deliveries" ON deliveries
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own deliveries" ON deliveries
  FOR DELETE USING (true);

-- Customers policies
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (true);
```

**Important Note:** The RLS policies above are permissive because Clerk authentication happens outside of Supabase. The application code will filter by `user_id` to ensure users only see their own data. For production, consider implementing stricter RLS policies if you integrate Clerk with Supabase Auth.

## Sample Data

**Important:** Before inserting sample data, you must first create a user record. Sample data insertion:

```sql
-- First, insert a user (replace 'clerk_user_id_here' with an actual Clerk user ID)
-- This should typically be done automatically when a user signs up via your application
INSERT INTO users (clerk_user_id, email) VALUES
  ('clerk_user_id_here', 'user@example.com')
  ON CONFLICT (clerk_user_id) DO NOTHING;

-- Get the user_id (replace with actual user_id from above)
-- For example, if the user_id is 1:
-- INSERT INTO products (user_id, name, sku, stock, price, last_updated) VALUES
--   (1, 'Wireless Mouse Pro', 'WM-001', 150, 29.99, '2025-10-25'),
--   (1, 'Mechanical Keyboard TKL', 'MK-102', 75, 89.99, '2025-10-28'),
--   (1, '4K Ultra Monitor 32"', 'MU-320', 30, 499.99, '2025-11-01'),
--   (1, 'USB-C Docking Station', 'DS-500', 210, 59.99, '2025-11-03'),
--   (1, 'Noise Cancelling Headset', 'NC-H11', 95, 129.99, '2025-11-05');

-- INSERT INTO delivery_partners (user_id, name, rating, status, region) VALUES
--   (1, 'Swift Logistics Inc.', 4.8, 'Active', 'North America'),
--   (1, 'Reliable Couriers Co.', 4.1, 'Pending Review', 'Europe'),
--   (1, 'Global Haulers Ltd.', 4.9, 'Active', 'Asia-Pacific');
```

**Note:** In production, user records should be created automatically when users sign up via Clerk. The application code will handle associating data with the correct user_id.

## Migration Guide (For Existing Databases)

If you already have data in your Supabase database without user associations, you'll need to migrate it. Here's how:

### Step 1: Add user_id columns to existing tables

```sql
-- Add user_id column to products (if it doesn't exist)
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE products ADD CONSTRAINT fk_products_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id column to delivery_partners (if it doesn't exist)
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE delivery_partners ADD CONSTRAINT fk_delivery_partners_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id column to deliveries (if it doesn't exist)
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE deliveries ADD CONSTRAINT fk_deliveries_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id column to customers (if it doesn't exist)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE customers ADD CONSTRAINT fk_customers_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

### Step 2: Create indexes

```sql
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_user_id ON delivery_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_user_id ON deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
```

### Step 3: Update unique constraint on products

```sql
-- Drop old unique constraint on sku if it exists
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;

-- Add new unique constraint on (user_id, sku)
ALTER TABLE products ADD CONSTRAINT products_user_id_sku_unique UNIQUE (user_id, sku);
```

### Step 4: Migrate existing data

**Important:** Before running this, you need to decide which user should own the existing data. Replace `YOUR_USER_ID` with the actual user_id from the users table.

```sql
-- Update existing products to belong to a specific user
-- Replace YOUR_USER_ID with the actual user_id
UPDATE products SET user_id = YOUR_USER_ID WHERE user_id IS NULL;

-- Update existing delivery_partners
UPDATE delivery_partners SET user_id = YOUR_USER_ID WHERE user_id IS NULL;

-- Update existing deliveries
UPDATE deliveries SET user_id = YOUR_USER_ID WHERE user_id IS NULL;

-- Update existing customers
UPDATE customers SET user_id = YOUR_USER_ID WHERE user_id IS NULL;
```

### Step 5: Make user_id NOT NULL

After all data is migrated, make user_id required:

```sql
ALTER TABLE products ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE delivery_partners ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE deliveries ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE customers ALTER COLUMN user_id SET NOT NULL;
```

## Environment Variables

Make sure to set the following environment variables in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

