# Supabase Database Setup Guide

This guide will help you set up your Supabase database tables for the IMS application.

## Required Tables

### 1. Products Table

Create a table named `products` with the following structure:

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  stock INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Delivery Partners Table

Create a table named `delivery_partners` with the following structure:

```sql
CREATE TABLE delivery_partners (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rating DECIMAL(3, 1) NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Pending Review')),
  region TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Deliveries Table (Optional - for tracking deliveries)

Create a table named `deliveries` with the following structure:

```sql
CREATE TABLE deliveries (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  partner_id BIGINT REFERENCES delivery_partners(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Customers Table (Optional - for customer tracking)

Create a table named `customers` with the following structure:

```sql
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS)

Enable RLS on all tables and create policies as needed. For development, you can temporarily disable RLS or create permissive policies:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your security requirements)
-- For now, allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON delivery_partners
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON deliveries
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON customers
  FOR ALL USING (auth.role() = 'authenticated');
```

## Sample Data

You can insert sample data using the following SQL:

```sql
-- Insert sample products
INSERT INTO products (name, sku, stock, price, last_updated) VALUES
  ('Wireless Mouse Pro', 'WM-001', 150, 29.99, '2025-10-25'),
  ('Mechanical Keyboard TKL', 'MK-102', 75, 89.99, '2025-10-28'),
  ('4K Ultra Monitor 32"', 'MU-320', 30, 499.99, '2025-11-01'),
  ('USB-C Docking Station', 'DS-500', 210, 59.99, '2025-11-03'),
  ('Noise Cancelling Headset', 'NC-H11', 95, 129.99, '2025-11-05');

-- Insert sample delivery partners
INSERT INTO delivery_partners (name, rating, status, region) VALUES
  ('Swift Logistics Inc.', 4.8, 'Active', 'North America'),
  ('Reliable Couriers Co.', 4.1, 'Pending Review', 'Europe'),
  ('Global Haulers Ltd.', 4.9, 'Active', 'Asia-Pacific');
```

## Environment Variables

Make sure to set the following environment variables in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

