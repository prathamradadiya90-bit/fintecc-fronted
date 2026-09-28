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
    MEDIUM: 'bg-[#A8C5DA]/25 text-[#4A6FA5] border-[#A8C5DA]/40',
    HIGH: 'bg-[rgba(158,107,66,0.08)] text-[#9E6B42] border-[rgba(158,107,66,0.25)]',
    URGENT: 'bg-[rgba(158,74,74,0.08)] text-[#9E4A4A] border-[rgba(158,74,74,0.25)] animate-pulse',
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
            ? 'bg-[#9E4A4A]'
            : normalized === 'HIGH'
            ? 'bg-[#9E6B42]'
            : normalized === 'MEDIUM'
            ? 'bg-[#4A6FA5]'
            : 'bg-slate-400'
        }`}
      />
      {label}
    </span>
  );
};
