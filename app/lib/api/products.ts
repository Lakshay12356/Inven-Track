'use client';

import { createClient } from '../supabase-client';
import { Product } from '@/app/types';

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

export const getProducts = async (): Promise<Product[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return (data || []).map(mapProductFromDB);
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const supabase = createClient();
  const dbProduct = mapProductToDB(product);
  
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

export const updateProduct = async (id: number, updates: Partial<Product>): Promise<Product> => {
  const supabase = createClient();
  const dbUpdates = mapProductToDB(updates);
  
  const { data, error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return mapProductFromDB(data);
};

export const deleteProduct = async (id: number): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

