import React from 'react';
import type { ReturnStatus } from '@/lib/types/gst.types';

interface ReturnStatusBadgeProps {
  status: ReturnStatus | string;
  size?: 'sm' | 'md';
}

export const ReturnStatusBadge: React.FC<ReturnStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const statusConfigs: Record<string, { label: string; classNames: string }> = {
    DRAFT: {
      label: 'Draft',
      classNames: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
    READY_FOR_REVIEW: {
      label: 'Ready for Review',
      classNames: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    },
    CLIENT_APPROVED: {
      label: 'Client Approved',
      classNames: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    },
    FILED: {
      label: 'Filed',
      classNames: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    },
    REJECTED: {
      label: 'Rejected',
      classNames: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
    },
    NEEDS_REVISION: {
      label: 'Needs Revision',
      classNames: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    },
  };

  const config = statusConfigs[status] || {
    label: status,
    classNames: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClasses} ${config.classNames}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {config.label}
    </span>
  );
};
