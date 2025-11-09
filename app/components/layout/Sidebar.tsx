'use client';

import React from 'react';
import { LayoutDashboard, Package, Truck, User, Store } from 'lucide-react';
import { NavItem } from '@/app/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Inventory', icon: Package },
    { name: 'Delivery', icon: Truck },
    { name: 'Profile', icon: User },
    { name: 'Branches', icon: Store, comingSoon: true },
  ];

  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white min-h-100vh p-4 shadow-xl">
      <div className="text-2xl font-extrabold p-4 mb-8 border-b border-gray-700">
        Inven Track
      </div>
      <nav className="flex-grow">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => !item.comingSoon && setActiveTab(item.name)}
            className={`flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 mb-2
              ${activeTab === item.name
                ? 'bg-indigo-600 text-white shadow-md'
                : item.comingSoon
                  ? 'text-gray-500 cursor-not-allowed hover:bg-gray-700'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            `}
            disabled={item.comingSoon}
            title={item.comingSoon ? "Coming Soon" : item.name}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
            {item.comingSoon && <span className="ml-auto text-xs bg-gray-600 px-2 py-0.5 rounded-full">Soon</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;