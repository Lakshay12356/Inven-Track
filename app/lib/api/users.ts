'use client';

import { createClient } from '../supabase-client';

/**
 * Syncs the Clerk user identity to the Supabase 'profiles' table.
 * Returns the Clerk User ID (UUID) for use in other tables.
 */
export const getOrCreateUser = async (clerkUserId: string, email?: string): Promise<string> => {
  const supabase = createClient();
  
  // Try to get or create user in one 'upsert' operation
  const { data: profile, error: syncError } = await supabase
    .from('profiles')
    .upsert({ 
      id: clerkUserId, 
      email 
    }, { onConflict: 'id' })
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

  // Auto-provision a default branch and store if this is a brand new account!
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

