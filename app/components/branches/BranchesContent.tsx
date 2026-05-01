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
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white">Branches Management</h1>
          <p className="text-gray-500 dark:text-white/35 mt-1 text-sm">Manage and monitor all business locations</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Branch
        </button>
      </div>

      {/* Stats / Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl p-5 rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/35 font-medium uppercase tracking-wider">Total Branches</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{branches.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Branches List */}
      <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="p-5 border-b border-gray-200/20 dark:border-white/[0.04]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/25" />
            <input
              type="text"
              placeholder="Search branches..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/40 dark:bg-white/[0.02] border border-white/40 dark:border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-400/30 dark:focus:ring-indigo-400/20 focus:border-indigo-400/40 dark:focus:border-indigo-400/30 outline-none text-sm text-gray-700 dark:text-white/80 transition-all duration-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            />
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-white/20">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
              <p className="text-sm">Loading branches...</p>
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-14 h-14 text-gray-200 dark:text-white/5 mx-auto mb-4" />
              <p className="text-gray-400 dark:text-white/20 text-sm">No branches found. Create your first branch to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="group bg-white/35 dark:bg-white/[0.03] p-5 rounded-xl border border-white/30 dark:border-white/[0.05] hover:bg-white/55 dark:hover:bg-white/[0.06] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-white/50 dark:bg-white/[0.04] rounded-lg group-hover:scale-105 transition-transform duration-200 border border-transparent dark:border-white/5 shadow-sm">
                      <Store className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-transparent dark:border-emerald-500/20">
                      Active
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-white/90 mb-2">{branch.name}</h3>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-white/35 text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    {branch.location || 'No location set'}
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-200/20 dark:border-white/[0.04] flex justify-between items-center">
                    <button className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 font-medium text-xs transition-colors">
                      View Details
                    </button>
                    <span className="text-[10px] text-gray-400 dark:text-white/15 font-mono">ID: {branch.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white/60 dark:bg-white/[0.05] backdrop-blur-3xl p-6 sm:p-8 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] w-full max-w-md border border-white/50 dark:border-white/[0.1] dark:border-t-white/[0.18]">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-6">Add New Branch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/40 mb-2">Branch Name</label>
                <input
                  type="text"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="w-full p-3 bg-white/50 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.08] dark:border-t-white/[0.12] rounded-xl outline-none focus:ring-2 focus:ring-indigo-400/30 dark:focus:ring-indigo-400/20 text-sm text-gray-700 dark:text-white/80 transition-all duration-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                  placeholder="e.g. Downtown Warehouse"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/40 mb-2">Location</label>
                <input
                  type="text"
                  value={newBranch.location}
                  onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                  className="w-full p-3 bg-white/50 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.08] dark:border-t-white/[0.12] rounded-xl outline-none focus:ring-2 focus:ring-indigo-400/30 dark:focus:ring-indigo-400/20 text-sm text-gray-700 dark:text-white/80 transition-all duration-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                  placeholder="e.g. 123 Business St, NY"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white/40 dark:bg-white/[0.05] border border-white/40 dark:border-white/[0.08] rounded-xl text-gray-500 dark:text-white/40 hover:bg-white/60 dark:hover:bg-white/[0.08] transition-all text-sm font-medium dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center justify-center text-sm"
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