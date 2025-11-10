'use client';

import { createClient } from '../supabase-client';
import { DeliveryPartner } from '@/app/types';
import { getOrCreateUser } from './users';

export const getDeliveryPartners = async (clerkUserId: string, email?: string): Promise<DeliveryPartner[]> => {
  const supabase = createClient();
  
  // Get the Supabase user_id for this Clerk user
  const userId = await getOrCreateUser(clerkUserId, email);
  
  const { data, error } = await supabase
    .from('delivery_partners')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching delivery partners:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to fetch delivery partners: ${error.message || JSON.stringify(error)}`);
  }

  return data || [];
};

export const addDeliveryPartner = async (partner: Omit<DeliveryPartner, 'id'>, clerkUserId: string, email?: string): Promise<DeliveryPartner> => {
  const supabase = createClient();
  
  // Get the Supabase user_id for this Clerk user
  const userId = await getOrCreateUser(clerkUserId, email);
  
  const partnerWithUserId = { ...partner, user_id: userId };
  
  const { data, error } = await supabase
    .from('delivery_partners')
    .insert([partnerWithUserId])
    .select()
    .single();

  if (error) {
    console.error('Error adding delivery partner:', error);
    throw error;
  }

  return data;
};

