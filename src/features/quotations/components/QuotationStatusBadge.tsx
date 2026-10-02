import React from 'react';
import type { QuotationStatus } from '@/lib/types/quotation.types';

const statusConfig: Record<QuotationStatus, { label: string; bg: string; text: string; border: string }> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
  },
  SENT: {
    label: 'Sent to Client',
    bg: 'bg-[rgba(74,111,165,0.08)]',
    text: 'text-[#4A6FA5] dark:text-[#A8C5DA]',
    border: 'border-[rgba(74,111,165,0.25)]',
  },
  ACCEPTED: {
    label: 'Accepted',
    bg: 'bg-[rgba(61,122,100,0.08)]',
    text: 'text-[#3D7A64] dark:text-emerald-400',
    border: 'border-[rgba(61,122,100,0.25)]',
  },
  REJECTED: {
    label: 'Declined',
    bg: 'bg-[rgba(158,74,74,0.08)]',
    text: 'text-[#9E4A4A] dark:text-rose-400',
    border: 'border-[rgba(158,74,74,0.25)]',
  },
  EXPIRED: {
    label: 'Expired',
    bg: 'bg-[rgba(158,107,66,0.08)]',
    text: 'text-[#9E6B42] dark:text-amber-400',
    border: 'border-[rgba(158,107,66,0.25)]',
  },
};

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}
