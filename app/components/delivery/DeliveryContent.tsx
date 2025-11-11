'use client';

import React, { useState } from 'react';
import { Truck, Plus } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Product, DeliveryPartner } from '@/app/types';
import AddDeliveryPartnerModal from './AddDeliveryPartnerModal';
import AssignDeliveryModal from './AssignDeliveryModal';
import { createDelivery } from '@/app/lib/api/deliveries';

interface DeliveryContentProps {
  products: Product[];
  partners: DeliveryPartner[];
  addPartner: (partner: Omit<DeliveryPartner, 'id'>) => Promise<DeliveryPartner>;
  refreshProducts?: () => void;
}

const DeliveryContent: React.FC<DeliveryContentProps> = ({ products, partners, addPartner, refreshProducts }) => {
  const { user } = useUser();
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleAssignDelivery = async (data: {
    partnerId: number;
    items: Array<{ productId: number; quantity: number }>;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
  }) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
    await createDelivery(
      {
        partnerId: data.partnerId,
        items: data.items,
        customerName: data.customerName,
        customerEmail: data.customerEmail || undefined,
        customerPhone: data.customerPhone || undefined,
        deliveryAddress: data.deliveryAddress,
      },
      user.id,
      email
    );

    // Refresh products to update stock
    if (refreshProducts) {
      refreshProducts();
    }

    const itemCount = data.items.length;
    const partnerName = partners.find(p => p.id === data.partnerId)?.name || 'Partner';
    setAssignmentMessage(
      `Successfully assigned ${itemCount} product${itemCount > 1 ? 's' : ''} to ${partnerName} for delivery to ${data.customerName}.`
    );
    setTimeout(() => setAssignmentMessage(''), 5000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100">Delivery Management</h1>

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
          <div className={`mt-4 p-3 sm:p-4 rounded-2xl text-sm font-medium glass dark:glass-dark ${
            assignmentMessage.startsWith('Successfully') 
              ? 'border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
              : 'border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}>
            {assignmentMessage}
          </div>
        )}
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
                <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                  partner.status === 'Active' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                }`}>
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