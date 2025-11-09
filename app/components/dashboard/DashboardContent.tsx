'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Package, Truck, Users, BarChart3 } from 'lucide-react';
import Card from '@/app/components/ui/Card';
import Loading from '@/app/components/ui/Loading';
import { getAnalytics } from '@/app/lib/api/analytics';
import { AnalyticsData } from '@/app/types';

const DashboardContent: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    productsInStock: 0,
    activeDeliveries: 0,
    newCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
          <ul className="space-y-2 sm:space-y-3">
            <li className="p-3 sm:p-4 glass dark:glass-dark rounded-2xl border-l-4 border-red-400 dark:border-red-500">
              <span className="font-medium text-red-700 dark:text-red-400">Low Stock:</span> USB-C Docking Station (10 units)
            </li>
            <li className="p-3 sm:p-4 glass dark:glass-dark rounded-2xl border-l-4 border-amber-400 dark:border-amber-500">
              <span className="font-medium text-amber-700 dark:text-amber-400">Reorder Soon:</span> 4K Ultra Monitor (30 units)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;