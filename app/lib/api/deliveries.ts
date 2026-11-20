'use client';

import { createClient } from '@/app/lib/supabase-client';
import { getOrCreateUser } from './users';

export interface DeliveryOrder {
  id: string;
  manager_id: string;
  delivery_partner_id: string | null;
  customer_name: string;
  customer_address: string;
  customer_phone: string | null;
  status: 'pending' | 'assigned' | 'in_transit' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  items?: DeliveryOrderItem[];
}

export interface DeliveryOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
}

export interface CreateOrderData {
  partnerId?: string;
  customerName: string;
  customerAddress: string;
  customerPhone?: string;
  items: Array<{ productId: string; quantity: number }>;
}

export const createDeliveryOrder = async (
  orderData: CreateOrderData
): Promise<DeliveryOrder> => {
  const response = await fetch('/api/delivery-orders/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create delivery order');
  }

  return response.json();
};

// H-03: clerkUserId removed from body — server derives identity from auth()
export const updateOrderStatus = async (
  orderId: string,
  status: DeliveryOrder['status'],
  _clerkUserId?: string
): Promise<DeliveryOrder> => {
  const response = await fetch('/api/delivery-orders/status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId, status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update order status');
  }

  return response.json();
};

export const getDeliveryOrders = async (
  clerkUserId: string,
  email?: string
): Promise<DeliveryOrder[]> => {
  const supabase = createClient();
  const userId = await getOrCreateUser(clerkUserId, email);

  // Check if this user is a delivery partner
  const { data: partnerData } = await supabase
    .from('delivery_partners')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  let query = supabase
    .from('delivery_orders')
    .select(`
      *,
      items:delivery_order_items(*)
    `);

  if (partnerData?.id) {
    // Partner sees orders where they are manager OR assigned partner
    query = query.or(`manager_id.eq.${userId},delivery_partner_id.eq.${partnerData.id}`);
  } else {
    // Manager sees only their own orders
    query = query.eq('manager_id', userId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching delivery orders:', error);
    throw new Error(`Failed to fetch delivery orders: ${error.message}`);
  }

  return (data || []) as DeliveryOrder[];
};
