'use client';

import React, { useState } from 'react';
import {
  Download,
  Puzzle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export function PluginDownloadCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleDownloadPlugin = async () => {
    setIsDownloading(true);
    setDownloadStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/tally/plugin/download`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Download failed (${response.status})`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'caflow-sync-plugin.tdl');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadStatus({
        type: 'success',
        text: 'Plugin downloaded! Follow the steps below to install it in Tally.',
      });
    } catch (error: any) {
      console.error('Failed to download plugin:', error);
      setDownloadStatus({
        type: 'error',
        text: error?.message || 'Failed to download plugin. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const installationSteps = [
    {
      step: 1,
      text: 'Click "Download Plugin" to save the .tdl file to your computer.',
    },
    {
      step: 2,
      text: 'Open Tally Prime / ERP 9.',
    },
    {
      step: 3,
      instruction: (
        <>
          Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">
            F4
          </kbd>{' '}
          (Manage Local TDLs) or go to{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">
            F1
          </kbd>{' '}
          &gt; TDLs &amp; Add-Ons.
        </>
      ),
    },
    {
      step: 4,
      instruction: (
        <>
          Set &quot;<span className="font-semibold text-[#00C2B3]">Load TDL files on startup</span>&quot; to{' '}
          <span className="font-semibold">Yes</span>, and select the downloaded
          file.
        </>
      ),
    },
  ];

  return (
    <div
      className="p-5 rounded-2xl border transition-all"
      style={{
        background: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Puzzle className="w-5 h-5" />
          </div>
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--color-text-heading)' }}
            >
              CAflow Tally Sync Plugin
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Reliability plugin that prevents silent failures during ledger
              sync
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPlugin}
            isLoading={isDownloading}
            leftIcon={
              !isDownloading ? <Download className="w-3.5 h-3.5" /> : undefined
            }
          >
            Download Plugin
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            rightIcon={
              isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )
            }
            className="text-xs"
          >
            {isExpanded ? 'Hide Guide' : 'Install Guide'}
          </Button>
        </div>
      </div>

      {/* Download Status Feedback */}
      {downloadStatus && (
        <div
          className={`mt-3 p-3 rounded-xl border flex items-center gap-2 text-xs font-medium animate-fadeIn ${
            downloadStatus.type === 'success'
              ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-900'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900'
          }`}
        >
          {downloadStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#00C2B3] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{downloadStatus.text}</span>
        </div>
      )}

      {/* Installation Guide */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <h4
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              How to Install
            </h4>
          </div>

          <ol className="space-y-3">
            {installationSteps.map((item) => (
              <li
                key={item.step}
                className="flex items-start gap-3 text-xs"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </span>
                <span className="font-medium leading-relaxed">
                  {item.text || item.instruction}
                </span>
              </li>
            ))}
          </ol>

          <div
            className="p-3 rounded-xl text-[11px] leading-relaxed"
            style={{
              background: 'var(--color-bg-subtle)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Note:
            </span>{' '}
            This plugin runs inside Tally and ensures ledger creation/updates
            are validated before syncing, preventing silent data loss. It only
            needs to be installed once per Tally instance.
          </div>
        </div>
      )}
    </div>
  );
}
