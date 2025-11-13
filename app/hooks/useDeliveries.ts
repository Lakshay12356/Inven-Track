'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getDeliveries, updateDeliveryStatus, Delivery } from '@/app/lib/api/deliveries';

export const useDeliveries = () => {
  const { user } = useUser();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const email = user.emailAddresses?.[0]?.emailAddress;
        const data = await getDeliveries(user.id, email);
        setDeliveries(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch deliveries';
        setError(new Error(errorMessage));
        console.error('Error fetching deliveries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [user?.id, user?.emailAddresses]);

  const refreshDeliveries = async () => {
    if (!user?.id) return;

    try {
      const email = user.emailAddresses?.[0]?.emailAddress;
      const data = await getDeliveries(user.id, email);
      setDeliveries(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh deliveries';
      setError(new Error(errorMessage));
      console.error('Error refreshing deliveries:', err);
    }
  };

  const setDeliveryStatus = async (deliveryId: number, status: Delivery['status']) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const email = user.emailAddresses?.[0]?.emailAddress;
      const updatedDelivery = await updateDeliveryStatus(deliveryId, status, user.id, email);
      setDeliveries(prev =>
        prev.map(delivery => (delivery.id === deliveryId ? updatedDelivery : delivery))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update delivery status'));
      throw err;
    }
  };

  return {
    deliveries,
    loading,
    error,
    refreshDeliveries,
    setDeliveryStatus,
  };
};


