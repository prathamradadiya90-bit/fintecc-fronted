import React, { useState } from 'react';
import { GitCompare, CheckCircle2, AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useReconcileItcMutation } from '@/lib/store/api/gstApi';

interface ItcReconciliationCardProps {
  returnId: string;
  itcClaimed?: number;
}

export const ItcReconciliationCard: React.FC<ItcReconciliationCardProps> = ({
  returnId,
  itcClaimed = 0,
}) => {
  const [reconcileItcApi, { isLoading }] = useReconcileItcMutation();
  const [reconciled, setReconciled] = useState(false);
  const [reconcileData, setReconcileData] = useState<{
    matched: number;
    mismatched: number;
    pending: number;
    totalPurchaseInvoices?: number;
    counts?: { matched: number; mismatched: number; pending: number };
    breakdown?: { igst: number; cgst: number; sgst: number; cess: number };
  } | null>(null);

  const handleReconcile = async () => {
    try {
      const res = await reconcileItcApi(returnId).unwrap();
      setReconciled(true);
      if (res?.data) {
        setReconcileData({
          matched: Number(res.data.matched ?? res.data.totalItcAvailable ?? 0),
          mismatched: Number(res.data.mismatched ?? res.data.totalItcIneligible ?? 0),
          pending: Number(res.data.pending ?? 0),
          totalPurchaseInvoices: res.data.totalPurchaseInvoices ?? 0,
          counts: res.data.counts || { matched: 0, mismatched: 0, pending: 0 },
          breakdown: res.data.breakdown || { igst: 0, cgst: 0, sgst: 0, cess: 0 }
        });
      }
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to reconcile ITC');
    }
  };

  return (
    <div
      className="p-5 rounded-2xl border space-y-4"
      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)' }}>
              ITC Auto-Reconciliation (IMS / GSTR-2B vs Purchase Invoices)
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Match supplier uploaded portal actions & GSTR-2B data with your client purchase register.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReconcile}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-amber-600" />}
        >
          {reconciled ? 'Re-Run Reconciliation' : 'Run ITC Reconcile'}
        </Button>
      </div>

      {reconciled && reconcileData && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Matched ITC (Eligible)</span>
                </div>
                {reconcileData.counts?.matched !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-medium">
                    {reconcileData.counts.matched} inv
                  </span>
                )}
              </div>
              <p className="text-lg font-bold mt-1 text-emerald-700 dark:text-emerald-300 font-mono">
                ₹{reconcileData.matched.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-3 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Mismatched / Ineligible</span>
                </div>
                {reconcileData.counts?.mismatched !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-medium">
                    {reconcileData.counts.mismatched} inv
                  </span>
                )}
              </div>
              <p className="text-lg font-bold mt-1 text-amber-700 dark:text-amber-300 font-mono">
                ₹{reconcileData.mismatched.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                  <HelpCircle className="w-4 h-4" />
                  <span>Supplier Unuploaded / Pending</span>
                </div>
                {reconcileData.counts?.pending !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {reconcileData.counts.pending} inv
                  </span>
                )}
              </div>
              <p className="text-lg font-bold mt-1 text-slate-700 dark:text-slate-300 font-mono">
                ₹{reconcileData.pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {reconcileData.breakdown && (
            <div className="flex flex-wrap items-center gap-4 text-xs p-3 rounded-lg bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              <span className="font-semibold text-[var(--color-text-heading)]">Eligible Tax Breakdown:</span>
              <span>IGST: <strong className="text-slate-900 dark:text-white font-mono">₹{reconcileData.breakdown.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
              <span>CGST: <strong className="text-slate-900 dark:text-white font-mono">₹{reconcileData.breakdown.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
              <span>SGST: <strong className="text-slate-900 dark:text-white font-mono">₹{reconcileData.breakdown.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
              {reconcileData.breakdown.cess > 0 && (
                <span>Cess: <strong className="text-slate-900 dark:text-white font-mono">₹{reconcileData.breakdown.cess.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
