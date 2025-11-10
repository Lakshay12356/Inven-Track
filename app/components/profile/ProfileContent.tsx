'use client';

import React from 'react';
import { UserProfile } from '@clerk/nextjs';
import { useTheme } from '@/app/contexts/ThemeContext';

const ProfileContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100">User Profile</h1>
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <UserProfile
            appearance={{
              baseTheme: theme === 'dark' ? 'dark' : undefined,
              variables: {
                colorPrimary: theme === 'dark' ? '#3b82f6' : '#2563eb',
                colorBackground: theme === 'dark' ? '#1e293b' : '#ffffff',
                colorInputBackground: theme === 'dark' ? '#334155' : '#f8fafc',
                colorText: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                colorTextSecondary: theme === 'dark' ? '#cbd5e1' : '#64748b',
                colorInputText: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                borderRadius: '0.75rem',
              },
              elements: {
                rootBox: "mx-auto w-full",
                card: "shadow-lg rounded-3xl",
                cardBox: theme === 'dark' 
                  ? "bg-slate-800 border border-slate-700" 
                  : "bg-white border border-gray-200",
                headerTitle: theme === 'dark' 
                  ? "text-slate-100" 
                  : "text-gray-900",
                headerSubtitle: theme === 'dark' 
                  ? "text-slate-400" 
                  : "text-gray-600",
                formButtonPrimary: theme === 'dark'
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white",
                formFieldInput: theme === 'dark'
                  ? "bg-slate-700 border-slate-600 text-slate-100"
                  : "bg-slate-50 border-gray-300 text-gray-900",
                formFieldLabel: theme === 'dark'
                  ? "text-slate-300"
                  : "text-gray-700",
                dividerLine: theme === 'dark'
                  ? "bg-slate-700"
                  : "bg-gray-200",
                dividerText: theme === 'dark'
                  ? "text-slate-400"
                  : "text-gray-500",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;
