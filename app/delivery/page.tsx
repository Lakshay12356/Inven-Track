'use client';

import React from 'react';
import AppLayout from '@/app/components/layout/AppLayout';
import DeliveryContent from '@/app/components/delivery/DeliveryContent';
import { useProducts } from '@/app/hooks/useProducts';
import { useDeliveryPartners } from '@/app/hooks/useDeliveryPartners';

export default function DeliveryPage() {
  const { products } = useProducts();
  const { partners } = useDeliveryPartners();

  return (
    <AppLayout>
      <DeliveryContent products={products} partners={partners} />
    </AppLayout>
  );
}

