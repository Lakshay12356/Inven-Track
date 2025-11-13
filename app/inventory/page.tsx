'use client';

import React from 'react';
import AppLayout from '@/app/components/layout/AppLayout';
import InventoryContent from '@/app/components/inventory/InventoryContent';
import { useProducts } from '@/app/hooks/useProducts';

export default function InventoryPage() {
  const { products, setProducts, addProduct } = useProducts();

  return (
    <AppLayout>
      <InventoryContent products={products} setProducts={setProducts} addProduct={addProduct} />
    </AppLayout>
  );
}




