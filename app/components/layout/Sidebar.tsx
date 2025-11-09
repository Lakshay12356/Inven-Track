'use client';

import React from 'react';
import { LayoutDashboard, Package, Truck, User, Store, X } from 'lucide-react';
import { NavItem } from '@/app/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen = false, onClose }) => {
  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Inventory', icon: Package },
    { name: 'Delivery', icon: Truck },
    { name: 'Profile', icon: User },
    { name: 'Branches', icon: Store, comingSoon: true },
  ];

  const handleTabClick = (tab: string) => {
    if (!navItems.find(item => item.name === tab)?.comingSoon) {
      setActiveTab(tab);
      onClose?.();
    }
  };

  return (
    <>
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col w-64 min-h-screen p-6 shadow-2xl border-r border-white/10 dark:border-white/5
        transform transition-transform duration-300 ease-in-out
        bg-gradient-to-b from-slate-50/95 to-slate-100/95 dark:from-slate-900/95 dark:to-slate-950/95
        backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none
        text-gray-800 dark:text-white
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-8">
          <div className="text-xl font-bold p-4 rounded-2xl glass dark:glass-dark text-gray-800 dark:text-gray-200 text-center flex-1">
            Inven Track
          </div>
          <button
            onClick={onClose}
            className="lg:hidden glass dark:glass-dark p-2 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-white/10 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleTabClick(item.name)}
              className={`flex items-center w-full p-4 rounded-2xl text-left transition-all duration-300 mb-2
                ${activeTab === item.name
                  ? 'glass dark:glass-dark bg-white/50 dark:bg-white/10 text-gray-800 dark:text-gray-200 shadow-lg scale-105'
                  : item.comingSoon
                    ? 'text-gray-500 dark:text-gray-400 cursor-not-allowed hover:bg-white/30 dark:hover:bg-white/5'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-gray-100 hover:scale-105'
                }
              `}
              disabled={item.comingSoon}
              title={item.comingSoon ? "Coming Soon" : item.name}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
              {item.comingSoon && <span className="ml-auto text-xs glass dark:glass-dark px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">Soon</span>}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;