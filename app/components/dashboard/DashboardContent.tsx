'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { DollarSign, Package, Truck, Users, BarChart3 } from 'lucide-react';
import Card from '@/app/components/ui/Card';
import Loading from '@/app/components/ui/Loading';
import { getAnalytics } from '@/app/lib/api/analytics';
import { AnalyticsData } from '@/app/types';
import { supabase } from '@/app/lib/supabase';

const DashboardContent: React.FC = () => {
  const { user } = useUser();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    productsInStock: 0,
    activeDeliveries: 0,
    newCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUserToProfiles = async () => {
      if (!user?.id) return;
      
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            email: user.emailAddresses?.[0]?.emailAddress 
          }, { onConflict: 'id' });

        if (error) throw error;
      } catch (error) {
        console.error('Error syncing user to profiles:', error);
      }
    };

    const fetchAnalytics = async () => {
      if (!user?.id) return;
      
      try {
        await syncUserToProfiles(); // Sync before fetch
        const email = user.emailAddresses?.[0]?.emailAddress;
        const data = await getAnalytics(user.id, email);
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id, user?.emailAddresses]);

  if (loading) {
    return <Loading size="md" text="Loading dashboard..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100">Main Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card
          title="Total Revenue (YTD)"
          value={`$${analytics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          colorClass="text-green-500"
        />
        <Card
          title="Products In Stock"
          value={analytics.productsInStock.toLocaleString()}
          icon={Package}
          colorClass="text-blue-500"
        />
        <Card
          title="Active Deliveries"
          value={analytics.activeDeliveries.toLocaleString()}
          icon={Truck}
          colorClass="text-amber-500"
        />
        <Card
          title="New Customers (Q3)"
          value={analytics.newCustomers.toLocaleString()}
          icon={Users}
          colorClass="text-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 glass dark:glass-dark glass-hover p-4 sm:p-6 rounded-3xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Inventory Value Trend</h2>
          <div className="h-48 sm:h-64 flex items-center justify-center glass dark:glass-dark rounded-2xl border border-white/30 dark:border-white/10">
            <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-300 dark:text-blue-400 mr-2" />
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Analytics Chart Placeholder</p>
          </div>
        </div>
        <div className="glass dark:glass-dark glass-hover p-4 sm:p-6 rounded-3xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Stock Alerts</h2>
          <div className="space-y-4">
            {analytics.stockAlerts && analytics.stockAlerts.length > 0 ? (
              analytics.stockAlerts.map((alert: any) => (
                <div key={alert.product_id} className="p-4 glass dark:glass-dark rounded-2xl border-l-4 border-red-500 shadow-sm transition-all hover:translate-x-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1 italic">Low Inventory</p>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{alert.product_name}</h3>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{alert.product_sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-red-600 dark:text-red-400">{alert.total_quantity}</span>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Units Left</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 opacity-50">
                <Package className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Inventory Stable</p>
                <p className="text-[10px] text-gray-500 text-center mt-1">All products above safety threshold</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;