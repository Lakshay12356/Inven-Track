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
  managerId: string;
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

export const updateOrderStatus = async (
  orderId: string,
  status: DeliveryOrder['status'],
  clerkUserId: string
): Promise<DeliveryOrder> => {
  const response = await fetch('/api/delivery-orders/status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId, status, clerkUserId }),
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

  // First, if this user is a delivery partner, find their internal partner ID
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
    // Show orders where they are the manager OR the assigned partner
    query = query.or(`manager_id.eq.${userId},delivery_partner_id.eq.${partnerData.id}`);
  } else {
    // Show orders where they are the manager
    query = query.eq('manager_id', userId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching delivery orders:', error);
    throw new Error(`Failed to fetch delivery orders: ${error.message}`);
  }

  return (data || []) as DeliveryOrder[];
};

// Backwards compatibility for inventory movements
export interface InventoryMovement {
  id: string;
  product_id: string;
  from_store_id: string | null;
  to_store_id: string | null;
  delivery_partner_id: string | null;
  delivery_order_id: string | null;
  type: 'transfer' | 'return' | 'fulfillment' | 'adjustment';
  quantity: number;
  created_at: string;
}

export const getMovements = async (
  clerkUserId: string,
  email?: string
): Promise<InventoryMovement[]> => {
  const supabase = createClient();
  const userId = await getOrCreateUser(clerkUserId, email);

  const { data: userProducts } = await supabase
    .from('products')
    .select('id')
    .eq('user_id', userId);

  if (!userProducts || userProducts.length === 0) return [];

  const productIds = userProducts.map(p => p.id);

  const { data, error } = await supabase
    .from('inventory_movements')
    .select('*')
    .in('product_id', productIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching movements:', error);
    throw new Error(`Failed to fetch movements: ${error.message}`);
  }

  return (data || []) as InventoryMovement[];
};
