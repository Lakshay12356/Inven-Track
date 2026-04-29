'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getBranches, addBranch as addBranchToDB, BranchData } from '@/app/lib/api/branches';

export const useBranches = () => {
  const { user } = useUser();
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBranches = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const email = user.emailAddresses?.[0]?.emailAddress;
      const data = await getBranches(user.id, email);
      setBranches(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch branches';
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [user?.id, user?.emailAddresses]);

  const createBranch = async (branch: { name: string; location?: string }) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      const email = user.emailAddresses?.[0]?.emailAddress;
      const newBranch = await addBranchToDB(branch, user.id, email);
      setBranches(prev => [newBranch, ...prev]);
      return newBranch;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add branch');
    }
  };

  return {
    branches,
    loading,
    error,
    createBranch,
    refreshBranches: fetchBranches,
  };
};
