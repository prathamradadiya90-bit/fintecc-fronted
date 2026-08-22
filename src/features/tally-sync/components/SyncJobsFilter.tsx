'use client';

import React from 'react';
import { TallyJobStatus } from '@/lib/types/tallySyncJob.types';
import { Button } from '@/components/ui/Button';
import { RefreshCw, RotateCcw } from 'lucide-react';

interface SyncJobsFilterProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  onRetryAll: () => void;
  isRetryingAll: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  failedCount: number;
}

export function SyncJobsFilter({
  currentStatus,
  onStatusChange,
  onRetryAll,
  isRetryingAll,
  onRefresh,
  isRefreshing,
  failedCount,
}: SyncJobsFilterProps) {
  const statusOptions = [
    { label: 'All Jobs', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Success', value: 'SUCCESS' },
    { label: 'Failed', value: 'FAILED' },
  ];

  return (
    <div
      className="p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
      style={{
        background: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {statusOptions.map((opt) => {
          const isSelected = currentStatus === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-[#00C2B3] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card-hover)]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {failedCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetryAll}
            isLoading={isRetryingAll}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-rose-500" />}
            className="text-xs border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            Retry All Failed ({failedCount})
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={isRefreshing}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Refresh Queue
        </Button>
      </div>
    </div>
  );
}
