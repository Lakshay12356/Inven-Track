'use client';
// Force re-save to trigger Turbopack update

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Truck, User, Store, X } from 'lucide-react';
import { NavItem } from '@/app/types';

import { useUser } from '@clerk/nextjs';
import { getUserRole } from '@/app/lib/api/users';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const { user } = useUser();
  const [role, setRole] = React.useState<'manager' | 'delivery_partner' | null>(null);

  React.useEffect(() => {
    if (user?.id) {
      getUserRole(user.id).then(setRole);
    }
  }, [user?.id]);
  
  const allNavItems: NavItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Inventory', icon: Package, path: '/inventory', role: 'manager' },
    { name: 'Delivery', icon: Truck, path: '/delivery', role: 'manager' },
    { name: 'Branches', icon: Store, path: '/branches', role: 'manager' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const navItems = allNavItems.filter(item => !item.role || item.role === role);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname === path;
  };

  return (
    <>
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col w-[260px] min-h-screen p-5
        transform transition-all duration-300 ease-in-out

        /* Light mode */
        bg-white/30 
        
        /* Dark mode — Apple fluid glass sidebar */
        dark:bg-white/[0.03]
        dark:backdrop-blur-3xl
        
        backdrop-blur-2xl
        border-r border-white/30 dark:border-white/[0.06]
        shadow-[4px_0_24px_rgba(0,0,0,0.04)]
        dark:shadow-[4px_0_30px_rgba(0,0,0,0.4),inset_1px_0_0_rgba(255,255,255,0.04)]
        text-gray-800 dark:text-white/90
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo area */}
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-indigo-500/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
              Inven Track
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-white/40 hover:bg-white/40 dark:hover:bg-white/[0.06] transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation label */}
        <div className="px-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-white/20">
            Main Menu
          </span>
        </div>

        {/* Navigation items */}
        <nav className="flex-grow space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const content = (
              <div
                className={`flex items-center w-full px-4 py-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden
                  ${active
                    ? 'bg-white/60 dark:bg-white/[0.08] text-gray-900 dark:text-white shadow-md shadow-black/[0.03] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] font-semibold dark:border dark:border-white/[0.08]'
                    : 'text-gray-600 dark:text-white/40 hover:bg-white/40 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white/70'
                  }
                `}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-blue-400 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                )}
                <item.icon className={`w-[18px] h-[18px] mr-3 flex-shrink-0 transition-colors duration-200 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-white/25 group-hover:text-gray-600 dark:group-hover:text-white/50'}`} />
                <span className="text-sm">{item.name}</span>
              </div>
            );

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className="block"
              >
                {content}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto pt-6 border-t border-white/20 dark:border-white/[0.04]">
          <div className="px-3 py-2">
            <p className="text-[10px] font-medium text-gray-400 dark:text-white/15 uppercase tracking-wider">
              Inven Track v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;