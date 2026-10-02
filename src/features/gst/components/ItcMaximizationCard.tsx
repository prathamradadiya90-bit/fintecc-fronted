'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  IndianRupee,
  GitCompare,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useGetItcDashboardQuery,
  useReconcileUnifiedMutation,
} from '@/lib/store/api/gstApi';
import { useToast } from '@/components/ui/Toast';

interface ItcMaximizationCardProps {
  clientId: string;
  period: string;
}

export function ItcMaximizationCard({ clientId, period }: ItcMaximizationCardProps) {
  const { showToast } = useToast();
  const { data: response, isLoading, refetch } = useGetItcDashboardQuery({ clientId, period });
  const [reconcileUnified, { isLoading: isReconciling }] = useReconcileUnifiedMutation();

  const [unifiedResult, setUnifiedResult] = useState<any | null>(null);

  const itcData = response?.data;
  const ledger = itcData?.ledger;
  const rule180Warning = itcData?.rule180Warning || { count: 0, expiringAmount: 0, invoices: [] };
  const rule180Violation = itcData?.rule180Violation || { count: 0, invoices: [] };

  const handleRunUnifiedReconciliation = async () => {
    try {
      const res = await reconcileUnified({ clientId, period, includeIMS: true }).unwrap();
      setUnifiedResult(res.data);
      showToast('Unified GSTR-1, 2B & IMS multi-way reconciliation completed!', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to run unified reconciliation', 'error');
    }
  };

  if (isLoading) {
    return (
      <div
        className="p-6 rounded-2xl border animate-pulse space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="h-6 w-56 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-24 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Section 16(2) 180-Day Rule Warning Card ── */}
      <div
        className="p-5 rounded-2xl border space-y-4"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: rule180Warning.count > 0 ? 'rgba(158,107,66,0.3)' : 'var(--color-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                rule180Violation.count > 0
                  ? 'bg-[rgba(158,74,74,0.1)] text-[#9E4A4A]'
                  : rule180Warning.count > 0
                  ? 'bg-[rgba(158,107,66,0.1)] text-[#9E6B42]'
                  : 'bg-[rgba(61,122,100,0.08)] text-[#3D7A64]'
              }`}
            >
              {rule180Violation.count > 0 ? (
                <ShieldAlert className="w-5 h-5" />
              ) : rule180Warning.count > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
                Section 16(2) Payment Monitor (180-Day Non-Payment Rule)
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Automated detector tracking purchase invoices approaching or exceeding the 180-day vendor payment limit.
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              rule180Violation.count > 0
                ? 'bg-[rgba(158,74,74,0.08)] text-[#9E4A4A] border-[rgba(158,74,74,0.2)]'
                : rule180Warning.count > 0
                ? 'bg-[rgba(158,107,66,0.08)] text-[#9E6B42] border-[rgba(158,107,66,0.2)]'
                : 'bg-[rgba(61,122,100,0.08)] text-[#3D7A64] border-[rgba(61,122,100,0.2)]'
            }`}
          >
            {rule180Violation.count > 0
              ? `${rule180Violation.count} Violations`
              : rule180Warning.count > 0
              ? `${rule180Warning.count} Invoices at Risk`
              : '100% Compliant'}
          </span>
        </div>

        {/* Warning Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="p-4 rounded-xl border space-y-1"
            style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
          >
            <span className="text-[11px] font-semibold text-[#9E6B42] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Approaching 180 Days (150–180 Days)
            </span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-lg font-bold" style={{ color: 'var(--color-text-heading)' }}>
                ₹{rule180Warning.expiringAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-[#9E6B42]">
                {rule180Warning.count} Purchase Invoices
              </span>
            </div>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              If unpaid within 180 days from invoice date, ITC must be reversed in GSTR-3B with 18% p.a. interest.
            </p>
          </div>

          <div
            className="p-4 rounded-xl border space-y-1"
            style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
          >
            <span className="text-[11px] font-semibold text-[#9E4A4A] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Past 180 Days (Mandatory Reversal)
            </span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-lg font-bold text-[#9E4A4A]">
                {rule180Violation.count} Invoices Overdue
              </span>
            </div>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              These invoices have surpassed 180 days and require statutory Rule 37 reversal in Table 4(B)(2).
            </p>
          </div>
        </div>

        {rule180Warning.invoices.length > 0 && (
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="font-semibold">Flagged Invoices: </span>
            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
              {rule180Warning.invoices.slice(0, 8).join(', ')}
              {rule180Warning.invoices.length > 8 && ` +${rule180Warning.invoices.length - 8} more`}
            </span>
          </div>
        )}
      </div>

      {/* ── Unified Multi-Way Reconciliation (GSTR-1, 2B & IMS) ── */}
      <div
        className="p-5 rounded-2xl border space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5]">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
                Unified Multi-Way Reconciliation (GSTR-1, 2B & IMS)
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Synchronizes outward sales (GSTR-1), 2B purchases, and mock Invoice Management System (IMS) actions.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleRunUnifiedReconciliation}
            isLoading={isReconciling}
            className="bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Run Unified Sync
          </Button>
        </div>

        {unifiedResult && (
          <div
            className="p-4 rounded-xl border space-y-3"
            style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--color-text-heading)' }}>
              Reconciliation Summary (Period: {unifiedResult.period})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">GSTR-1 Sales Invoices</span>
                <span className="font-bold text-sm" style={{ color: 'var(--color-text-heading)' }}>
                  {unifiedResult.summary?.gstr1?.totalInvoices || 0} (₹{Number(unifiedResult.summary?.gstr1?.totalValue || 0).toLocaleString('en-IN')})
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">Matched with GSTR-2B</span>
                <span className="font-bold text-sm text-[#3D7A64]">
                  {unifiedResult.summary?.gstr2?.matchedCount || 0} Invoices
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">Missing in GSTR-2B</span>
                <span className="font-bold text-sm text-[#9E6B42]">
                  {unifiedResult.summary?.gstr2?.missingIn2BCount || 0} Invoices
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">Pending IMS Actions</span>
                <span className="font-bold text-sm text-[#4A6FA5]">
                  {unifiedResult.summary?.gstr2?.imsPendingActions || 0} Actions
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ITC Ledger Breakdown & Rule 42/43 Reversals ── */}
      {ledger && (
        <div
          className="p-5 rounded-2xl border space-y-4"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
              ITC Electronic Ledger Statement (Period {ledger.period})
            </h3>
            {ledger.reversalReason && (
              <span className="text-xs text-[#9E6B42] font-semibold">
                Reason: {ledger.reversalReason}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}>
                <tr>
                  <th className="px-3.5 py-2 text-left font-semibold">Tax Head</th>
                  <th className="px-3.5 py-2 text-right font-semibold">Opening Bal</th>
                  <th className="px-3.5 py-2 text-right font-semibold">Available (2B)</th>
                  <th className="px-3.5 py-2 text-right font-semibold text-[#9E4A4A]">Reversed (R 42/43)</th>
                  <th className="px-3.5 py-2 text-right font-semibold text-[#4A6FA5]">Utilized (3B)</th>
                  <th className="px-3.5 py-2 text-right font-semibold text-[#3D7A64]">Closing Bal</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {[
                  { head: 'IGST', open: ledger.openingIgst, avail: ledger.availableIgst, rev: ledger.reversedIgst, util: ledger.utilizedIgst, close: ledger.closingIgst },
                  { head: 'CGST', open: ledger.openingCgst, avail: ledger.availableCgst, rev: ledger.reversedCgst, util: ledger.utilizedCgst, close: ledger.closingCgst },
                  { head: 'SGST', open: ledger.openingSgst, avail: ledger.availableSgst, rev: ledger.reversedSgst, util: ledger.utilizedSgst, close: ledger.closingSgst },
                  { head: 'CESS', open: ledger.openingCess, avail: ledger.availableCess, rev: ledger.reversedCess, util: ledger.utilizedCess, close: ledger.closingCess },
                ].map((row) => (
                  <tr key={row.head} style={{ color: 'var(--color-text-primary)' }}>
                    <td className="px-3.5 py-2 font-bold">{row.head}</td>
                    <td className="px-3.5 py-2 text-right">₹{Number(row.open || 0).toLocaleString('en-IN')}</td>
                    <td className="px-3.5 py-2 text-right">₹{Number(row.avail || 0).toLocaleString('en-IN')}</td>
                    <td className="px-3.5 py-2 text-right text-[#9E4A4A]">₹{Number(row.rev || 0).toLocaleString('en-IN')}</td>
                    <td className="px-3.5 py-2 text-right text-[#4A6FA5]">₹{Number(row.util || 0).toLocaleString('en-IN')}</td>
                    <td className="px-3.5 py-2 text-right font-bold text-[#3D7A64]">₹{Number(row.close || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
