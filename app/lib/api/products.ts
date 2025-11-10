'use client';

import { createClient } from '../supabase-client';
import { Product } from '@/app/types';
import { getOrCreateUser } from './users';

// Helper function to convert database row (snake_case) to Product (camelCase)
const mapProductFromDB = (row: any): Product => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  stock: row.stock,
  price: row.price,
  lastUpdated: row.last_updated || row.lastUpdated || new Date().toISOString().split('T')[0],
});

// Helper function to convert Product (camelCase) to database row (snake_case)
const mapProductToDB = (product: Omit<Product, 'id'> | Partial<Product>) => {
  const dbProduct: any = {};
  
  if (product.name !== undefined) dbProduct.name = product.name;
  if (product.sku !== undefined) dbProduct.sku = product.sku;
  if (product.stock !== undefined) dbProduct.stock = product.stock;
  if (product.price !== undefined) dbProduct.price = product.price;
  if (product.lastUpdated !== undefined) {
    dbProduct.last_updated = product.lastUpdated;
  } else if (product.name !== undefined || product.sku !== undefined || product.stock !== undefined || product.price !== undefined) {
    // Only set last_updated if we're actually updating something
    dbProduct.last_updated = new Date().toISOString().split('T')[0];
  }
  
  return dbProduct;
};

export const getProducts = async (clerkUserId: string, email?: string): Promise<Product[]> => {
  const supabase = createClient();
  
  // Get the Supabase user_id for this Clerk user
  const userId = await getOrCreateUser(clerkUserId, email);
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching products:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to fetch products: ${error.message || JSON.stringify(error)}`);
  }

  return (data || []).map(mapProductFromDB);
};

export const addProduct = async (product: Omit<Product, 'id'>, clerkUserId: string, email?: string): Promise<Product> => {
  const supabase = createClient();
  
  // Get the Supabase user_id for this Clerk user
  const userId = await getOrCreateUser(clerkUserId, email);
  
  const dbProduct = mapProductToDB(product);
  dbProduct.user_id = userId;
  
  const { data, error } = await supabase
    .from('products')
    .insert([dbProduct])
    .select()
    .single();

  if (error) {
    console.error('Error adding product:', error);
    throw error;
  }

  return mapProductFromDB(data);
};

export const updateProduct = async (id: number, updates: Partial<Product>, clerkUserId: string, email?: string): Promise<Product> => {
  const supabase = createClient();
  
  // Get the Supabase user_id for this Clerk user
  const userId = await getOrCreateUser(clerkUserId, email);
  
  const dbUpdates = mapProductToDB(updates);
  
  const { data, error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId) // Ensure user can only update their own products
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return mapProductFromDB(data);
};

export const deleteProduct = async (id: number, clerkUserId: string, email?: string): Promise<void> => {
  const supabase = createClient();
  
  // Get the Supabase user_id for this Clerk user
  const userId = await getOrCreateUser(clerkUserId, email);
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // Ensure user can only delete their own products

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

