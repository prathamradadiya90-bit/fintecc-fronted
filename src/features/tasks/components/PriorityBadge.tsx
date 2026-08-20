'use client';

import React from 'react';
import type { TaskPriority } from '@/lib/types/task.types';

interface PriorityBadgeProps {
  priority: TaskPriority | string;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const normalized = (priority || 'MEDIUM').toUpperCase() as TaskPriority;

  const styles = {
    LOW: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    URGENT: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 animate-pulse',
  };

  const labels = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
  };

  const styleClass = styles[normalized] || styles.MEDIUM;
  const label = labels[normalized] || priority;

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors ${styleClass} ${sizeClass}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          normalized === 'URGENT'
            ? 'bg-red-500'
            : normalized === 'HIGH'
            ? 'bg-amber-500'
            : normalized === 'MEDIUM'
            ? 'bg-blue-500'
            : 'bg-slate-400'
        }`}
      />
      {label}
    </span>
  );
};
