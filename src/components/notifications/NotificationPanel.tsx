'use client';

import React from 'react';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
} from '@/lib/store/api/notificationsApi';
import { useToast } from '@/components/ui/Toast';
import { Bell, CheckCheck, Trash2, Clock, Inbox } from 'lucide-react';
import type { Notification } from '@/lib/types/notification.types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN');
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { showToast } = useToast();
  const { data: response, isLoading } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000, // Poll every 30s
  });
  const [markAsRead] = useMarkAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = response?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!isOpen) return null;

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return;
    try {
      await markAsRead({ id: notification.id, isRead: true }).unwrap();
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadList = notifications.filter((n) => !n.isRead);
      await Promise.all(unreadList.map((n) => markAsRead({ id: n.id, isRead: true }).unwrap()));
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id).unwrap();
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  return (
    <div
      className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden"
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#00C2B3]" />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-heading)' }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C2B3]/15 text-[#00C2B3]">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[11px] font-medium text-[#00C2B3] hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
        {isLoading ? (
          <div className="p-6 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-[#00C2B3] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              No notifications yet
            </p>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              You will be notified about task assignments, invoices, and filing updates here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleMarkAsRead(notification)}
              className={`p-3.5 flex items-start justify-between gap-3 transition-colors cursor-pointer group ${
                !notification.isRead
                  ? 'bg-[#00C2B3]/5 hover:bg-[#00C2B3]/10'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                {!notification.isRead ? (
                  <span className="w-2 h-2 rounded-full bg-[#00C2B3] mt-1.5 shrink-0" />
                ) : (
                  <span className="w-2 h-2 shrink-0" />
                )}

                <div className="space-y-0.5 flex-1 min-w-0">
                  <p
                    className={`text-xs ${
                      !notification.isRead ? 'font-semibold' : 'font-medium'
                    }`}
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {notification.title}
                  </p>
                  <p
                    className="text-[11px] leading-relaxed line-clamp-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {notification.message}
                  </p>
                  <span
                    className="text-[10px] flex items-center gap-1 mt-1"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    {timeAgo(notification.createdAt)}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(e, notification.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-opacity"
                title="Delete notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
