'use client';

import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { Product, DeliveryPartner } from '@/app/types';

interface DeliveryContentProps {
  products: Product[];
  partners: DeliveryPartner[];
}

const DeliveryContent: React.FC<DeliveryContentProps> = ({ products, partners }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);
  const [assignmentMessage, setAssignmentMessage] = useState('');

  const handleAssignment = () => {
    if (selectedProduct && selectedPartner) {
      setAssignmentMessage(`Successfully assigned ${selectedProduct.name} (SKU: ${selectedProduct.sku}) to ${selectedPartner.name}.`);
      setSelectedProduct(null);
      setSelectedPartner(null);
      setTimeout(() => setAssignmentMessage(''), 5000);
    } else {
      setAssignmentMessage('Please select both a product and a delivery partner.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100">Delivery Management</h1>

      {/* Assignment Panel */}
      <div className="glass dark:glass-dark p-4 sm:p-6 rounded-3xl shadow-lg border-l-4 border-indigo-500 dark:border-indigo-400">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Assign Delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <select
            className="glass dark:glass-dark p-3 rounded-2xl border border-white/30 dark:border-white/10 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={selectedProduct ? selectedProduct.id : ''}
            onChange={(e) => setSelectedProduct(products.find(p => p.id === parseInt(e.target.value, 10)) || null)}
          >
            <option value="" disabled>Select Product for Delivery</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
            ))}
          </select>
          <select
            className="glass dark:glass-dark p-3 rounded-2xl border border-white/30 dark:border-white/10 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={selectedPartner ? selectedPartner.id : ''}
            onChange={(e) => setSelectedPartner(partners.find(pa => pa.id === parseInt(e.target.value, 10)) || null)}
          >
            <option value="" disabled>Select Delivery Partner</option>
            {partners.filter(p => p.status === 'Active').map(p => (
              <option key={p.id} value={p.id}>{p.name} (Rating: {p.rating})</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAssignment}
          className="mt-6 w-full md:w-auto px-6 py-3 glass dark:glass-dark glass-hover text-gray-700 dark:text-gray-200 font-semibold rounded-2xl shadow-lg hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedProduct || !selectedPartner}
        >
          Assign Product Delivery
        </button>

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
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 p-4 sm:p-6 border-b border-white/20 dark:border-white/10">
          Delivery Partners ({partners.length})
        </h2>
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
    </div>
  );
};

export default DeliveryContent;