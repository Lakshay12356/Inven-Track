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

// H-03: mutations go through server API route — user identity derived server-side from auth()
export const addBranch = async (
  branch: { name: string; location?: string },
  _clerkUserId?: string,
  _email?: string
): Promise<BranchData> => {
  const res = await fetch('/api/branches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: branch.name, location: branch.location }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add branch');
  }
  return res.json();
};
