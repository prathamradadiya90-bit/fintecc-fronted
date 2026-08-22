'use client';

import React from 'react';
import { TallySyncJob } from '@/lib/types/tallySyncJob.types';
import { RefreshCw, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface SyncStatsCardsProps {
  jobs: TallySyncJob[];
  totalCount: number;
}

export function SyncStatsCards({ jobs, totalCount }: SyncStatsCardsProps) {
  const pendingCount = jobs.filter((j) => j.status === 'PENDING').length;
  const successCount = jobs.filter((j) => j.status === 'SUCCESS').length;
  const failedCount = jobs.filter((j) => j.status === 'FAILED').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Total Jobs */}
      <div
        className="p-4 rounded-xl border shadow-sm flex flex-col justify-between"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Total Sync Jobs
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-[#00C2B3] flex items-center justify-center">
            <RefreshCw className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
            {totalCount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs mt-0.5 text-[var(--color-text-secondary)]">
            All Cloud-to-Tally batches
          </p>
        </div>
      </div>

      {/* Pending in Queue */}
      <div
        className="p-4 rounded-xl border shadow-sm flex flex-col justify-between"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Pending Queue
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-xl font-bold text-amber-500">
            {pendingCount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs mt-0.5 text-amber-600/80 dark:text-amber-400/80">
            Waiting for connector poll
          </p>
        </div>
      </div>

      {/* Successful */}
      <div
        className="p-4 rounded-xl border shadow-sm flex flex-col justify-between"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Successfully Imported
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {successCount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs mt-0.5 text-emerald-600/80 dark:text-emerald-400/80">
            Committed to Tally Prime
          </p>
        </div>
      </div>

      {/* Failed */}
      <div
        className="p-4 rounded-xl border shadow-sm flex flex-col justify-between"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Failed Jobs
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-xl font-bold text-rose-500">
            {failedCount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs mt-0.5 text-rose-500/80">
            Click retry to re-queue
          </p>
        </div>
      </div>
    </div>
  );
}
