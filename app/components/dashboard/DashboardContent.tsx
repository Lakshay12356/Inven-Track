'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { DollarSign, Package, Truck, Users, BarChart3, TrendingUp } from 'lucide-react';
import Card from '@/app/components/ui/Card';
import Loading from '@/app/components/ui/Loading';
import { getAnalytics } from '@/app/lib/api/analytics';
import { AnalyticsData } from '@/app/types';
import { createClient } from '@/app/lib/supabase-client';
import { getUserRole } from '@/app/lib/api/users';
import DeliveryPartnerDashboard from './DeliveryPartnerDashboard';

const DashboardContent: React.FC = () => {
  const supabase = createClient();
  const { user } = useUser();
  const [role, setRole] = useState<'manager' | 'delivery_partner' | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    productsInStock: 0,
    activeDeliveries: 0,
    newCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUserAndFetchRole = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const userRole = await getUserRole(user.id);
        setRole(userRole);

        if (userRole === 'manager') {
          const email = user.emailAddresses?.[0]?.emailAddress;
          const data = await getAnalytics(user.id, email);
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error in dashboard setup:', error);
      } finally {
        setLoading(false);
      }
    };

    syncUserAndFetchRole();
  }, [user?.id, user?.emailAddresses]);

  if (loading) {
    return <Loading size="md" text="Loading dashboard..." />;
  }

  if (role === 'delivery_partner') {
    return <DeliveryPartnerDashboard />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Welcome section */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white">
          Main Dashboard
        </h1>
        <p className="text-gray-500 dark:text-white/35 mt-1 text-sm">
          Welcome back! Here&apos;s what&apos;s happening with your inventory.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <Card
            title="Total Revenue (YTD)"
            value={`$${analytics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            colorClass="text-green-500"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Card
            title="Products In Stock"
            value={analytics.productsInStock.toLocaleString()}
            icon={Package}
            colorClass="text-blue-500"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <Card
            title="Active Deliveries"
            value={analytics.activeDeliveries.toLocaleString()}
            icon={Truck}
            colorClass="text-amber-500"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Card
            title="New Customers (Q3)"
            value={analytics.newCustomers.toLocaleString()}
            icon={Users}
            colorClass="text-pink-500"
          />
        </div>
      </div>

      {/* Charts & Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Chart panel */}
        <div className="lg:col-span-2 bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] rounded-2xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90">Inventory Value Trend</h2>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-transparent dark:border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              +14.2%
            </div>
          </div>
          <div className="h-48 sm:h-64 flex items-center justify-center bg-white/30 dark:bg-white/[0.02] rounded-xl border border-white/30 dark:border-white/[0.04]">
            <div className="text-center">
              <BarChart3 className="w-10 h-10 text-blue-300/60 dark:text-blue-400/20 mx-auto mb-2" />
              <p className="text-sm text-gray-400 dark:text-white/20">Analytics Chart Placeholder</p>
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] rounded-2xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock Alerts</h2>
          <div className="space-y-3">
            {analytics.stockAlerts && analytics.stockAlerts.length > 0 ? (
              analytics.stockAlerts.map((alert: any) => (
                <div key={alert.product_id} className="p-4 bg-white/40 dark:bg-white/[0.03] rounded-xl border-l-3 border-l-red-400 dark:border-l-red-500/80 transition-all hover:bg-white/60 dark:hover:bg-white/[0.05] hover:translate-x-0.5 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 bg-red-400 dark:bg-red-500 rounded-full animate-pulse dark:shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                        <p className="text-[10px] font-bold text-red-500 dark:text-red-400/90 uppercase tracking-widest">Low Inventory</p>
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white/90 text-sm">{alert.product_name}</h3>
                      <p className="text-[10px] text-gray-400 dark:text-white/20 font-mono mt-0.5">{alert.product_sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-red-500 dark:text-red-400">{alert.total_quantity}</span>
                      <p className="text-[9px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-tighter">Units Left</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 opacity-60">
                <Package className="w-10 h-10 text-gray-300 dark:text-white/10 mb-3" />
                <p className="text-xs font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest">Inventory Stable</p>
                <p className="text-[10px] text-gray-400 dark:text-white/15 text-center mt-1">All products above safety threshold</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;