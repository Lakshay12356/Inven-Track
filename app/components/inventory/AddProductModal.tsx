'use client';

import React, { useState } from 'react';
import { X, Package } from 'lucide-react';
import { Product } from '@/app/types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAddProduct }) => {
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', quantity: '', price: '', buyPrice: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.sku || !newProduct.quantity || !newProduct.price || !newProduct.buyPrice) return;

    setLoading(true);
    setError(null);

    try {
      const product: Omit<Product, 'id'> = {
        name: newProduct.name,
        sku: newProduct.sku,
        quantity: parseInt(newProduct.quantity, 10),
        price: parseFloat(newProduct.price),
        buyPrice: parseFloat(newProduct.buyPrice),
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      await onAddProduct(product);
      setNewProduct({ name: '', sku: '', quantity: '', price: '', buyPrice: '' });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const fieldCls = "w-full rounded-xl px-3.5 py-2.5 text-sm text-gray-800 dark:text-white/85 bg-white/60 dark:bg-white/[0.05] border border-gray-200/60 dark:border-white/[0.08] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-400/50 dark:focus:border-blue-400/30 focus:outline-none transition-all duration-150 placeholder-gray-400 dark:placeholder-white/20";

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#16181f] w-full max-w-md rounded-2xl shadow-2xl dark:shadow-[0_32px_80px_rgba(0,0,0,0.7)] border border-gray-200/80 dark:border-white/[0.07] my-auto overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-none">Add Product</h2>
              <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">New item to your inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-600 dark:hover:text-white/60 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Identity */}
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1.5">Product Name</label>
              <input type="text" name="name" id="name" value={newProduct.name} onChange={handleInputChange} className={fieldCls} placeholder="e.g. Wireless Earbuds Pro" required />
            </div>
            <div>
              <label htmlFor="sku" className="block text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1.5">SKU</label>
              <input type="text" name="sku" id="sku" value={newProduct.sku} onChange={handleInputChange} className={`${fieldCls} font-mono`} placeholder="e.g. WEP-001" required />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-white/[0.05]" />

          {/* Pricing & stock */}
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-white/25 uppercase tracking-wider mb-3">Pricing & Stock</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="quantity" className="block text-xs font-medium text-gray-500 dark:text-white/35 mb-1.5">Quantity</label>
                <input type="number" name="quantity" id="quantity" value={newProduct.quantity} onChange={handleInputChange} className={fieldCls} min="0" placeholder="0" required />
              </div>
              <div>
                <label htmlFor="buyPrice" className="block text-xs font-medium text-gray-500 dark:text-white/35 mb-1.5">Buy Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/25 text-sm">$</span>
                  <input type="number" name="buyPrice" id="buyPrice" value={newProduct.buyPrice} onChange={handleInputChange} className={`${fieldCls} pl-7`} step="0.01" min="0" placeholder="0.00" required />
                </div>
              </div>
              <div>
                <label htmlFor="price" className="block text-xs font-medium text-gray-500 dark:text-white/35 mb-1.5">Sell Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/25 text-sm">$</span>
                  <input type="number" name="price" id="price" value={newProduct.price} onChange={handleInputChange} className={`${fieldCls} pl-7`} step="0.01" min="0" placeholder="0.00" required />
                </div>
              </div>
            </div>
            {newProduct.price && newProduct.buyPrice && (
              <div className="mt-2.5 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-100 dark:border-emerald-500/15">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Margin: <span className="font-semibold">${(parseFloat(newProduct.price || '0') - parseFloat(newProduct.buyPrice || '0')).toFixed(2)}</span>
                  {parseFloat(newProduct.buyPrice) > 0 && (
                    <span className="ml-1.5 opacity-70">({(((parseFloat(newProduct.price || '0') - parseFloat(newProduct.buyPrice || '0')) / parseFloat(newProduct.buyPrice || '1')) * 100).toFixed(0)}%)</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/40 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Saving…' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
