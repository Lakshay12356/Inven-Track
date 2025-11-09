'use client';

import React, { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import DashboardContent from '@/app/components/dashboard/DashboardContent';
import InventoryContent from '@/app/components/inventory/InventoryContent';
import DeliveryContent from '@/app/components/delivery/DeliveryContent';
import ProfileContent from '@/app/components/profile/ProfileContent';
import BranchesContent from '@/app/components/branches/BranchesContent';
import { useProducts } from '@/app/hooks/useProducts';
import { useDeliveryPartners } from '@/app/hooks/useDeliveryPartners';

const App: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const { products, setProducts, addProduct } = useProducts();
  const { partners } = useDeliveryPartners();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardContent />;
      case 'Inventory':
        return <InventoryContent products={products} setProducts={setProducts} addProduct={addProduct} />;
      case 'Delivery':
        return <DeliveryContent products={products} partners={partners} />;
      case 'Profile':
        return <ProfileContent />;
      case 'Branches':
        return <BranchesContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <section className="max-w-7xl mx-auto pb-12">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default App;