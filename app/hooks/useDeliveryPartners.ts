'use client';

import { useState, useEffect } from 'react';
import { DeliveryPartner } from '@/app/types';
import { getDeliveryPartners } from '@/app/lib/api/delivery-partners';

export const useDeliveryPartners = () => {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const data = await getDeliveryPartners();
        setPartners(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch delivery partners'));
        console.error('Error fetching delivery partners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  return {
    partners,
    setPartners,
    loading,
    error,
  };
};

