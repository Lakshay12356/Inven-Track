'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DeliveryPartner } from '@/app/types';

interface AddDeliveryPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPartner: (partner: Omit<DeliveryPartner, 'id'> & { email?: string; password?: string }) => Promise<DeliveryPartner>;
}

const AddDeliveryPartnerModal: React.FC<AddDeliveryPartnerModalProps> = ({ isOpen, onClose, onAddPartner }) => {
  const [newPartner, setNewPartner] = useState({ 
    name: '', 
    email: '',
    password: '',
    rating: '', 
    status: 'Active' as 'Active' | 'Pending Review', 
    region: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPartner.name || !newPartner.rating || !newPartner.region || !newPartner.email || !newPartner.password) return;

    setLoading(true);
    setError(null);

    try {
      const partner = {
        name: newPartner.name,
        email: newPartner.email,
        password: newPartner.password,
        rating: parseFloat(newPartner.rating),
        status: newPartner.status,
        region: newPartner.region,
      };

      await onAddPartner(partner);
      setNewPartner({ name: '', email: '', password: '', rating: '', status: 'Active', region: '' });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add delivery partner');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPartner(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const inputClasses = "w-full rounded-xl p-3 text-sm text-gray-700 dark:text-white/80 bg-white/50 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.08] dark:border-t-white/[0.12] focus:ring-2 focus:ring-indigo-400/30 dark:focus:ring-indigo-400/20 focus:border-indigo-400/40 dark:focus:border-indigo-400/30 focus:outline-none backdrop-blur-sm transition-all duration-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/60 dark:bg-white/[0.05] backdrop-blur-3xl p-6 sm:p-8 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] w-full max-w-lg border border-white/50 dark:border-white/[0.1] dark:border-t-white/[0.18] my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Add New Delivery Partner</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 hover:bg-white/50 dark:hover:bg-white/[0.06] transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-white/40 mb-2">Partner Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={newPartner.name}
              onChange={handleInputChange}
              className={inputClasses}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-white/40 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                value={newPartner.email}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-white/40 mb-2">Temporary Password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={newPartner.password}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-600 dark:text-white/40 mb-2">Rating</label>
              <input
                type="number"
                name="rating"
                id="rating"
                value={newPartner.rating}
                onChange={handleInputChange}
                className={inputClasses}
                step="0.1"
                min="0"
                max="5"
                required
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-600 dark:text-white/40 mb-2">Status</label>
              <select
                name="status"
                id="status"
                value={newPartner.status}
                onChange={handleInputChange}
                className={inputClasses}
                required
              >
                <option value="Active" className="dark:bg-slate-900">Active</option>
                <option value="Pending Review" className="dark:bg-slate-900">Pending Review</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-600 dark:text-white/40 mb-2">Region</label>
            <input
              type="text"
              name="region"
              id="region"
              value={newPartner.region}
              onChange={handleInputChange}
              className={inputClasses}
              required
            />
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
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Saving...' : 'Save Delivery Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeliveryPartnerModal;
