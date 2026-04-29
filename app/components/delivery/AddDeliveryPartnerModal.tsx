'use client';
// Force re-save to trigger Turbopack update

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

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="glass dark:glass-dark p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-white/30 dark:border-white/10 my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Add New Delivery Partner</h2>
          <button onClick={onClose} className="glass dark:glass-dark p-2 rounded-2xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Partner Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={newPartner.name}
              onChange={handleInputChange}
              className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                value={newPartner.email}
                onChange={handleInputChange}
                className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Temporary Password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={newPartner.password}
                onChange={handleInputChange}
                className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
              <input
                type="number"
                name="rating"
                id="rating"
                value={newPartner.rating}
                onChange={handleInputChange}
                className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
                step="0.1"
                min="0"
                max="5"
                required
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                name="status"
                id="status"
                value={newPartner.status}
                onChange={handleInputChange}
                className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
                required
              >
                <option value="Active">Active</option>
                <option value="Pending Review">Pending Review</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Region</label>
            <input
              type="text"
              name="region"
              id="region"
              value={newPartner.region}
              onChange={handleInputChange}
              className="glass dark:glass-dark w-full rounded-2xl shadow-sm p-3 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none border border-white/30 dark:border-white/10"
              required
            />
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
              {loading ? 'Saving...' : 'Save Delivery Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeliveryPartnerModal;


