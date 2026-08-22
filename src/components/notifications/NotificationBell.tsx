'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useGetNotificationsQuery } from '@/lib/store/api/notificationsApi';
import { NotificationPanel } from './NotificationPanel';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const bellContainerRef = useRef<HTMLDivElement>(null);

  const { data: response } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
  });

  const notifications = response?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        bellContainerRef.current &&
        !bellContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={bellContainerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
