import React from 'react';
import { Building2, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { ImsVendorSummaryItem } from '@/lib/types/gst.types';

interface ImsVendorViewProps {
  vendors: ImsVendorSummaryItem[];
  isLoading?: boolean;
}

export const ImsVendorView: React.FC<ImsVendorViewProps> = ({ vendors, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading vendor aggregate data...
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        No supplier data found for this period.
      </div>
    );
  }

  return (
    <div
      className="p-5 rounded-2xl border space-y-4"
      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)' }}>
            Supplier Mismatch & Action Matrix
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Aggregate IMS actions and book matching summary grouped by supplier.
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-[var(--color-text-secondary)]">
          {vendors.length} Vendors
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
              <th className="p-3 font-semibold">Vendor / GSTIN</th>
              <th className="p-3 font-semibold text-center">Invoices</th>
              <th className="p-3 font-semibold text-right">Taxable (₹)</th>
              <th className="p-3 font-semibold text-right">Total Tax (₹)</th>
              <th className="p-3 font-semibold text-right">Total Amount (₹)</th>
              <th className="p-3 font-semibold text-center">Actions Taken</th>
              <th className="p-3 font-semibold text-center">Reconciliation</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => {
              const matchPercent = v.invoiceCount > 0 ? Math.round((v.matchedCount / v.invoiceCount) * 100) : 0;
              return (
                <tr
                  key={v.supplierGstin}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                >
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {v.supplierName}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                      {v.supplierGstin}
                    </div>
                  </td>

                  <td className="p-3 text-center font-mono font-bold">
                    {v.invoiceCount}
                  </td>

                  <td className="p-3 text-right font-mono">
                    ₹{v.totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="p-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{v.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    ₹{v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <span className="flex items-center gap-0.5 text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> {v.acceptedCount}
                      </span>
                      <span className="flex items-center gap-0.5 text-amber-600">
                        <Clock className="w-3 h-3" /> {v.pendingCount + v.noActionCount}
                      </span>
                      {v.rejectedCount > 0 && (
                        <span className="flex items-center gap-0.5 text-rose-600">
                          <XCircle className="w-3 h-3" /> {v.rejectedCount}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${matchPercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-[var(--color-text-secondary)] font-medium">
                        {matchPercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

