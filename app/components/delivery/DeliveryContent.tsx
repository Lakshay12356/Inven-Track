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
    <div className="p-8 space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Delivery Management</h1>

      {/* Assignment Panel */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Assign Delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <select
            className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedProduct ? selectedProduct.id : ''}
            onChange={(e) => setSelectedProduct(products.find(p => p.id === parseInt(e.target.value, 10)) || null)}
          >
            <option value="" disabled>Select Product for Delivery</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
            ))}
          </select>
          <select
            className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
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
          className="mt-6 w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400"
          disabled={!selectedProduct || !selectedPartner}
        >
          Assign Product Delivery
        </button>

        {assignmentMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            assignmentMessage.startsWith('Successfully') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {assignmentMessage}
          </div>
        )}
      </div>

      {/* Delivery Partners List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h2 className="text-2xl font-semibold text-gray-800 p-6 border-b">
          Delivery Partners ({partners.length})
        </h2>
        <div className="p-6 space-y-4">
          {partners.map(partner => (
            <div 
              key={partner.id} 
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-150"
            >
              <div className="flex items-center">
                <Truck className="w-6 h-6 text-indigo-500 mr-4" />
                <div>
                  <p className="text-lg font-medium text-gray-900">{partner.name}</p>
                  <p className="text-sm text-gray-500">{partner.region}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-yellow-600">★ {partner.rating}</span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  partner.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {partner.status}
                </span>
                <button className="text-indigo-500 hover:text-indigo-700 text-sm font-medium transition duration-150">
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