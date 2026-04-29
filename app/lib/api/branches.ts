'use client';

import { createClient } from '@/app/lib/supabase-client';
import { getOrCreateUser } from './users';

export interface BranchData {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  created_at: string;
}

export const getBranches = async (clerkUserId: string, email?: string): Promise<BranchData[]> => {
  const supabase = createClient();
  const userId = await getOrCreateUser(clerkUserId, email);

  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching branches:', error);
    throw new Error(`Failed to fetch branches: ${error.message}`);
  }

  return data || [];
};

export const addBranch = async (
  branch: { name: string; location?: string },
  clerkUserId: string,
  email?: string
): Promise<BranchData> => {
  const supabase = createClient();
  const userId = await getOrCreateUser(clerkUserId, email);

  const { data, error } = await supabase
    .from('branches')
    .insert([{
      user_id: userId,
      name: branch.name,
      location: branch.location || null,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding branch:', error);
    throw error;
  }

  // Auto-create a store for the new branch
  try {
    await supabase
      .from('stores')
      .insert({ branch_id: data.id, name: `${branch.name} Store`, type: 'warehouse_store' });
  } catch (err) {
    console.error('Failed to auto-create store for branch:', err);
  }

  return data;
};
