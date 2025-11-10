'use client';

import { createClient } from '../supabase-client';

/**
 * Get or create a user in Supabase based on Clerk user ID
 * Returns the Supabase user_id (BIGINT) for use in other tables
 */
export const getOrCreateUser = async (clerkUserId: string, email?: string): Promise<number> => {
  const supabase = createClient();
  
  // First, try to get existing user
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle(); // Use maybeSingle() instead of single() to handle not found gracefully

  // If user exists, return it
  if (existingUser) {
    return existingUser.id;
  }

  // If there was an error other than "not found", log it but continue to try creating
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.warn('Error fetching user (will try to create):', fetchError);
  }

  // If user doesn't exist, create it
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{ clerk_user_id: clerkUserId, email }])
    .select('id')
    .single();

  if (insertError) {
    console.error('Error creating user:', {
      message: insertError.message,
      details: insertError.details,
      hint: insertError.hint,
      code: insertError.code
    });
    throw new Error(`Failed to create user: ${insertError.message || JSON.stringify(insertError)}`);
  }

  if (!newUser) {
    throw new Error('Failed to create user: No data returned');
  }

  return newUser.id;
};

