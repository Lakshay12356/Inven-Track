'use client';

import { createClient } from '@/app/lib/supabase-client';
import { getOrCreateUser } from './users';

export interface DeliveryPartnerData {
  id: string;
  store_id: string;
  company_name: string;
  contact_info: string | null;
  rating: number | null;
  status: 'Active' | 'Pending Review';
  region: string | null;
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
  partner: { store_id?: string; company_name: string; contact_info?: string; rating?: number; status?: 'Active' | 'Pending Review'; region?: string; email?: string; password?: string },
  clerkUserId: string,
  email?: string
): Promise<DeliveryPartnerData> => {
  const response = await fetch('/api/delivery-partners/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...partner,
      clerkUserId,
      // email is passed from the component state now
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create delivery partner');
  }

  return response.json();
};
