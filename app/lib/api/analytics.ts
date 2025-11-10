'use client';

import { createClient } from '../supabase-client';
import { AnalyticsData } from '@/app/types';
import { getOrCreateUser } from './users';

export const getAnalytics = async (clerkUserId: string, email?: string): Promise<AnalyticsData> => {
  const supabase = createClient();
  
  // Get the Supabase user_id for this Clerk user
  const userId = await getOrCreateUser(clerkUserId, email);
  
  // Get total revenue from products (sum of price * stock) for this user
  const { data: products } = await supabase
    .from('products')
    .select('price, stock')
    .eq('user_id', userId);

  const totalRevenue = products?.reduce((sum, p) => sum + (p.price * p.stock), 0) || 0;

  // Get products in stock count for this user
  const { count: productsInStock } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gt('stock', 0);

  // Get active deliveries count for this user
  let activeDeliveries = 0;
  try {
    const { count } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['active', 'pending']);
    activeDeliveries = count || 0;
  } catch (error) {
    // Table might not exist yet, default to 0
    console.warn('Deliveries table not found, defaulting to 0');
  }

  // Get new customers count for this user
  let newCustomers = 0;
  try {
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    newCustomers = count || 0;
  } catch (error) {
    // Table might not exist yet, default to 0
    console.warn('Customers table not found, defaulting to 0');
  }

  return {
    totalRevenue: totalRevenue || 0,
    productsInStock: productsInStock || 0,
    activeDeliveries: activeDeliveries || 0,
    newCustomers: newCustomers || 0,
  };
};

