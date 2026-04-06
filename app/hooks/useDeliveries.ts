'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getMovements, InventoryMovement } from '@/app/lib/api/deliveries';

export const useDeliveries = () => {
  const { user } = useUser();
  const [deliveries, setDeliveries] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMovements = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const email = user.emailAddresses?.[0]?.emailAddress;
        const data = await getMovements(user.id, email);
        setDeliveries(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch movements';
        setError(new Error(errorMessage));
        console.error('Error fetching movements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, [user?.id, user?.emailAddresses]);

  const refreshDeliveries = async () => {
    if (!user?.id) return;

    try {
      const email = user.emailAddresses?.[0]?.emailAddress;
      const data = await getMovements(user.id, email);
      setDeliveries(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh movements';
      setError(new Error(errorMessage));
      console.error('Error refreshing movements:', err);
    }
  };

  const setDeliveryStatus = async (_movementId: string | number, _status: string) => {
    console.warn('Movement status updates not yet implemented in new schema');
  };

  return {
    deliveries,
    loading,
    error,
    refreshDeliveries,
    setDeliveryStatus,
  };
};
