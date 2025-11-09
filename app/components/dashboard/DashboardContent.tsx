'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Package, Truck, Users, BarChart3 } from 'lucide-react';
import Card from '@/app/components/ui/Card';
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
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Main Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Revenue (YTD)"
          value={`$${analytics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          colorClass="text-green-600"
        />
        <Card
          title="Products In Stock"
          value={analytics.productsInStock.toLocaleString()}
          icon={Package}
          colorClass="text-indigo-600"
        />
        <Card
          title="Active Deliveries"
          value={analytics.activeDeliveries.toLocaleString()}
          icon={Truck}
          colorClass="text-yellow-600"
        />
        <Card
          title="New Customers (Q3)"
          value={analytics.newCustomers.toLocaleString()}
          icon={Users}
          colorClass="text-pink-600"
        />
      </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Value Trend</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <BarChart3 className="w-10 h-10 text-indigo-300 mr-2" />
          <p className="text-gray-500">Analytics Chart Placeholder</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Stock Alerts</h2>
        <ul className="space-y-3">
          <li className="p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
            <span className="font-medium text-red-800">Low Stock:</span> USB-C Docking Station (10 units)
          </li>
          <li className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-md">
            <span className="font-medium text-yellow-800">Reorder Soon:</span> 4K Ultra Monitor (30 units)
          </li>
        </ul>
      </div>
    </div>
    </div>
  );
};

export default DashboardContent;