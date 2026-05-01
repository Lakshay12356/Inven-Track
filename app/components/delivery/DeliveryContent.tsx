'use client';

import React, { useCallback, useState } from 'react';
import { Truck, Plus, Package, RefreshCw, MapPin, Phone, User, Clock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Product, DeliveryPartner } from '@/app/types';
import AddDeliveryPartnerModal from './AddDeliveryPartnerModal';
import AssignDeliveryModal from './AssignDeliveryModal';
import { DeliveryOrder } from '@/app/lib/api/deliveries';

interface DeliveryContentProps {
  products: Product[];
  partners: DeliveryPartner[];
  deliveries: DeliveryOrder[];
  deliveriesLoading: boolean;
  deliveriesError: Error | null;
  addPartner: (partner: Omit<DeliveryPartner, 'id'> & { email?: string; password?: string }) => Promise<DeliveryPartner>;
  createOrder: (data: any) => Promise<DeliveryOrder>;
  refreshProducts?: () => Promise<void> | void;
  refreshDeliveries: () => Promise<void>;
  onUpdateDeliveryStatus: (deliveryId: string | number, status: string) => Promise<any>;
}

const DeliveryContent: React.FC<DeliveryContentProps> = ({
  products,
  partners,
  deliveries,
  deliveriesLoading,
  deliveriesError,
  addPartner,
  createOrder,
  refreshProducts,
  refreshDeliveries,
  onUpdateDeliveryStatus,
}) => {
  const { user } = useUser();
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRefreshingDeliveries, setIsRefreshingDeliveries] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | number | null>(null);

  const clearMessageAfterDelay = useCallback(() => {
    setTimeout(() => setAssignmentMessage(''), 5000);
  }, []);

  const refreshProductsIfNeeded = useCallback(async () => {
    if (refreshProducts) {
      await refreshProducts();
    }
  }, [refreshProducts]);

  const handleAssignDelivery = async (data: {
    partnerId: string | number;
    items: Array<{ productId: string | number; quantity: number }>;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
  }) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      await createOrder({
        partnerId: String(data.partnerId),
        customerName: data.customerName,
        customerAddress: data.deliveryAddress,
        customerPhone: data.customerPhone,
        items: data.items,
      });

      await Promise.all([refreshProductsIfNeeded(), refreshDeliveries()]);

      const partnerName = partners.find(p => String(p.id) === String(data.partnerId))?.name || 'Partner';
      setAssignmentMessage(
        `Successfully created delivery order for ${data.customerName} and assigned to ${partnerName}.`
      );
      clearMessageAfterDelay();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create delivery order';
      const message = `Error: ${errorMessage}`;
      setAssignmentMessage(message);
      clearMessageAfterDelay();
      throw err instanceof Error ? err : new Error(message);
    }
  };

  const handleStatusUpdate = async (orderId: string | number, status: string) => {
    try {
      setUpdatingOrderId(orderId);
      await onUpdateDeliveryStatus(orderId, status);
      await refreshDeliveries();
      setAssignmentMessage(`Successfully updated order #${orderId} status to ${status}.`);
      clearMessageAfterDelay();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setAssignmentMessage(`Error: ${errorMessage}`);
      clearMessageAfterDelay();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'in_transit': return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'assigned': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
      case 'cancelled': return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      default: return 'bg-gray-50 text-gray-700 dark:bg-white/5 dark:text-white/40 dark:border-white/10';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white">Delivery Management</h1>
          <p className="text-gray-500 dark:text-white/35 mt-1 text-sm">Track and manage all delivery operations</p>
        </div>
      </div>

      {/* Assignment Panel */}
      <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl p-5 sm:p-6 rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] border-l-4 border-l-indigo-400 dark:border-l-indigo-500 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Assign Delivery</h2>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all duration-200 text-sm"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            New Delivery Assignment
          </button>
        </div>

        {assignmentMessage && (
          <div
            className={`mt-3 p-3 rounded-xl text-sm font-medium ${
              assignmentMessage.startsWith('Successfully')
                ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-200/40 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-50/50 dark:bg-red-500/10 border border-red-200/40 dark:border-red-500/20 text-red-700 dark:text-red-400'
            }`}
          >
            {assignmentMessage}
          </div>
        )}
      </div>

      {/* Deliveries Overview */}
      <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 sm:p-6 border-b border-gray-200/20 dark:border-white/[0.04] gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-transparent dark:border-indigo-500/20 shadow-sm">
              <Package className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Delivery Orders</h2>
              <p className="text-xs text-gray-500 dark:text-white/35">Track multi-item shipments and partner status</p>
            </div>
          </div>
          <button
            onClick={async () => {
                setIsRefreshingDeliveries(true);
                await refreshDeliveries();
                setIsRefreshingDeliveries(false);
            }}
            disabled={isRefreshingDeliveries}
            className="flex items-center px-4 py-2 bg-white/50 dark:bg-white/[0.05] border border-white/50 dark:border-white/[0.08] text-gray-600 dark:text-white/70 font-medium rounded-xl hover:bg-white/70 dark:hover:bg-white/[0.08] transition-all duration-200 disabled:opacity-50 text-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingDeliveries ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          {deliveriesError && (
            <div className="p-3 rounded-xl bg-red-50/50 dark:bg-red-500/10 border border-red-200/40 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {deliveriesError.message}
            </div>
          )}
          {deliveriesLoading ? (
            <div className="p-8 text-center text-gray-400 dark:text-white/20">
              Loading deliveries...
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-white/20">
              No delivery orders have been created yet.
            </div>
          ) : (
            deliveries.map(order => (
              <div
                key={order.id}
                className="bg-white/30 dark:bg-white/[0.03] p-5 rounded-xl border border-white/30 dark:border-white/[0.05] space-y-4 hover:bg-white/50 dark:hover:bg-white/[0.05] transition-all duration-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex-shrink-0 border border-transparent dark:border-indigo-500/20">
                      <Truck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
                        Order #{order.id}
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm text-gray-500 dark:text-white/35">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5" />
                          {order.customer_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {order.customer_address}
                        </div>
                        {order.customer_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" />
                            {order.customer_phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(order.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'assigned' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'in_transit')}
                        disabled={updatingOrderId === order.id}
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-xl shadow-md shadow-blue-500/15 hover:bg-blue-600 transition-all disabled:opacity-50"
                      >
                        Mark In Transit
                      </button>
                    )}
                    {order.status === 'in_transit' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                        disabled={updatingOrderId === order.id}
                        className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-xl shadow-md shadow-emerald-500/15 hover:bg-emerald-600 transition-all disabled:opacity-50"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white/30 dark:bg-white/[0.02] rounded-xl p-4 border border-transparent dark:border-white/[0.04]">
                  <h4 className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-wider mb-2">Order Items</h4>
                  <div className="space-y-1.5">
                    {order.items?.map(item => {
                        const product = products.find(p => String(p.id) === String(item.product_id));
                        return (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-white/50">
                                {product?.name || `Product #${item.product_id}`}
                            </span>
                            <span className="font-medium text-gray-800 dark:text-white/80">x{item.quantity}</span>
                          </div>
                        );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delivery Partners List */}
      <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 sm:p-6 border-b border-gray-200/20 dark:border-white/[0.04] gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Delivery Partners ({partners.length})
          </h2>
          <button
            onClick={() => setIsPartnerModalOpen(true)}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200 text-sm w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </button>
        </div>
        <div className="p-5 sm:p-6 space-y-3">
          {partners.map(partner => (
            <div
              key={partner.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/30 dark:bg-white/[0.03] rounded-xl border border-white/30 dark:border-white/[0.05] hover:bg-white/50 dark:hover:bg-white/[0.05] transition-all duration-200 gap-3 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg mr-3 flex-shrink-0 border border-transparent dark:border-indigo-500/20 shadow-sm">
                  <Truck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate">{partner.name}</p>
                  <p className="text-xs text-gray-500 dark:text-white/35">{partner.region}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-sm font-semibold text-amber-500 dark:text-amber-400">★ {partner.rating}</span>
                <span
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide border ${
                    partner.status === 'Active'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500/20'
                      : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:border-amber-500/20'
                  }`}
                >
                  {partner.status}
                </span>
                <button className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-medium transition-colors duration-150">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Delivery Partner Modal */}
      <AddDeliveryPartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onAddPartner={addPartner}
      />

      {/* Assign Delivery Modal */}
      <AssignDeliveryModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        products={products}
        partners={partners}
        onAssign={handleAssignDelivery}
      />
    </div>
  );
};

export default DeliveryContent;