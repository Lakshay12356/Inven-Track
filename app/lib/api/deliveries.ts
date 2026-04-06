'use client';

import { createClient } from '../supabase-client';
import { getOrCreateUser } from './users';

export interface InventoryMovement {
  id: string;
  product_id: string;
  from_store_id: string | null;
  to_store_id: string | null;
  delivery_partner_id: string | null;
  type: 'transfer' | 'return' | 'fulfillment' | 'adjustment';
  quantity: number;
  created_at: string;
}

export interface CreateMovementData {
  productId: string;
  fromStoreId?: string;
  toStoreId?: string;
  deliveryPartnerId?: string;
  type: InventoryMovement['type'];
  quantity: number;
}

export const createMovement = async (
  movementData: CreateMovementData,
  clerkUserId: string,
  email?: string
): Promise<InventoryMovement> => {
  const supabase = createClient();
  await getOrCreateUser(clerkUserId, email);

  const { data, error } = await supabase
    .from('inventory_movements')
    .insert([{
      product_id: movementData.productId,
      from_store_id: movementData.fromStoreId || null,
      to_store_id: movementData.toStoreId || null,
      delivery_partner_id: movementData.deliveryPartnerId || null,
      type: movementData.type,
      quantity: movementData.quantity,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating movement:', error);
    throw new Error(`Failed to create movement: ${error.message}`);
  }

  return data as InventoryMovement;
};

export const getMovements = async (
  clerkUserId: string,
  email?: string
): Promise<InventoryMovement[]> => {
  const supabase = createClient();
  const userId = await getOrCreateUser(clerkUserId, email);

  // Get movements for products owned by this user
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
