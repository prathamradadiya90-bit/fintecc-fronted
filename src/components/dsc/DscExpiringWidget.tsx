'use client';

import React from 'react';
import Link from 'next/link';
import { Key, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { useGetExpiringDscsQuery } from '@/lib/store/api/dscApi';

export const DscExpiringWidget: React.FC = () => {
  const { data, isLoading } = useGetExpiringDscsQuery();
  const expiringTokens = data?.data || [];

  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-5 animate-pulse"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
        <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
      </div>
    );
  }

  if (expiringTokens.length === 0) {
    return null; // Don't take up space on CA dashboard if no tokens are expiring
  }

  const criticalCount = expiringTokens.filter((t) => {
    const diff = Math.ceil(
      (new Date(t.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return diff <= 7;
  }).length;

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden border"
      style={{
        background: 'var(--color-bg-card)',
        borderColor: criticalCount > 0 ? '#f43f5e33' : '#f59e0b33',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              criticalCount > 0
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
            }`}
          >
            {criticalCount > 0 ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base" style={{ color: 'var(--color-text-heading)' }}>
                DSC Token Renewal Alert
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  criticalCount > 0
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                }`}
              >
                {expiringTokens.length} {expiringTokens.length === 1 ? 'Token' : 'Tokens'}
              </span>
            </div>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {criticalCount > 0
                ? `${criticalCount} DSC ${criticalCount === 1 ? 'token is' : 'tokens are'} expiring within 7 days. Action is urgently required for MCA / GST filings.`
                : `${expiringTokens.length} client DSC ${expiringTokens.length === 1 ? 'token is' : 'tokens are'} expiring in the next 30 days.`}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/dsc"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#00C2B3]/10 text-[#00C2B3] hover:bg-[#00C2B3]/20 transition-colors shrink-0 self-start sm:self-auto"
        >
          Manage DSC Tokens
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
