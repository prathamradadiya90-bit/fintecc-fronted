import React from 'react';
import { FileCheck, CheckCircle2, XCircle, Clock, Send, ShieldAlert, ArrowUpRight } from 'lucide-react';
import type { ImsSummary } from '@/lib/types/gst.types';

interface ImsDocumentSummaryProps {
  summary: ImsSummary | null | undefined;
  isLoading?: boolean;
}

export const ImsDocumentSummary: React.FC<ImsDocumentSummaryProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  const s = summary || {
    totalInvoices: 0,
    totalTaxableValue: 0,
    totalTax: 0,
    totalAmount: 0,
    actions: { noAction: 0, accepted: 0, rejected: 0, pending: 0 },
    reconciliation: { matched: 0, mismatched: 0, unmatched: 0 },
    tbsCount: 0,
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Invoices */}
        <div
          className="p-4 rounded-2xl border"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>Total IMS Records</span>
            <FileCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[var(--color-text-heading)]">
              {s.totalInvoices}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">invoices</span>
          </div>
          <div className="mt-1 text-xs text-[var(--color-text-secondary)] font-mono">
            Tax: ₹{s.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Accepted ITC */}
        <div className="p-4 rounded-2xl border bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
            <span className="font-medium">Accepted (ITC Availed)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
              {s.actions.accepted}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">invoices</span>
          </div>
          <div className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80 font-mono">
            {s.reconciliation.matched} matched in books
          </div>
        </div>

        {/* Pending Actions */}
        <div className="p-4 rounded-2xl border bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
            <span className="font-medium">Pending Decision</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300">
              {s.actions.pending + s.actions.noAction}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400">awaiting</span>
          </div>
          <div className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
            {s.actions.noAction} unreviewed
          </div>
        </div>

        {/* Staged for TBS */}
        <div className="p-4 rounded-2xl border bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
            <span className="font-medium">Staged (TBS)</span>
            <Send className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-blue-700 dark:text-blue-300">
              {s.tbsCount}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400">staged</span>
          </div>
          <div className="mt-1 text-xs text-blue-600/80 dark:text-blue-400/80">
            Ready to push to GST Portal
          </div>
        </div>
      </div>
    </div>
  );
};

