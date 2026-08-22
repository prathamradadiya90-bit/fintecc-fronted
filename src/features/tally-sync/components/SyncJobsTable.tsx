'use client';

import React, { useState } from 'react';
import { TallySyncJob } from '@/lib/types/tallySyncJob.types';
import { SyncJobStatusBadge } from './SyncJobStatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  RotateCcw,
  FileText,
  Building2,
  ShoppingBag,
  AlertTriangle,
  Code,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

interface SyncJobsTableProps {
  jobs: TallySyncJob[];
  isLoading: boolean;
  onRetryJob: (jobId: string) => void;
  retryingJobId?: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const getEntityBadge = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'BANK_STATEMENT':
      return {
        label: 'Bank Statement',
        icon: Building2,
        color: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
      };
    case 'ECOMMERCE_BATCH':
      return {
        label: 'E-Commerce Batch',
        icon: ShoppingBag,
        color: 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300',
      };
    case 'INVOICE':
    default:
      return {
        label: 'Sales Invoice',
        icon: FileText,
        color: 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300',
      };
  }
};

export function SyncJobsTable({
  jobs,
  isLoading,
  onRetryJob,
  retryingJobId,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}: SyncJobsTableProps) {
  const [selectedErrorLog, setSelectedErrorLog] = useState<{ id: string; log: string } | null>(null);
  const [selectedXml, setSelectedXml] = useState<{ id: string; xml: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div
        className="rounded-2xl border p-8 text-center animate-pulse"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Fetching sync queue from cloud database...
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="rounded-2xl border shadow-sm overflow-hidden"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className="border-b"
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <th className="py-3 px-4 font-semibold">Job ID</th>
                <th className="py-3 px-4 font-semibold">Entity Type</th>
                <th className="py-3 px-4 font-semibold">Sync Status</th>
                <th className="py-3 px-4 font-semibold">Created At</th>
                <th className="py-3 px-4 font-semibold">Diagnostic / XML</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-[var(--color-text-secondary)]">
                    No sync jobs found in this queue.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => {
                  const entity = getEntityBadge(job.entityType);
                  const EntityIcon = entity.icon;
                  const isRetrying = retryingJobId === job.id;

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-[var(--color-bg-card-hover)] transition-colors"
                    >
                      {/* Job ID */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="truncate max-w-[100px] font-medium"
                            style={{ color: 'var(--color-text-primary)' }}
                            title={job.id}
                          >
                            {job.id.slice(0, 8)}...
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(job.id, job.id)}
                            className="text-slate-400 hover:text-slate-200 transition-colors"
                            title="Copy full Job ID"
                          >
                            {copiedId === job.id ? (
                              <Check className="w-3.5 h-3.5 text-teal-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Entity Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${entity.color}`}
                        >
                          <EntityIcon className="w-3.5 h-3.5" />
                          {entity.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <SyncJobStatusBadge status={job.status} />
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                        <div>
                          <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {new Date(job.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-[10px]">
                            {new Date(job.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </td>

                      {/* Diagnostics */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {job.errorLog ? (
                            <button
                              type="button"
                              onClick={() => setSelectedErrorLog({ id: job.id, log: job.errorLog! })}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:underline"
                            >
                              <AlertTriangle className="w-3 h-3" /> Error Details
                            </button>
                          ) : null}

                          {job.xmlPayload ? (
                            <button
                              type="button"
                              onClick={() => setSelectedXml({ id: job.id, xml: job.xmlPayload! })}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[#00C2B3]"
                            >
                              <Code className="w-3 h-3" /> View XML
                            </button>
                          ) : null}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {job.status === 'FAILED' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRetryJob(job.id)}
                            isLoading={isRetrying}
                            leftIcon={<RotateCcw className="w-3 h-3 text-rose-500" />}
                            className="text-xs border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            Retry Sync
                          </Button>
                        ) : job.status === 'PENDING' ? (
                          <span className="text-[11px] text-amber-500/90 font-medium">
                            Polling...
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-500/90 font-medium">
                            Synced
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t flex items-center justify-between text-xs border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)]">
              Showing page {currentPage} of {totalPages} ({totalCount} total jobs)
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-1.5 rounded-lg border text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed border-[var(--color-border)]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {currentPage}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-1.5 rounded-lg border text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed border-[var(--color-border)]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Log Modal */}
      {selectedErrorLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedErrorLog(null)}
          title="Tally Prime Sync Error Log"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p>Tally Desktop Connector reported a rejection from your local Tally Prime instance.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-64 whitespace-pre-wrap">
              {selectedErrorLog.log}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedErrorLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* XML Payload Modal */}
      {selectedXml && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedXml(null)}
          title="Generated Tally XML Payload"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-72 whitespace-pre-wrap">
              {selectedXml.xml}
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleCopy(selectedXml.xml, 'modal-xml')}
                className="text-xs font-semibold text-[#00C2B3] hover:underline flex items-center gap-1"
              >
                {copiedId === 'modal-xml' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === 'modal-xml' ? 'Copied!' : 'Copy XML Content'}
              </button>
              <Button variant="outline" size="sm" onClick={() => setSelectedXml(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
