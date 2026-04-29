'use client';

import React, { useCallback, useState } from 'react';
import { Truck, Plus, Package, CheckCircle2, RefreshCw, MapPin, Phone, User, Clock } from 'lucide-react';
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

      const itemCount = data.items.length;
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
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_transit': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'assigned': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100">Delivery Management</h1>
      </div>

      {/* Assignment Panel */}
      <div className="glass dark:glass-dark p-4 sm:p-6 rounded-3xl shadow-lg border-l-4 border-indigo-500 dark:border-indigo-400">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200">Assign Delivery</h2>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 glass dark:glass-dark glass-hover text-gray-700 dark:text-gray-200 font-semibold rounded-2xl shadow-lg hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
            New Delivery Assignment
          </button>
        </div>

        {assignmentMessage && (
          <div
            className={`mt-4 p-3 sm:p-4 rounded-2xl text-sm font-medium glass dark:glass-dark ${
              assignmentMessage.startsWith('Successfully')
                ? 'border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}
          >
            {assignmentMessage}
          </div>
        )}
      </div>

      {/* Deliveries Overview */}
      <div className="glass dark:glass-dark rounded-3xl shadow-lg border border-white/30 dark:border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-white/20 dark:border-white/10 gap-4">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200">Delivery Orders</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track multi-item shipments and partner status</p>
            </div>
          </div>
          <button
            onClick={async () => {
                setIsRefreshingDeliveries(true);
                await refreshDeliveries();
                setIsRefreshingDeliveries(false);
            }}
            disabled={isRefreshingDeliveries}
            className="flex items-center px-4 sm:px-5 py-2 sm:py-2.5 glass dark:glass-dark glass-hover text-gray-700 dark:text-gray-200 font-medium rounded-2xl shadow-lg hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${isRefreshingDeliveries ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {deliveriesError && (
            <div className="p-4 glass dark:glass-dark rounded-2xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {deliveriesError.message}
            </div>
          )}
          {deliveriesLoading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Loading deliveries...
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No delivery orders have been created yet.
            </div>
          ) : (
            deliveries.map(order => (
              <div
                key={order.id}
                className="glass dark:glass-dark p-6 rounded-2xl border border-white/20 dark:border-white/10 space-y-4 hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                      <Truck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        Order #{order.id}
                        <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {order.customer_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {order.customer_address}
                        </div>
                        {order.customer_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {order.customer_phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatDateTime(order.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {order.status === 'assigned' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'in_transit')}
                        disabled={updatingOrderId === order.id}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl shadow-md hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                        Mark In Transit
                      </button>
                    )}
                    {order.status === 'in_transit' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                        disabled={updatingOrderId === order.id}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl shadow-md hover:bg-green-700 transition-all disabled:opacity-50"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white/30 dark:bg-black/20 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.items?.map(item => {
                        const product = products.find(p => String(p.id) === String(item.product_id));
                        return (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">
                                {product?.name || `Product #${item.product_id}`}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">x{item.quantity}</span>
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
      <div className="glass dark:glass-dark rounded-3xl shadow-lg overflow-hidden border border-white/30 dark:border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-white/20 dark:border-white/10 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Delivery Partners ({partners.length})
          </h2>
          <button
            onClick={() => setIsPartnerModalOpen(true)}
            className="flex items-center px-4 sm:px-6 py-2 sm:py-3 glass dark:glass-dark glass-hover text-gray-700 dark:text-gray-200 font-medium rounded-2xl shadow-lg hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add Partner
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {partners.map(partner => (
            <div
              key={partner.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 glass dark:glass-dark rounded-2xl hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-300 gap-3 sm:gap-0"
            >
              <div className="flex items-center flex-1 min-w-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400 mr-3 sm:mr-4 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-200 truncate">{partner.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{partner.region}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">★ {partner.rating}</span>
                <span
                  className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                    partner.status === 'Active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                  }`}
                >
                  {partner.status}
                </span>
                <button className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition duration-150">
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