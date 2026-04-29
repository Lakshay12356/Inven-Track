'use client';

import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Package, MapPin, Phone, User, Clock, Loader2, Star, Navigation } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { DeliveryOrder, getDeliveryOrders, updateOrderStatus } from '@/app/lib/api/deliveries';

const DeliveryPartnerDashboard: React.FC = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const email = user.emailAddresses?.[0]?.emailAddress;
      const data = await getDeliveryOrders(user.id, email);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching partner orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    if (!user?.id) return;
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, status as any, user.id);
      await fetchOrders(); // Refresh
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_transit': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'assigned': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading your assignments...</p>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status === 'assigned' || o.status === 'in_transit');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Partner Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your active deliveries and performance</p>
        </div>
        <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-900/20 px-6 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">4.9 Rating</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass dark:glass-dark p-6 rounded-3xl shadow-lg border border-white/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Active Tasks</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{activeOrders.length}</h3>
            </div>
          </div>
        </div>
        <div className="glass dark:glass-dark p-6 rounded-3xl shadow-lg border border-white/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Delivered</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{completedOrders.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tasks Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Navigation className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Current Assignments</h2>
        </div>

        {activeOrders.length === 0 ? (
          <div className="glass dark:glass-dark p-12 rounded-3xl text-center border border-dashed border-gray-300 dark:border-gray-700">
            <Package className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No active tasks at the moment. Relax!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOrders.map(order => (
              <div key={order.id} className="glass dark:glass-dark rounded-3xl shadow-xl overflow-hidden border border-white/20 flex flex-col group hover:scale-[1.02] transition-all duration-300">
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">#{order.id}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_phone || 'No phone provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{order.customer_address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                      <p className="text-xs text-gray-500">Assigned: {new Date(order.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Package Items</p>
                    <div className="flex flex-wrap gap-2">
                        {order.items?.map(item => (
                            <span key={item.id} className="bg-white/50 dark:bg-white/5 px-3 py-1 rounded-lg text-xs border border-white/10">
                                x{item.quantity} Product
                            </span>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-black/20 border-t border-white/10 flex gap-2">
                  {order.status === 'assigned' ? (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'in_transit')}
                      disabled={updatingOrderId === order.id}
                      className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      {updatingOrderId === order.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-4 h-4" />}
                      Start Delivery
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'completed')}
                      disabled={updatingOrderId === order.id}
                      className="w-full py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                    >
                      {updatingOrderId === order.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Confirm Delivery
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed Section Link (Optional) */}
      <footer className="pt-8 border-t border-white/10">
         <p className="text-center text-sm text-gray-500">Showing {orders.length} total assignments</p>
      </footer>
    </div>
  );
};

export default DeliveryPartnerDashboard;
