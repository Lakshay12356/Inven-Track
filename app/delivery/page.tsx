'use client';

import React from 'react';
import AppLayout from '@/app/components/layout/AppLayout';
import DeliveryContent from '@/app/components/delivery/DeliveryContent';
import { useProducts } from '@/app/hooks/useProducts';
import { useDeliveryPartners } from '@/app/hooks/useDeliveryPartners';
import { useDeliveries } from '@/app/hooks/useDeliveries';

export default function DeliveryPage() {
  const { products, refreshProducts } = useProducts();
  const { partners, addPartner } = useDeliveryPartners();
  const {
    deliveries,
    loading: deliveriesLoading,
    error: deliveriesError,
    refreshDeliveries,
    setDeliveryStatus,
    createOrder,
  } = useDeliveries();

  return (
    <AppLayout>
      <DeliveryContent 
        products={products} 
        partners={partners} 
        addPartner={addPartner}
        createOrder={createOrder}
        refreshProducts={refreshProducts}
        deliveries={deliveries}
        deliveriesLoading={deliveriesLoading}
        deliveriesError={deliveriesError}
        refreshDeliveries={refreshDeliveries}
        onUpdateDeliveryStatus={setDeliveryStatus}
      />
    </AppLayout>
  );
}



