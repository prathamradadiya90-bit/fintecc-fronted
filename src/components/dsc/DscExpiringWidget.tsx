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
        borderColor: criticalCount > 0 
          ? 'var(--color-status-danger-border, rgba(158, 74, 74, 0.2))' 
          : 'var(--color-status-warning-border, rgba(158, 107, 66, 0.2))',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className="p-2.5 rounded-xl shrink-0"
            style={{
              background: criticalCount > 0 
                ? 'var(--color-status-danger-bg, rgba(158, 74, 74, 0.08))' 
                : 'var(--color-status-warning-bg, rgba(158, 107, 66, 0.08))',
              color: criticalCount > 0 
                ? 'var(--color-status-danger-text, #9E4A4A)' 
                : 'var(--color-status-warning-text, #9E6B42)',
            }}
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
                className="px-2 py-0.5 rounded-full text-xs font-semibold border"
                style={{
                  background: criticalCount > 0 
                    ? 'var(--color-status-danger-bg, rgba(158, 74, 74, 0.08))' 
                    : 'var(--color-status-warning-bg, rgba(158, 107, 66, 0.08))',
                  color: criticalCount > 0 
                    ? 'var(--color-status-danger-text, #9E4A4A)' 
                    : 'var(--color-status-warning-text, #9E6B42)',
                  borderColor: criticalCount > 0 
                    ? 'var(--color-status-danger-border, rgba(158, 74, 74, 0.2))' 
                    : 'var(--color-status-warning-border, rgba(158, 107, 66, 0.2))',
                }}
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
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#4A6FA5]/10 dark:bg-[#4A6FA5]/25 text-[#4A6FA5] dark:text-[#A8C5DA] hover:bg-[#4A6FA5]/20 dark:hover:bg-[#4A6FA5]/40 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
        >
          Manage DSC Tokens
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
