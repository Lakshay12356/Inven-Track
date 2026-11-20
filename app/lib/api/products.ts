'use client';

import { createClient } from '@/app/lib/supabase-client';
import { Product } from '@/app/types';
import { getOrCreateUser } from './users';

const mapProductFromDB = (row: any): Product => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  quantity: row.quantity || 0,
  price: Number(row.sale_price) || 0,
  buyPrice: Number(row.buy_price) || 0,
  lastUpdated: row.updated_at || row.created_at || new Date().toISOString().split('T')[0],
});

export const getProducts = async (clerkUserId: string, email?: string): Promise<Product[]> => {
  const supabase = createClient();
  const userId = await getOrCreateUser(clerkUserId, email);

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return (data || []).map(mapProductFromDB) as Product[];
};

// H-03: mutations go through server API routes — user identity derived server-side from auth()
export const addProduct = async (product: Omit<Product, 'id'>, _clerkUserId?: string, _email?: string): Promise<Product> => {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:     product.name,
      sku:      product.sku,
      quantity: product.quantity || 0,
      price:    product.price,
      buyPrice: product.buyPrice,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add product');
  }
  return mapProductFromDB(await res.json());
};

export const updateProduct = async (id: string | number, updates: Partial<Product>, _clerkUserId?: string, _email?: string): Promise<Product> => {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:     updates.name,
      sku:      updates.sku,
      quantity: updates.quantity,
      price:    updates.price,
      buyPrice: updates.buyPrice,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update product');
  }
  return mapProductFromDB(await res.json());
};

export const deleteProduct = async (id: string | number, _clerkUserId?: string, _email?: string): Promise<void> => {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete product');
  }
};
