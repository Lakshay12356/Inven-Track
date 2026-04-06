'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { DeliveryPartner } from '@/app/types';
import { getDeliveryPartners, addDeliveryPartner as addDeliveryPartnerToDB, DeliveryPartnerData } from '@/app/lib/api/delivery-partners';

const mapToDeliveryPartner = (data: DeliveryPartnerData): DeliveryPartner => ({
  id: data.id,
  name: data.company_name,
  rating: 4.5, // Mock data
  status: 'Active', // Mock data
  region: 'Local Region', // Mock data
});

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
        setPartners(data.map(mapToDeliveryPartner));
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

  const addPartner = async (partner: Omit<DeliveryPartner, 'id'>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      const email = user.emailAddresses?.[0]?.emailAddress;
      // @ts-ignore - The API now automatically resolves the store ID if omitted
      const newPartnerData = await addDeliveryPartnerToDB({ company_name: partner.name, ...partner }, user.id, email);
      const newPartner = mapToDeliveryPartner(newPartnerData);
      setPartners(prev => [newPartner, ...prev]);
      return newPartner;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add delivery partner'));
      throw err;
    }
  };

  return {
    partners,
    setPartners,
    addPartner,
    loading,
    error,
  };
};

