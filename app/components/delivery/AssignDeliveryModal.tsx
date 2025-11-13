'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Product, DeliveryPartner } from '@/app/types';

interface DeliveryItem {
  productId: number;
  productName: string;
  sku: string;
  availableStock: number;
  quantity: number;
}

interface AssignDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  partners: DeliveryPartner[];
  onAssign: (data: {
    partnerId: number;
    items: Array<{ productId: number; quantity: number }>;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
  }) => Promise<void>;
}

const AssignDeliveryModal: React.FC<AssignDeliveryModalProps> = ({
  isOpen,
  onClose,
  products,
  partners,
  onAssign,
}) => {
  const [selectedPartner, setSelectedPartner] = useState<number | ''>('');
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableProducts = products.filter(
    p => p.stock > 0 && !deliveryItems.some(item => item.productId === p.id)
  );

  const handleAddProduct = () => {
    if (availableProducts.length === 0) return;
    
    const product = availableProducts[0];
    setDeliveryItems([
      ...deliveryItems,
      {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        availableStock: product.stock,
        quantity: 1,
      },
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    setDeliveryItems(deliveryItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const item = deliveryItems[index];
    const newQuantity = Math.max(1, Math.min(quantity, item.availableStock));
    
    setDeliveryItems(
      deliveryItems.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleProductChange = (index: number, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const item = deliveryItems[index];
    const maxQuantity = Math.min(item.quantity, product.stock);
    
    setDeliveryItems(
      deliveryItems.map((item, i) =>
        i === index
          ? {
              ...item,
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              availableStock: product.stock,
              quantity: maxQuantity,
            }
          : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPartner) {
      setError('Please select a delivery partner');
      return;
    }

    if (deliveryItems.length === 0) {
      setError('Please add at least one product to deliver');
      return;
    }

    if (!customerName.trim()) {
      setError('Please enter customer name');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Please enter delivery address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAssign({
        partnerId: selectedPartner as number,
        items: deliveryItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
      });

      // Reset form
      setSelectedPartner('');
      setDeliveryItems([]);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setDeliveryAddress('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign delivery');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="glass dark:glass-dark p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl w-full max-w-3xl border border-white/30 dark:border-white/10 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Assign Delivery</h2>
          <button
            onClick={onClose}
            className="glass dark:glass-dark p-2 rounded-2xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Partner Selection */}
          <div>
            <label htmlFor="partner" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delivery Partner *
            </label>
            <select
              id="partner"
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value ? parseInt(e.target.value, 10) : '')}
              className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
              required
            >
              <option value="">Select Delivery Partner</option>
              {partners
                .filter(p => p.status === 'Active')
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Rating: {p.rating}, Region: {p.region})
                  </option>
                ))}
            </select>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Products to Deliver *
              </label>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={availableProducts.length === 0}
                className="flex items-center px-3 py-1.5 text-sm glass dark:glass-dark glass-hover text-gray-700 dark:text-gray-200 font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Product
              </button>
            </div>

            {deliveryItems.length === 0 ? (
              <div className="p-4 glass dark:glass-dark rounded-2xl border border-white/30 dark:border-white/10 text-center text-gray-500 dark:text-gray-400">
                No products added. Click "Add Product" to add items.
              </div>
            ) : (
              <div className="space-y-3">
                {deliveryItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 glass dark:glass-dark rounded-2xl border border-white/30 dark:border-white/10"
                  >
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(index, parseInt(e.target.value, 10))}
                          className="glass dark:glass-dark w-full rounded-xl shadow-sm p-2 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
                        >
                          {products
                            .filter(p => p.stock > 0 && (p.id === item.productId || !deliveryItems.some(di => di.productId === p.id && di !== item)))
                            .map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} (SKU: {p.sku}, Stock: {p.stock})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          max={item.availableStock}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10) || 1)}
                          className="glass dark:glass-dark w-20 rounded-xl shadow-sm p-2 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">/ {item.availableStock}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="p-2 glass dark:glass-dark glass-hover text-red-500 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Customer Information</h3>
            
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delivery Address *
              </label>
              <textarea
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={3}
                className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 glass dark:glass-dark rounded-2xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 glass dark:glass-dark glass-hover text-gray-700 dark:text-gray-200 font-semibold rounded-2xl shadow-lg hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || deliveryItems.length === 0 || !selectedPartner}
              className="flex-1 py-3 glass dark:glass-dark glass-hover text-gray-700 dark:text-gray-200 font-semibold rounded-2xl shadow-lg hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Assigning...' : 'Assign Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDeliveryModal;


