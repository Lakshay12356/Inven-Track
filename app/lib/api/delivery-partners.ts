'use client';

import { createClient } from '../supabase-client';
import { DeliveryPartner } from '@/app/types';

export const getDeliveryPartners = async (): Promise<DeliveryPartner[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('delivery_partners')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching delivery partners:', error);
    throw error;
  }

  return data || [];
};

export const addDeliveryPartner = async (partner: Omit<DeliveryPartner, 'id'>): Promise<DeliveryPartner> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('delivery_partners')
    .insert([partner])
    .select()
    .single();

  if (error) {
    console.error('Error adding delivery partner:', error);
    throw error;
  }

  return data;
};

