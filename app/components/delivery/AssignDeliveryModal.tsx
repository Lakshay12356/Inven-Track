'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Truck } from 'lucide-react';
import { Product, DeliveryPartner } from '@/app/types';

interface DeliveryItem {
  productId: string | number;
  productName: string;
  sku: string;
  availableQuantity: number;
  quantity: number;
}

interface AssignDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  partners: DeliveryPartner[];
  onAssign: (data: {
    partnerId: string | number;
    items: Array<{ productId: string | number; quantity: number }>;
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
  const [selectedPartner, setSelectedPartner] = useState<string | number | ''>('');
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableProducts = products.filter(
    p => p.quantity > 0 && !deliveryItems.some(item => item.productId === p.id)
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
        availableQuantity: product.quantity,
        quantity: 1,
      },
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    setDeliveryItems(deliveryItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const item = deliveryItems[index];
    const newQuantity = Math.max(1, Math.min(quantity, item.availableQuantity));
    
    setDeliveryItems(
      deliveryItems.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleProductChange = (index: number, productId: string | number) => {
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return;

    const item = deliveryItems[index];
    const maxQuantity = Math.min(item.quantity, product.quantity);
    
    setDeliveryItems(
      deliveryItems.map((item, i) =>
        i === index
          ? {
              ...item,
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              availableQuantity: product.quantity,
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
        partnerId: selectedPartner,
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

  const inputClasses = "w-full rounded-xl px-3.5 py-2.5 text-sm text-gray-800 dark:text-white/85 bg-white/60 dark:bg-white/[0.05] border border-gray-200/60 dark:border-white/[0.08] focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-400/50 dark:focus:border-indigo-400/30 focus:outline-none transition-all duration-150 placeholder-gray-400 dark:placeholder-white/20";

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#16181f] w-full max-w-2xl rounded-2xl shadow-2xl dark:shadow-[0_32px_80px_rgba(0,0,0,0.7)] border border-gray-200/80 dark:border-white/[0.07] my-auto overflow-hidden max-h-[90vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-none">New Delivery</h2>
              <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">Assign products to a delivery partner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-600 dark:hover:text-white/60 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Delivery Partner Selection */}
          <div>
            <label htmlFor="partner" className="block text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1.5">
              Delivery Partner
            </label>
            <select
              id="partner"
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className={inputClasses}
              required
            >
              <option value="" className="dark:bg-slate-900">Select Delivery Partner</option>
              {partners
                .filter(p => p.status === 'Active')
                .map(p => (
                  <option key={p.id} value={p.id} className="dark:bg-slate-900">
                    {p.name} (Rating: {p.rating}, Region: {p.region})
                  </option>
                ))}
            </select>
          </div>

          <div className="border-t border-gray-100 dark:border-white/[0.05]" />

          {/* Products Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">
                Products to Deliver
              </label>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={availableProducts.length === 0}
                className="flex items-center px-3 py-1.5 text-xs bg-white/40 dark:bg-white/[0.05] border border-white/40 dark:border-white/[0.08] text-gray-600 dark:text-white/70 font-medium rounded-lg hover:bg-white/60 dark:hover:bg-white/[0.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Product
              </button>
            </div>

            {deliveryItems.length === 0 ? (
              <div className="p-4 bg-white/30 dark:bg-white/[0.02] rounded-xl border border-dashed border-gray-300/40 dark:border-white/10 text-center text-gray-400 dark:text-white/20 text-sm">
                No products added. Click &quot;Add Product&quot; to add items.
              </div>
            ) : (
              <div className="space-y-3">
                {deliveryItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/30 dark:bg-white/[0.03] rounded-xl border border-white/30 dark:border-white/[0.05] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                  >
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <select
                          value={String(item.productId)}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                          className={inputClasses}
                        >
                          {products
                            .filter(p => p.quantity > 0 && (p.id === item.productId || !deliveryItems.some(di => di.productId === p.id && di !== item)))
                            .map(p => (
                              <option key={p.id} value={p.id} className="dark:bg-slate-900">
                                {p.name} (SKU: {p.sku}, Qty: {p.quantity})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 dark:text-white/40 whitespace-nowrap">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          max={item.availableQuantity}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10) || 1)}
                          className="w-20 rounded-xl p-2 text-sm text-gray-700 dark:text-white/80 bg-white/50 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.08] focus:ring-2 focus:ring-indigo-400/30 dark:focus:ring-indigo-400/20 focus:outline-none transition-all dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                        />
                        <span className="text-xs text-gray-400 dark:text-white/20">/ {item.availableQuantity}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
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

          <div className="border-t border-gray-100 dark:border-white/[0.05]" />

          {/* Customer Information */}
          <div className="space-y-3.5">
            <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Customer Information</p>

            <div>
              <label htmlFor="customerName" className="block text-xs font-medium text-gray-500 dark:text-white/35 mb-1.5">
                Customer Name
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClasses}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="customerEmail" className="block text-xs font-medium text-gray-500 dark:text-white/35 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-xs font-medium text-gray-500 dark:text-white/35 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="deliveryAddress" className="block text-xs font-medium text-gray-500 dark:text-white/35 mb-1.5">
                Delivery Address
              </label>
              <textarea
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={3}
                className={inputClasses}
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50/50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/40 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || deliveryItems.length === 0 || !selectedPartner}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Assigning…' : 'Assign Delivery'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AssignDeliveryModal;
