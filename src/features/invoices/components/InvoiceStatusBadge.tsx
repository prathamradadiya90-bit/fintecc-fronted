import React from 'react';
import type { InvoiceStatus } from '@/lib/types/invoice-management.types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PAID: {
    label: 'Paid',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
  },
  PENDING_REVIEW: {
    label: 'Under Review',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/20',
  },
  SENT: {
    label: 'Sent',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
  },
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
  },
  OVERDUE: {
    label: 'Overdue',
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-neutral-500/10',
    text: 'text-neutral-600 dark:text-neutral-400',
    border: 'border-neutral-500/20',
  },
};

export function InvoiceStatusBadge({ status, className = '' }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  );
}
