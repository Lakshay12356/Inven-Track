'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Package, Building2 } from 'lucide-react';
import { getOrCreateUser } from '@/app/lib/api/users';

export default function CompleteProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const email = user.emailAddresses?.[0]?.emailAddress;
      await getOrCreateUser(user.id, email, companyName.trim(), 'manager');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save company details');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617]">
        <div className="w-8 h-8 border-2 border-[#00BFFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#020617] px-4 overflow-hidden relative font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10 scale-[0.80] sm:scale-90 lg:scale-100">
        <div className="flex flex-col items-center mb-4">
          <div className="p-4 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 mb-6 group transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/20">
            <Package className="w-12 h-12 text-[#00BFFF] drop-shadow-[0_0_15px_rgba(0,191,255,0.4)]" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Complete Your Profile</h1>
          <p className="text-xs font-bold text-blue-400/80 uppercase tracking-[0.4em]">Company Details</p>
        </div>

        <div className="glass-darker border border-white/20 shadow-2xl shadow-blue-500/5 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:border-white/30 w-full">
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
            <div>
              <label htmlFor="companyName" className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  className="w-full bg-white/5 border border-white/10 focus:bg-white/10 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20 h-14 rounded-2xl text-white text-base font-medium pl-12 pr-5 transition-all outline-none"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !companyName.trim()}
              className="w-full bg-gradient-to-r from-[#00BFFF] to-[#0080FF] hover:from-[#009FD4] hover:to-[#0066CC] text-sm font-bold uppercase tracking-widest h-14 rounded-2xl shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98] border-none text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Continue to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
