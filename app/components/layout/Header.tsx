'use client';

import React from 'react';
import { Bell, User, LogOut, Sun, Moon, Menu } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/contexts/ThemeContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onMenuClick }) => {
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <header className="glass dark:glass-dark border-b border-white/20 dark:border-white/10 p-3 sm:p-4 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden glass dark:glass-dark p-2 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 dark:text-gray-200 truncate">
            {activeTab} Overview
          </h1>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
          <button
            onClick={toggleTheme}
            className="glass dark:glass-dark p-2 sm:p-3 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-110"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
          <button 
            className="glass dark:glass-dark p-2 sm:p-3 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-110"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div 
            className="glass dark:glass-dark p-2 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-110" 
            onClick={() => setActiveTab('Profile')}
            aria-label="Profile"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <button
            onClick={handleSignOut}
            className="glass dark:glass-dark p-2 sm:p-3 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 hover:scale-110"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;