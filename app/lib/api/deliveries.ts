'use client';

import { createClient } from '../supabase-client';
import { getOrCreateUser } from './users';

export interface Delivery {
  id: number;
  partner_id: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_address: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface DeliveryItem {
  id: number;
  delivery_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
}

export interface CreateDeliveryData {
  partnerId: number;
  items: Array<{ productId: number; quantity: number }>;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress: string;
}

export const createDelivery = async (
  deliveryData: CreateDeliveryData,
  clerkUserId: string,
  email?: string
): Promise<{ delivery: Delivery; items: DeliveryItem[] }> => {
  const supabase = createClient();
  
  // Get the Supabase user_id for this Clerk user
  const userId = await getOrCreateUser(clerkUserId, email);
  
  // First, verify that all products have sufficient stock
  const productIds = deliveryData.items.map(item => item.productId);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, stock')
    .in('id', productIds)
    .eq('user_id', userId);

  if (productsError) {
    console.error('Error fetching products:', productsError);
    throw new Error('Failed to verify product availability');
  }

  // Check stock availability
  for (const item of deliveryData.items) {
    const product = products?.find(p => p.id === item.productId);
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product. Available: ${product.stock}, Requested: ${item.quantity}`);
    }
  }

  // Create the delivery record
  const { data: delivery, error: deliveryError } = await supabase
    .from('deliveries')
    .insert([{
      user_id: userId,
      partner_id: deliveryData.partnerId,
      customer_name: deliveryData.customerName,
      customer_email: deliveryData.customerEmail || null,
      customer_phone: deliveryData.customerPhone || null,
      delivery_address: deliveryData.deliveryAddress,
      status: 'pending'
    }])
    .select()
    .single();

  if (deliveryError) {
    console.error('Error creating delivery:', deliveryError);
    throw new Error(`Failed to create delivery: ${deliveryError.message}`);
  }

  // Create delivery items
  const deliveryItems = deliveryData.items.map(item => ({
    delivery_id: delivery.id,
    product_id: item.productId,
    quantity: item.quantity,
  }));

  const { data: items, error: itemsError } = await supabase
    .from('delivery_items')
    .insert(deliveryItems)
    .select();

  if (itemsError) {
    console.error('Error creating delivery items:', itemsError);
    // Try to clean up the delivery record if items creation fails
    await supabase.from('deliveries').delete().eq('id', delivery.id);
    throw new Error(`Failed to create delivery items: ${itemsError.message}`);
  }

  // Update product stock (deduct quantities)
  for (const item of deliveryData.items) {
    const product = products?.find(p => p.id === item.productId);
    if (product) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: product.stock - item.quantity })
        .eq('id', item.productId)
        .eq('user_id', userId);

      if (updateError) {
        console.error(`Error updating stock for product ${item.productId}:`, updateError);
        // Note: We don't throw here to avoid partial updates, but we should log it
      }
    }
  }

  return {
    delivery,
    items: items || [],
  };
};

