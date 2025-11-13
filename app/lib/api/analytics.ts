'use client';

import { createClient } from '../supabase-client';
import { AnalyticsData } from '@/app/types';
import { getOrCreateUser } from './users';

export const getAnalytics = async (clerkUserId: string, email?: string): Promise<AnalyticsData> => {
  const supabase = createClient();
  
  // Get the Supabase user_id for this Clerk user
  const userId = await getOrCreateUser(clerkUserId, email);
  
  // Calculate revenue from completed deliveries
  let revenueFromDeliveries = 0;
  try {
    // Get all completed deliveries for this user
    const { data: completedDeliveries } = await supabase
      .from('deliveries')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (completedDeliveries && completedDeliveries.length > 0) {
      const deliveryIds = completedDeliveries.map(d => d.id);
      
      // Get all delivery items for completed deliveries
      const { data: deliveryItems } = await supabase
        .from('delivery_items')
        .select('product_id, quantity')
        .in('delivery_id', deliveryIds);

      if (deliveryItems && deliveryItems.length > 0) {
        // Get product prices for all items
        const productIds = [...new Set(deliveryItems.map(item => item.product_id))];
        const { data: products } = await supabase
          .from('products')
          .select('id, price')
          .in('id', productIds)
          .eq('user_id', userId);

        if (products) {
          // Calculate revenue: sum of (price * quantity) for all completed delivery items
          revenueFromDeliveries = deliveryItems.reduce((sum, item) => {
            const product = products.find(p => p.id === item.product_id);
            if (product) {
              return sum + (product.price * item.quantity);
            }
            return sum;
          }, 0);
        }
      }
    }
  } catch (error) {
    console.warn('Error calculating revenue from deliveries:', error);
  }

  // Calculate cost of current inventory (this reduces revenue)
  const { data: products } = await supabase
    .from('products')
    .select('price, stock')
    .eq('user_id', userId);

  const inventoryCost = products?.reduce((sum, p) => sum + (p.price * p.stock), 0) || 0;

  // Total revenue = Revenue from completed deliveries - Cost of current inventory
  // This means:
  // - Adding inventory (increasing stock) decreases revenue (goes negative)
  // - Completing deliveries increases revenue (goes positive)
  const totalRevenue = revenueFromDeliveries - inventoryCost;

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

