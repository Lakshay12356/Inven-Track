'use client';

import { createClient } from '../supabase-client';
import { getOrCreateUser } from './users';

export interface DeliveryPartnerData {
  id: string;
  store_id: string;
  company_name: string;
  contact_info: string | null;
  created_at: string;
}

export const getDeliveryPartners = async (clerkUserId: string, email?: string): Promise<DeliveryPartnerData[]> => {
  const supabase = createClient();
  const userId = await getOrCreateUser(clerkUserId, email);

  // Get stores that belong to branches owned by this user
  const { data: userBranches } = await supabase
    .from('branches')
    .select('id')
    .eq('user_id', userId);

  if (!userBranches || userBranches.length === 0) return [];

  const branchIds = userBranches.map(b => b.id);

  const { data: userStores } = await supabase
    .from('stores')
    .select('id')
    .in('branch_id', branchIds);

  if (!userStores || userStores.length === 0) return [];

  const storeIds = userStores.map(s => s.id);

  const { data, error } = await supabase
    .from('delivery_partners')
    .select('*')
    .in('store_id', storeIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching delivery partners:', error);
    throw new Error(`Failed to fetch delivery partners: ${error.message}`);
  }

  return data || [];
};

export const addDeliveryPartner = async (
  partner: { store_id?: string; company_name: string; contact_info?: string },
  clerkUserId: string,
  email?: string
): Promise<DeliveryPartnerData> => {
  const supabase = createClient();
  const userId = await getOrCreateUser(clerkUserId, email);

  let targetStoreId = partner.store_id;

  // Resolve a default store if one isn't explicitly provided
  if (!targetStoreId) {
    const { data: userBranches } = await supabase.from('branches').select('id').eq('user_id', userId).limit(1).single();
    if (userBranches?.id) {
      const { data: userStores } = await supabase.from('stores').select('id').eq('branch_id', userBranches.id).limit(1).single();
      if (userStores?.id) {
         targetStoreId = userStores.id;
      }
    }
  }

  if (!targetStoreId) {
    throw new Error('No store available to attach the delivery partner to. Please create a store first.');
  }

  const { data, error } = await supabase
    .from('delivery_partners')
    .insert([{
      store_id: targetStoreId,
      company_name: partner.company_name,
      contact_info: partner.contact_info || null,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding delivery partner:', error);
    throw error;
  }

  return data;
};
