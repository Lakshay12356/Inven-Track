'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { DeliveryPartner } from '@/app/types';
import { getDeliveryPartners } from '@/app/lib/api/delivery-partners';

export const useDeliveryPartners = () => {
  const { user } = useUser();
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const email = user.emailAddresses?.[0]?.emailAddress;
        const data = await getDeliveryPartners(user.id, email);
        setPartners(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch delivery partners';
        setError(new Error(errorMessage));
        console.error('Error fetching delivery partners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [user?.id, user?.emailAddresses]);

  return {
    partners,
    setPartners,
    loading,
    error,
  };
};

