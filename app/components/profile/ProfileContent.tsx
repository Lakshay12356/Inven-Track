'use client';

import React from 'react';
import { UserProfile } from '@clerk/nextjs';
import { useTheme } from '@/app/contexts/ThemeContext';

const ProfileContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white">User Profile</h1>
        <p className="text-gray-500 dark:text-white/35 mt-1 text-sm">Manage your account settings and preferences</p>
      </div>
      
      <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="w-full max-w-5xl h-auto">
          <UserProfile
            appearance={{
              variables: {
                colorPrimary: '#6366f1',
                // Forcing visibility with solid-enough glass background
                colorBackground: theme === 'dark' ? '#0f172a' : '#ffffff',
                colorText: theme === 'dark' ? '#ffffff' : '#111827',
                colorTextSecondary: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : '#6b7280',
                colorInputBackground: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb',
                colorInputText: theme === 'dark' ? '#ffffff' : '#111827',
                borderRadius: '1.25rem',
              },
              elements: {
                rootBox: "mx-auto w-full flex items-start justify-center min-h-0",
                card: "bg-white/70 dark:bg-black/40 backdrop-blur-3xl border border-white/50 dark:border-white/[0.08] dark:border-t-white/[0.15] shadow-2xl rounded-[2rem] overflow-hidden w-full h-auto max-h-none",
                cardBox: "bg-transparent shadow-none border-none h-auto",
                navbar: "bg-white/10 dark:bg-black/20 border-r border-gray-200/20 dark:border-white/5 w-64 h-auto min-h-0 self-stretch",
                navbarButton: "text-gray-600 dark:text-white/40 hover:bg-white/20 dark:hover:bg-white/5 rounded-xl transition-all h-10",
                navbarButtonActive: "bg-white/40 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm font-semibold border-none",
                headerTitle: "text-gray-900 dark:text-white font-black",
                headerSubtitle: "text-gray-500 dark:text-white/40",
                formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-all shadow-md",
                formFieldInput: "bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl",
                formFieldLabel: "text-gray-700 dark:text-white/50 font-semibold",
                scrollBox: "bg-transparent h-auto overflow-visible",
                pageScrollBox: "bg-transparent p-6 sm:p-8 h-auto overflow-visible",
                navbarMobileMenuButton: "text-gray-800 dark:text-white",
                accordionTriggerButton: "text-gray-800 dark:text-white hover:bg-white/10",
                profileSectionTitleText: "text-gray-900 dark:text-white/90 font-bold border-b border-gray-200/20 dark:border-white/5 pb-2",
                userPreviewMainIdentifier: "text-gray-900 dark:text-white font-bold",
                userPreviewSecondaryIdentifier: "text-gray-500 dark:text-white/40",
                breadcrumbsItem: "text-gray-500 dark:text-white/30",
                breadcrumbsItemActive: "text-gray-900 dark:text-white font-bold",
                dividerLine: "bg-gray-200/20 dark:bg-white/5",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;
