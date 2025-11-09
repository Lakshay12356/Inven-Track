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
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="glass dark:glass-dark p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-white/30 dark:border-white/10 my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Add New Product</h2>
          <button onClick={onClose} className="glass dark:glass-dark p-2 rounded-2xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={newProduct.name}
              onChange={handleInputChange}
              className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-white/30 dark:border-white/10"
              required
            />
          </div>
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SKU</label>
            <input
              type="text"
              name="sku"
              id="sku"
              value={newProduct.sku}
              onChange={handleInputChange}
              className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-white/30 dark:border-white/10"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                id="stock"
                value={newProduct.stock}
                onChange={handleInputChange}
                className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-white/30 dark:border-white/10"
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
              <input
                type="number"
                name="price"
                id="price"
                value={newProduct.price}
                onChange={handleInputChange}
                className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-white/30 dark:border-white/10"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          {error && (
            <div className="p-4 glass dark:glass-dark rounded-2xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 glass dark:glass-dark glass-hover text-gray-700 dark:text-gray-200 font-semibold rounded-2xl shadow-lg hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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