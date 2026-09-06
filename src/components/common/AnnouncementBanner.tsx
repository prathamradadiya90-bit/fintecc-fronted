'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, Sparkles, AlertOctagon, X } from 'lucide-react';
import { useGetAnnouncementsQuery } from '@/lib/store/api/announcementsApi';
import type { AnnouncementType } from '@/lib/types/announcement.types';

export function AnnouncementBanner() {
  const { data: response } = useGetAnnouncementsQuery({ limit: 5 });
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('dismissed_announcements');
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      sessionStorage.setItem('dismissed_announcements', JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const activeAnnouncements = (response?.data || []).filter(
    (a) => a.isActive && !dismissedIds.includes(a.id)
  );

  if (activeAnnouncements.length === 0) return null;

  const current = activeAnnouncements[0];

  const getStyle = (type: AnnouncementType) => {
    switch (type) {
      case 'MAINTENANCE':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-900 dark:text-amber-200',
          desc: 'text-amber-800 dark:text-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
        };
      case 'ALERT':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800',
          text: 'text-rose-900 dark:text-rose-200',
          desc: 'text-rose-800 dark:text-rose-300',
          icon: <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
        };
      case 'NEWS':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800',
          text: 'text-emerald-900 dark:text-emerald-200',
          desc: 'text-emerald-800 dark:text-emerald-300',
          icon: <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        };
      case 'UPDATE':
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/40',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-900 dark:text-blue-200',
          desc: 'text-blue-800 dark:text-blue-300',
          icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
        };
    }
  };

  const style = getStyle(current.type);

  return (
    <div
      className={`p-3.5 rounded-xl border ${style.bg} ${style.border} flex items-start justify-between gap-3 shadow-sm transition-all`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{style.icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">{current.title}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-900/70 border border-current opacity-75">
              {current.type}
            </span>
          </div>
          <p className={`text-sm mt-0.5 ${style.desc}`}>{current.content}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleDismiss(current.id)}
        className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition"
        title="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
