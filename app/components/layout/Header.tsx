'use client';

import React from 'react';
import { User, LogOut, Sun, Moon, Menu, Search } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/app/contexts/ThemeContext';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  const getPageTitle = () => {
    const path = pathname.split('/').filter(Boolean)[0] || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="sticky top-0 z-10 mx-4 sm:mx-6 lg:mx-8 mt-4 mb-2">
      <div className="
        bg-white/40 dark:bg-white/[0.04]
        backdrop-blur-2xl dark:backdrop-blur-3xl
        border border-white/40 dark:border-white/[0.07]
        dark:border-t-white/[0.12]
        rounded-2xl
        shadow-[0_2px_20px_rgba(0,0,0,0.04)]
        dark:shadow-[0_4px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]
        px-4 sm:px-6 py-3
      ">
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-white/40 hover:bg-white/50 dark:hover:bg-white/[0.06] transition-all duration-200"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white/90 truncate">
              {getPageTitle()} Overview
            </h1>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center bg-white/40 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.06] rounded-xl px-3 py-2 min-w-[220px] transition-all duration-200 focus-within:bg-white/60 dark:focus-within:bg-white/[0.07] focus-within:border-blue-300/50 dark:focus-within:border-indigo-400/30 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] dark:focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]">
            <Search className="w-4 h-4 text-gray-400 dark:text-white/25 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-700 dark:text-white/80 placeholder-gray-400 dark:placeholder-white/20 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-gray-500 dark:text-white/40 hover:bg-white/50 dark:hover:bg-white/[0.06] hover:text-gray-700 dark:hover:text-white/70 transition-all duration-200 hover:scale-105"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-[18px] h-[18px]" />
              ) : (
                <Sun className="w-[18px] h-[18px]" />
              )}
            </button>

            <NotificationDropdown />

            <button
              className="p-2.5 rounded-xl text-gray-500 dark:text-white/40 hover:bg-white/50 dark:hover:bg-white/[0.06] hover:text-gray-700 dark:hover:text-white/70 transition-all duration-200 hover:scale-105"
              onClick={() => router.push('/profile')}
              aria-label="Profile"
            >
              <User className="w-[18px] h-[18px]" />
            </button>
            <div className="w-px h-6 bg-gray-200/50 dark:bg-white/[0.06] mx-1 hidden sm:block" />
            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-xl text-gray-500 dark:text-white/40 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-105"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
