import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  PlusCircle, 
  CheckCheck,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { GstImsInvoice } from '@/lib/types/gst.types';
import { 
  useTakeImsActionMutation, 
  useBulkImsActionMutation, 
  useCreateVoucherFromImsMutation 
} from '@/lib/store/api/gstApi';

interface ImsVoucherViewProps {
  clientId: string;
  invoices: GstImsInvoice[];
  total: number;
  isLoading?: boolean;
  selectedAction: string;
  onActionChange: (action: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  onRefresh?: () => void;
}

export const ImsVoucherView: React.FC<ImsVoucherViewProps> = ({
  clientId,
  invoices,
  total,
  isLoading,
  selectedAction,
  onActionChange,
  searchTerm,
  onSearchChange,
  onRefresh
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [takeActionApi, { isLoading: isUpdatingSingle }] = useTakeImsActionMutation();
  const [bulkActionApi, { isLoading: isUpdatingBulk }] = useBulkImsActionMutation();
  const [createVoucherApi, { isLoading: isCreatingVoucher }] = useCreateVoucherFromImsMutation();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(invoices.map((inv) => inv.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSingleAction = async (id: string, action: string) => {
    try {
      await takeActionApi({ id, clientId, action }).unwrap();
      onRefresh?.();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update action');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkActionApi({ clientId, invoiceIds: selectedIds, action }).unwrap();
      setSelectedIds([]);
      onRefresh?.();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to apply bulk action');
    }
  };

  const handleCreateVoucher = async (id: string) => {
    try {
      await createVoucherApi({ id, clientId }).unwrap();
      alert('Internal purchase voucher created and auto-linked!');
      onRefresh?.();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to create purchase voucher');
    }
  };

  return (
    <div
      className="p-5 rounded-2xl border space-y-4"
      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'All Invoices' },
            { id: 'PENDING', label: 'Pending / Unreviewed' },
            { id: 'ACCEPTED', label: 'Accepted' },
            { id: 'REJECTED', label: 'Rejected' },
            { id: 'TBS', label: 'Staged (TBS)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onActionChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                selectedAction === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-heading)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search supplier, GSTIN, invoice..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Bulk Action Sticky Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>{selectedIds.length}</strong> invoices selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-xs"
              onClick={() => handleBulkAction('ACCEPTED')}
              isLoading={isUpdatingBulk}
            >
              Accept Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-amber-600 hover:bg-amber-500 text-white border-none h-7 text-xs"
              onClick={() => handleBulkAction('PENDING')}
              isLoading={isUpdatingBulk}
            >
              Mark Pending
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-rose-600 hover:bg-rose-500 text-white border-none h-7 text-xs"
              onClick={() => handleBulkAction('REJECTED')}
              isLoading={isUpdatingBulk}
            >
              Reject Selected
            </Button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
              <th className="p-3 w-8">
                <input
                  type="checkbox"
                  checked={invoices.length > 0 && selectedIds.length === invoices.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="p-3 font-semibold">Supplier / GSTIN</th>
              <th className="p-3 font-semibold">Invoice Details</th>
              <th className="p-3 font-semibold text-right">Taxable Value</th>
              <th className="p-3 font-semibold text-right">Tax Breakdown</th>
              <th className="p-3 font-semibold text-right">Total (â‚¹)</th>
              <th className="p-3 font-semibold text-center">Books Match</th>
              <th className="p-3 font-semibold text-center">IMS Action</th>
              <th className="p-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  Loading IMS records...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                  No IMS invoices match the current filter.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const isSelected = selectedIds.includes(inv.id);
                const taxSum = (Number(inv.cgst) || 0) + (Number(inv.sgst) || 0) + (Number(inv.igst) || 0);

                return (
                  <tr
                    key={inv.id}
                    className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                      isSelected ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                    }`}
                    style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                  >
                    {/* Checkbox */}
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRow(inv.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>

                    {/* Supplier */}
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {inv.supplierName || 'Unknown Vendor'}
                      </div>
                      <div className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                        {inv.supplierGstin}
                      </div>
                    </td>

                    {/* Invoice Details */}
                    <td className="p-3">
                      <div className="font-mono font-medium">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1.5">
                        <span>{inv.invoiceDate}</span>
                        <span className="px-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
                          {inv.invoiceType || 'B2B'}
                        </span>
                      </div>
                    </td>

                    {/* Taxable Value */}
                    <td className="p-3 text-right font-mono">
                      â‚¹{Number(inv.taxableValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Tax Breakdown */}
                    <td className="p-3 text-right font-mono text-[11px] text-[var(--color-text-secondary)]">
                      <div>IGST: â‚¹{Number(inv.igst || 0).toFixed(2)}</div>
                      <div>C+S: â‚¹{((Number(inv.cgst) || 0) + (Number(inv.sgst) || 0)).toFixed(2)}</div>
                    </td>

                    {/* Total Amount */}
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      â‚¹{Number(inv.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Books Match Status */}
                    <td className="p-3 text-center">
                      {inv.matchStatus === 'MATCHED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Matched
                        </span>
                      ) : inv.matchStatus === 'MISMATCHED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                          <AlertCircle className="w-3 h-3" /> Mismatch
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Unrecorded
                        </span>
                      )}
                    </td>

                    {/* Action Selector */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                        <button
                          title="Accept ITC"
                          onClick={() => handleSingleAction(inv.id, 'ACCEPTED')}
                          className={`p-1 rounded text-xs transition-colors ${
                            inv.action === 'ACCEPTED'
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'text-slate-500 hover:text-emerald-600'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Mark Pending"
                          onClick={() => handleSingleAction(inv.id, 'PENDING')}
                          className={`p-1 rounded text-xs transition-colors ${
                            inv.action === 'PENDING'
                              ? 'bg-amber-600 text-white font-bold'
                              : 'text-slate-500 hover:text-amber-600'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Reject"
                          onClick={() => handleSingleAction(inv.id, 'REJECTED')}
                          className={`p-1 rounded text-xs transition-colors ${
                            inv.action === 'REJECTED'
                              ? 'bg-rose-600 text-white font-bold'
                              : 'text-slate-500 hover:text-rose-600'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {inv.isTbs && (
                        <div className="mt-1">
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                            TBS Staged
                          </span>
                        </div>
                      )}
                    </td>

                    {/* In-Screen Record/Link */}
                    <td className="p-3 text-center">
                      {!inv.linkedPurchaseInvoiceId ? (
                        <button
                          onClick={() => handleCreateVoucher(inv.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                          title="Record into purchase ledger"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Record in Books
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Linked</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

