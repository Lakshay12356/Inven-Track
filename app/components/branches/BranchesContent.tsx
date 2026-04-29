'use client';

import React, { useState } from 'react';
import { Store, MapPin, Plus, Loader2, Search, Building2 } from 'lucide-react';
import { useBranches } from '@/app/hooks/useBranches';

const BranchesContent: React.FC = () => {
  const { branches, loading, error, createBranch } = useBranches();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name) return;

    try {
      setIsSubmitting(true);
      await createBranch(newBranch);
      setNewBranch({ name: '', location: '' });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create branch:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100">Branches Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and monitor all business locations</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-6 py-3 glass dark:glass-dark glass-hover text-gray-700 dark:text-gray-200 font-semibold rounded-2xl shadow-lg hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Branch
        </button>
      </div>

      {/* Stats / Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="glass dark:glass-dark p-6 rounded-3xl shadow-lg border border-white/20 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Branches</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{branches.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Branches List */}
      <div className="glass dark:glass-dark rounded-3xl shadow-lg border border-white/30 dark:border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/20 dark:border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search branches..."
              className="w-full pl-10 pr-4 py-3 glass dark:glass-dark rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none text-gray-700 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Loading branches...</p>
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No branches found. Create your first branch to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="glass dark:glass-dark p-6 rounded-2xl border border-white/20 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/50 dark:bg-white/5 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Store className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Active
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{branch.name}</h3>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    {branch.location || 'No location set'}
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                    <button className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 font-medium text-sm">
                      View Details
                    </button>
                    <span className="text-xs text-gray-400">ID: {branch.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="glass dark:glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/30 dark:border-white/10">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Add New Branch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch Name</label>
                <input
                  type="text"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="w-full p-3 glass dark:glass-dark rounded-2xl outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 dark:text-gray-200"
                  placeholder="e.g. Downtown Warehouse"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={newBranch.location}
                  onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                  className="w-full p-3 glass dark:glass-dark rounded-2xl outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 dark:text-gray-200"
                  placeholder="e.g. 123 Business St, NY"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 glass dark:glass-dark rounded-2xl text-gray-500 hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesContent;