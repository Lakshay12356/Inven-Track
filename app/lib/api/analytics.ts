'use client';

import { createClient } from '../supabase-client';
import { AnalyticsData } from '@/app/types';

export const getAnalytics = async (): Promise<AnalyticsData> => {
  const supabase = createClient();
  
  // Get total revenue from products (sum of price * stock)
  const { data: products } = await supabase
    .from('products')
    .select('price, stock');

  const totalRevenue = products?.reduce((sum, p) => sum + (p.price * p.stock), 0) || 0;

  // Get products in stock count
  const { count: productsInStock } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .gt('stock', 0);

  // Get active deliveries count (you might need to create a deliveries table)
  let activeDeliveries = 0;
  try {
    const { count } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'pending']);
    activeDeliveries = count || 0;
  } catch (error) {
    // Table might not exist yet, default to 0
    console.warn('Deliveries table not found, defaulting to 0');
  }

  // Get new customers count (you might need to create a customers table)
  let newCustomers = 0;
  try {
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
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

