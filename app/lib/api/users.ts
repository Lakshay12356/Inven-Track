'use client';

import { createClient } from '@/app/lib/supabase-client';

/**
 * Syncs the Clerk user identity to the Supabase 'profiles' table.
 * Auto-provisions a default branch and store for new managers.
 */
export const getOrCreateUser = async (
  clerkUserId: string,
  email?: string,
  companyName?: string,
  role: 'manager' | 'delivery_partner' = 'delivery_partner'
): Promise<string> => {
  const supabase = createClient();

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', clerkUserId)
    .single();

  if (existingProfile) {
    return existingProfile.id;
  }

  const { data: profile, error: syncError } = await supabase
    .from('profiles')
    .insert({
      id: clerkUserId,
      email,
      role,
      company_name: companyName || null,
    })
    .select('id')
    .single();

  if (syncError) {
    console.error('Error syncing user profile:', {
      message: syncError.message,
      code: syncError.code
    });
    throw new Error(`Identity sync failed: ${syncError.message}`);
  }

  if (!profile) {
    throw new Error('Identity sync failed: No profile data returned');
  }

  // Auto-provision a default branch and store for new managers
  try {
    const { data: branches } = await supabase.from('branches').select('id').eq('user_id', profile.id).limit(1);
    if (!branches || branches.length === 0) {
      const { data: newBranch } = await supabase
        .from('branches')
        .insert({ user_id: profile.id, name: 'HQ Logistics', location: 'Headquarters' })
        .select('id')
        .single();

      if (newBranch) {
        await supabase
          .from('stores')
          .insert({ branch_id: newBranch.id, name: 'Main Warehouse', type: 'warehouse_store' });
      }
    }
  } catch (err) {
    console.error('Failed to auto-provision default store architecture:', err);
  }

  return profile.id;
};

export const getUserRole = async (clerkUserId: string): Promise<'manager' | 'delivery_partner'> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', clerkUserId)
    .single();

  if (error || !data) {
    return 'manager';
  }

  return data.role as 'manager' | 'delivery_partner';
};
