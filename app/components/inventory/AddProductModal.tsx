'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Product } from '@/app/types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAddProduct }) => {
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', stock: '', price: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.sku || !newProduct.stock || !newProduct.price) return;

    setLoading(true);
    setError(null);

    try {
      const product: Omit<Product, 'id'> = {
        name: newProduct.name,
        sku: newProduct.sku,
        stock: parseInt(newProduct.stock, 10),
        price: parseFloat(newProduct.price),
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      await onAddProduct(product);
      setNewProduct({ name: '', sku: '', stock: '', price: '' });
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

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/60 dark:bg-white/[0.05] backdrop-blur-3xl p-6 sm:p-8 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] w-full max-w-lg border border-white/50 dark:border-white/[0.1] dark:border-t-white/[0.18] my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Add New Product</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 hover:bg-white/50 dark:hover:bg-white/[0.06] transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-white/40 mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={newProduct.name}
              onChange={handleInputChange}
              className="w-full rounded-xl p-3 text-sm text-gray-700 dark:text-white/80 bg-white/50 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.08] dark:border-t-white/[0.12] focus:ring-2 focus:ring-blue-400/30 dark:focus:ring-indigo-400/20 focus:border-blue-400/40 dark:focus:border-indigo-400/30 focus:outline-none backdrop-blur-sm transition-all duration-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              required
            />
          </div>
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-600 dark:text-white/40 mb-2">SKU</label>
            <input
              type="text"
              name="sku"
              id="sku"
              value={newProduct.sku}
              onChange={handleInputChange}
              className="w-full rounded-xl p-3 text-sm text-gray-700 dark:text-white/80 bg-white/50 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.08] dark:border-t-white/[0.12] focus:ring-2 focus:ring-blue-400/30 dark:focus:ring-indigo-400/20 focus:border-blue-400/40 dark:focus:border-indigo-400/30 focus:outline-none backdrop-blur-sm transition-all duration-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-600 dark:text-white/40 mb-2">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                id="stock"
                value={newProduct.stock}
                onChange={handleInputChange}
                className="w-full rounded-xl p-3 text-sm text-gray-700 dark:text-white/80 bg-white/50 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.08] dark:border-t-white/[0.12] focus:ring-2 focus:ring-blue-400/30 dark:focus:ring-indigo-400/20 focus:border-blue-400/40 dark:focus:border-indigo-400/30 focus:outline-none backdrop-blur-sm transition-all duration-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-600 dark:text-white/40 mb-2">Price ($)</label>
              <input
                type="number"
                name="price"
                id="price"
                value={newProduct.price}
                onChange={handleInputChange}
                className="w-full rounded-xl p-3 text-sm text-gray-700 dark:text-white/80 bg-white/50 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.08] dark:border-t-white/[0.12] focus:ring-2 focus:ring-blue-400/30 dark:focus:ring-indigo-400/20 focus:border-blue-400/40 dark:focus:border-indigo-400/30 focus:outline-none backdrop-blur-sm transition-all duration-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          {error && (
            <div className="p-3 rounded-xl bg-red-50/50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;