'use client';

import React from 'react';
import { Bell, User } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-white shadow-sm p-4 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-700">{activeTab} Overview</h1>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-indigo-600 transition">
            <Bell className="w-6 h-6" />
          </button>
          <div 
            className="w-10 h-10 bg-indigo-500 rounded-full text-white flex items-center justify-center font-bold text-sm cursor-pointer" 
            onClick={() => setActiveTab('Profile')}
          >
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;