'use client';

import React, { useState } from 'react';
import {
  useGetAllJobsQuery,
  useRetryJobMutation,
  useRetryAllFailedMutation,
} from '@/lib/store/api/tallyApi';
import { SyncStatsCards } from '@/features/tally-sync/components/SyncStatsCards';
import { SyncJobsFilter } from '@/features/tally-sync/components/SyncJobsFilter';
import { SyncJobsTable } from '@/features/tally-sync/components/SyncJobsTable';
import { ConnectorInfoCard } from '@/features/tally-sync/components/ConnectorInfoCard';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TallySyncPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const {
    data: jobsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllJobsQuery({
    page: currentPage,
    limit: 15,
    status: statusFilter || undefined,
  });

  const [retryJob] = useRetryJobMutation();
  const [retryAllFailed, { isLoading: isRetryingAll }] = useRetryAllFailedMutation();

  const jobs = jobsData?.data || [];
  const meta = jobsData?.meta;
  const totalCount = meta?.total || jobs.length;
  const totalPages = meta?.totalPages || 1;
  const failedCount = jobs.filter((j) => j.status === 'FAILED').length;

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRetryJob = async (jobId: string) => {
    setRetryingJobId(jobId);
    try {
      await retryJob(jobId).unwrap();
      showToast('success', 'Job re-queued for Tally Prime import!');
      refetch();
    } catch (error: any) {
      console.error('Failed to retry job:', error);
      showToast('error', error?.data?.message || 'Failed to re-queue job');
    } finally {
      setRetryingJobId(null);
    }
  };

  const handleRetryAll = async () => {
    try {
      const res = await retryAllFailed().unwrap();
      showToast(
        'success',
        `Successfully re-queued ${res?.data?.affected || failedCount} failed jobs!`
      );
      refetch();
    } catch (error: any) {
      console.error('Failed to retry all jobs:', error);
      showToast('error', error?.data?.message || 'Failed to re-queue failed jobs');
    }
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Direct Tally Sync Queue
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-semibold bg-teal-500/10 text-[#00C2B3]">
              Cloud &harr; Desktop Bridge
            </span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Monitor real-time voucher transfers into Tally Prime without XML downloads.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-medium animate-fadeIn ${
            toastMessage.type === 'success'
              ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-900'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#00C2B3] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Stats Overview */}
      <SyncStatsCards jobs={jobs} totalCount={totalCount} />

      {/* Desktop Connector Helper Card */}
      <ConnectorInfoCard />

      {/* Filter & Actions Bar */}
      <SyncJobsFilter
        currentStatus={statusFilter}
        onStatusChange={handleStatusChange}
        onRetryAll={handleRetryAll}
        isRetryingAll={isRetryingAll}
        onRefresh={refetch}
        isRefreshing={isFetching}
        failedCount={failedCount}
      />

      {/* Sync Jobs Table */}
      <SyncJobsTable
        jobs={jobs}
        isLoading={isLoading}
        onRetryJob={handleRetryJob}
        retryingJobId={retryingJobId}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
