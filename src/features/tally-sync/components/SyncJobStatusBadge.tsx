'use client';

import React from 'react';
import { TallyJobStatus } from '@/lib/types/tallySyncJob.types';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface SyncJobStatusBadgeProps {
  status: TallyJobStatus | string;
}

export function SyncJobStatusBadge({ status }: SyncJobStatusBadgeProps) {
  switch (status?.toUpperCase()) {
    case 'SUCCESS':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-3 h-3" />
          Synced
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
          <XCircle className="w-3 h-3" />
          Failed
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 animate-pulse">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
  }
}
