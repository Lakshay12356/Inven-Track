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
import Loading from '@/app/components/ui/Loading';

const App: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { products, setProducts, addProduct } = useProducts();
  const { partners } = useDeliveryPartners();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return <Loading size="lg" text="Loading..." fullScreen />;
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
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 overflow-x-hidden overflow-y-auto w-full lg:w-auto">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default App;