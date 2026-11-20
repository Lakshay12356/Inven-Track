'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Package, Truck, Check, CheckCheck, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import type { Notification } from '@/app/types';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/app/lib/api/notifications';

const NotificationDropdown: React.FC = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(user.id),
        getUnreadCount(user.id),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string | number) => {
    await markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    setLoading(true);
    await markAllAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    setLoading(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'low_stock':
        return <Package className="w-4 h-4 text-amber-500" />;
      case 'new_assignment':
        return <Truck className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationBg = (type: Notification['type']) => {
    switch (type) {
      case 'low_stock':
        return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20';
      case 'new_assignment':
        return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200/50 dark:border-blue-500/20';
      default:
        return 'bg-gray-50 dark:bg-white/5 border-gray-200/50 dark:border-white/10';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl text-gray-500 dark:text-white/40 hover:bg-white/50 dark:hover:bg-white/[0.06] hover:text-gray-700 dark:hover:text-white/70 transition-all duration-200 hover:scale-105 relative"
        aria-label="Notifications"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white/80 dark:border-[#0d1130] shadow-[0_0_6px_rgba(239,68,68,0.5)] px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[500px] bg-white/90 dark:bg-[#0d1130]/95 backdrop-blur-3xl rounded-2xl border border-white/50 dark:border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/30 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white/90">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={loading}
                  className="flex items-center gap-1 text-[11px] font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white/60 hover:bg-white/50 dark:hover:bg-white/[0.06] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[400px] divide-y divide-gray-100/50 dark:divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-10 h-10 text-gray-200 dark:text-white/10 mb-3" />
                <p className="text-sm font-medium text-gray-400 dark:text-white/20">No notifications yet</p>
                <p className="text-xs text-gray-300 dark:text-white/10 mt-1">You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`px-5 py-3.5 hover:bg-white/40 dark:hover:bg-white/[0.03] transition-all duration-150 cursor-pointer ${
                    !notification.read ? 'bg-blue-50/30 dark:bg-blue-500/[0.03]' : ''
                  }`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-xl border flex-shrink-0 ${getNotificationBg(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${!notification.read ? 'text-gray-800 dark:text-white/90' : 'text-gray-600 dark:text-white/60'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-white/35 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-white/20 mt-1.5 font-medium">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
