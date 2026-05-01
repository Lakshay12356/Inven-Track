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
      case 'completed': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'in_transit': return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'assigned': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
      default: return 'bg-gray-50 text-gray-700 dark:bg-white/5 dark:text-white/40 dark:border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-gray-400 dark:text-white/20 text-sm">Loading your assignments...</p>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status === 'assigned' || o.status === 'in_transit');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Partner Dashboard</h1>
          <p className="text-gray-500 dark:text-white/35 mt-1 text-sm">Manage your active deliveries and performance</p>
        </div>
        <div className="flex items-center gap-3 bg-amber-50/60 dark:bg-amber-500/10 px-5 py-2.5 rounded-xl border border-amber-200/30 dark:border-amber-500/20 shadow-sm">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold text-amber-700 dark:text-amber-300">4.9 Rating</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl p-5 rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20 dark:shadow-blue-500/30">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/35 font-medium uppercase tracking-wider">Active Tasks</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{activeOrders.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl p-5 rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/35 font-medium uppercase tracking-wider">Total Delivered</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{completedOrders.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tasks Section */}
      <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center gap-3">
          <Navigation className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-white/90">Current Assignments</h2>
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl p-12 rounded-2xl text-center border border-dashed border-gray-300/40 dark:border-white/10 shadow-sm">
            <Package className="w-12 h-12 text-gray-200 dark:text-white/5 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-white/20 text-sm">No active tasks at the moment. Relax!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map(order => (
              <div key={order.id} className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_16px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300">
                <div className="p-5 space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-white/20 font-mono">#{order.id}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-gray-400 dark:text-white/25 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{order.customer_name}</p>
                        <p className="text-xs text-gray-400 dark:text-white/25">{order.customer_phone || 'No phone provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-red-400 dark:text-red-400/80 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-500 dark:text-white/35 line-clamp-2">{order.customer_address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-indigo-400 dark:text-indigo-400/80 flex-shrink-0" />
                      <p className="text-xs text-gray-400 dark:text-white/25">{new Date(order.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200/20 dark:border-white/[0.04]">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest mb-2">Package Items</p>
                    <div className="flex flex-wrap gap-1.5">
                        {order.items?.map(item => (
                            <span key={item.id} className="bg-white/50 dark:bg-white/[0.04] px-2.5 py-1 rounded-lg text-[10px] border border-white/30 dark:border-white/[0.06] text-gray-600 dark:text-white/40">
                                x{item.quantity} Product
                            </span>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/20 dark:bg-white/[0.02] border-t border-gray-200/20 dark:border-white/[0.04] flex gap-2">
                  {order.status === 'assigned' ? (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'in_transit')}
                      disabled={updatingOrderId === order.id}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {updatingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                      Start Delivery
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'completed')}
                      disabled={updatingOrderId === order.id}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {updatingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
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
      <footer className="pt-6 border-t border-gray-200/20 dark:border-white/[0.04]">
         <p className="text-center text-xs text-gray-400 dark:text-white/15">Showing {orders.length} total assignments</p>
      </footer>
    </div>
  );
};

export default DeliveryPartnerDashboard;
