'use client';

import { createClient } from '@/app/lib/supabase-client';
import { Product } from '@/app/types';
import { getOrCreateUser } from './users';

// Helper function to convert database row to Product (camelCase)
const mapProductFromDB = (row: any): Product => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  // we can get total stock if we join stock_levels, else 0
  stock: row.stock_levels && Array.isArray(row.stock_levels) 
    ? row.stock_levels.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0)
    : 0,
  price: Number(row.sale_price) || 0,
  lastUpdated: row.updated_at || row.created_at || new Date().toISOString().split('T')[0],
});

export const getProducts = async (clerkUserId: string, email?: string): Promise<Product[]> => {
  const supabase = createClient();
  const userId = await getOrCreateUser(clerkUserId, email);
  
  const { data, error } = await supabase
    .from('products')
    .select('*, stock_levels(quantity)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return (data || []).map(mapProductFromDB) as Product[];
};

export const addProduct = async (product: Omit<Product, 'id'>, clerkUserId: string, email?: string): Promise<Product> => {
  const supabase = createClient();
  const userId = await getOrCreateUser(clerkUserId, email);
  
  const { data, error } = await supabase
    .from('products')
    .insert([{
      user_id: userId,
      name: product.name,
      sku: product.sku,
      sale_price: product.price,
    }])
    .select('*, stock_levels(quantity)')
    .single();

  if (error) {
    console.error('Error adding product:', error);
    throw error;
  }

  // Handle initial stock assignment to the first available store
  if (product.stock && product.stock > 0) {
    // Attempt to resolve a default store
    const { data: userBranches } = await supabase.from('branches').select('id').eq('user_id', userId).limit(1).single();
    if (userBranches?.id) {
      const { data: userStores } = await supabase.from('stores').select('id').eq('branch_id', userBranches.id).limit(1).single();
      if (userStores?.id) {
        await supabase.from('stock_levels').insert({
          product_id: data.id,
          store_id: userStores.id,
          quantity: product.stock,
        });
        
        return {
          ...mapProductFromDB(data),
          stock: product.stock // reflect successfully added stock
        };
      }
    }
  }

  return mapProductFromDB(data);
};

export const updateProduct = async (id: string | number, updates: Partial<Product>, clerkUserId: string, email?: string): Promise<Product> => {
  const supabase = createClient();
  const userId = await getOrCreateUser(clerkUserId, email);
  
  const dbUpdates: any = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
  if (updates.price !== undefined) dbUpdates.sale_price = updates.price;
  
  const { data, error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, stock_levels(quantity)')
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return mapProductFromDB(data);
};

export const deleteProduct = async (id: string | number, clerkUserId: string, email?: string): Promise<void> => {
  const supabase = createClient();
  const userId = await getOrCreateUser(clerkUserId, email);
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
