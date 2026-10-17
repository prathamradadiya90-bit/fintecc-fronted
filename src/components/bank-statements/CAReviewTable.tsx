'use client';

import React, { useState, useMemo } from 'react';
import {
  BankStatementTransaction,
  TransactionStatus,
} from '@/lib/types/bankStatement.types';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Loader2,
  Check,
  Brain,
  Sliders,
  Copy,
  Edit3,
  HelpCircle,
  AlertCircle,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useUpdateReviewRowMutation } from '@/lib/store/api/bankStatementsApi';
import { useToast } from '@/components/ui/Toast';

export const STANDARD_TALLY_LEDGERS = [
  'Suspense Account',
  'Bank Account',
  'Cash-in-Hand',
  'Sales Account',
  'Domestic Sales',
  'Export Sales',
  'Purchases',
  'Meals & Entertainment',
  'Office Expenses',
  'Rent Expenses',
  'Salaries & Wages',
  'Electricity Expenses',
  'Telephone & Internet',
  'Professional & Legal Fees',
  'Bank Charges',
  'Interest Expenses',
  'Travel & Conveyance',
  'Printing & Stationery',
  'Advertising & Marketing',
  'Software & Subscription',
  'Cloud Hosting Expenses',
  'Repairs & Maintenance',
  'Audit Fees',
  'Director Remuneration',
  'Interest Received',
  'Commission Received',
  'Sundry Debtors',
  'Sundry Creditors',
  'GST Input Tax Credit',
  'GST Output Tax',
  'TDS Payable',
  'Capital Account',
  'Drawings',
];

export interface EnrichedRowTransaction extends BankStatementTransaction {
  computedExpectedBalance?: number;
  hasContinuityMismatch?: boolean;
  continuityDifference?: number;
}

interface CAReviewTableProps {
  statementId: string;
  transactions: BankStatementTransaction[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  filterStatus?: string;
  openingBalance?: number | null;
  onRejectRow?: (rowId: string) => void;
}

interface RowEditFields {
  date?: string;
  narration?: string;
  debit?: string;
  credit?: string;
  balance?: string;
  suggestedLedger?: string;
}

export function CAReviewTable({
  statementId,
  transactions,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  filterStatus = 'ALL',
  openingBalance = null,
  onRejectRow,
}: CAReviewTableProps) {
  const { showToast } = useToast();
  const [updateReviewRow] = useUpdateReviewRowMutation();

  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [savedSuccessRowId, setSavedSuccessRowId] = useState<string | null>(null);

  // Temporary row edits storage { [rowId]: { date, narration, debit, credit, balance, suggestedLedger } }
  const [rowEdits, setRowEdits] = useState<Record<string, RowEditFields>>({});

  // 1. Enrich transactions with row-by-row Mathematical Balance Continuity
  // Formula: Current Balance = Previous Balance + Credit - Debit
  const enrichedTransactions = useMemo<EnrichedRowTransaction[]>(() => {
    return transactions.map((tx, idx) => {
      let expectedBal: number | null = null;
      let hasMismatch = Boolean(tx.balanceMismatch);

      if (idx === 0 && openingBalance !== null && openingBalance !== undefined) {
        const debit = Number(tx.debit || 0);
        const credit = Number(tx.credit || 0);
        expectedBal = Number((openingBalance + credit - debit).toFixed(2));
        if (Math.abs(expectedBal - Number(tx.balance || 0)) > 0.05) {
          hasMismatch = true;
        }
      } else if (idx > 0) {
        const prevTx = transactions[idx - 1];
        const prevBal = Number(prevTx.balance || 0);
        const debit = Number(tx.debit || 0);
        const credit = Number(tx.credit || 0);
        expectedBal = Number((prevBal + credit - debit).toFixed(2));
        if (Math.abs(expectedBal - Number(tx.balance || 0)) > 0.05) {
          hasMismatch = true;
        }
      }

      const diff = expectedBal !== null ? Number((Number(tx.balance || 0) - expectedBal).toFixed(2)) : 0;

      // Ensure flags include BALANCE_MISMATCH if calculated mismatch exists
      const existingFlags = Array.isArray(tx.flags) ? [...tx.flags] : [];
      if (hasMismatch && !existingFlags.includes('BALANCE_MISMATCH')) {
        existingFlags.push('BALANCE_MISMATCH');
      }

      return {
        ...tx,
        flags: existingFlags,
        hasContinuityMismatch: hasMismatch,
        computedExpectedBalance: expectedBal ?? undefined,
        continuityDifference: diff,
      };
    });
  }, [transactions, openingBalance]);

  // 2. Filter transactions based on active tab / filter state
  const filteredTransactions = useMemo(() => {
    return enrichedTransactions.filter((tx) => {
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'NEEDS_REVIEW') {
        return (
          tx.status !== 'APPROVED' &&
          tx.status !== 'POSTED' &&
          (tx.needsReview ||
            (tx.flags && tx.flags.length > 0) ||
            tx.hasContinuityMismatch ||
            (tx.confidenceScore !== null && tx.confidenceScore !== undefined && tx.confidenceScore < 85))
        );
      }
      if (filterStatus === 'BALANCE_MISMATCH') {
        return tx.hasContinuityMismatch || tx.flags?.includes('BALANCE_MISMATCH');
      }
      if (filterStatus === 'POTENTIAL_DUPLICATE') {
        return tx.flags?.includes('POTENTIAL_DUPLICATE') || Boolean(tx.duplicateGroupId);
      }
      if (filterStatus === 'UNCERTAIN_LEDGER') {
        return (
          tx.flags?.includes('UNCERTAIN_LEDGER') ||
          !tx.suggestedLedger ||
          tx.suggestedLedger === 'Suspense Account'
        );
      }
      if (filterStatus === 'MANUALLY_EDITED') {
        return tx.isUserEdited || tx.flags?.includes('MANUALLY_EDITED');
      }
      if (filterStatus === 'PENDING') {
        return tx.status === 'PENDING';
      }
      if (filterStatus === 'APPROVED') {
        return tx.status === 'APPROVED';
      }
      if (filterStatus === 'POSTED') {
        return tx.status === 'POSTED';
      }
      if (filterStatus === 'REJECTED') {
        return tx.status === 'REJECTED';
      }
      // Specific flag filter
      if (tx.flags && tx.flags.includes(filterStatus)) {
        return true;
      }
      return true;
    });
  }, [enrichedTransactions, filterStatus]);

  const handleRowChange = (id: string, field: keyof RowEditFields, value: string) => {
    setRowEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleResetRowEdits = (id: string) => {
    setRowEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSaveRow = async (
    tx: EnrichedRowTransaction,
    autoApprove = false,
    newStatus?: TransactionStatus
  ) => {
    const edits = rowEdits[tx.id] || {};

    const finalDate = edits.date !== undefined ? edits.date : tx.date;
    const finalNarration = edits.narration !== undefined ? edits.narration : tx.narration;
    const finalDebit =
      edits.debit !== undefined ? Number(edits.debit) || 0 : Number(tx.debit || 0);
    const finalCredit =
      edits.credit !== undefined ? Number(edits.credit) || 0 : Number(tx.credit || 0);
    const finalBalance =
      edits.balance !== undefined ? Number(edits.balance) || 0 : Number(tx.balance || 0);
    const finalLedger =
      edits.suggestedLedger !== undefined ? edits.suggestedLedger : tx.suggestedLedger;

    const targetStatus = newStatus || (autoApprove ? 'APPROVED' : tx.status);

    setSavingRowId(tx.id);
    try {
      await updateReviewRow({
        statementId,
        rowId: tx.id,
        body: {
          date: finalDate,
          narration: finalNarration,
          debit: finalDebit,
          credit: finalCredit,
          balance: finalBalance,
          suggestedLedger: finalLedger,
          approve: autoApprove,
          status: targetStatus,
        },
      }).unwrap();

      // Clear local row edit cache for this row on successful commit
      setRowEdits((prev) => {
        const next = { ...prev };
        delete next[tx.id];
        return next;
      });

      setSavedSuccessRowId(tx.id);
      setTimeout(() => setSavedSuccessRowId(null), 2000);
      showToast(
        autoApprove
          ? 'Transaction approved & mapping updated.'
          : 'Row updated successfully.',
        'success'
      );
    } catch (err: any) {
      console.error('Failed to update row:', err);
      showToast(err?.data?.message || 'Failed to save transaction changes', 'error');
    } finally {
      setSavingRowId(null);
    }
  };

  const allFilteredSelected =
    filteredTransactions.length > 0 &&
    filteredTransactions.every((tx) => selectedIds.includes(tx.id));

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm border"
      style={{
        background: 'var(--color-bg-card, #FFFFFF)',
        borderColor: 'var(--color-border, #E2E8F0)',
      }}
    >
      <div className="overflow-x-auto max-h-[700px] relative">
        <table className="w-full text-left text-xs border-collapse">
          <thead
            className="sticky top-0 z-20 text-[11px] uppercase tracking-wider font-semibold border-b shadow-xs backdrop-blur-md"
            style={{
              background: 'var(--color-bg-elevated, #F7F9FB)',
              borderColor: 'var(--color-border, #E2E8F0)',
              color: 'var(--color-text-secondary, #5A6E85)',
            }}
          >
            <tr>
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={allFilteredSelected ? onDeselectAll : onSelectAll}
                  className="rounded border-[#E2E8F0] text-[#4A6FA5] focus:ring-[#4A6FA5] cursor-pointer"
                  title={allFilteredSelected ? 'Deselect all' : 'Select all'}
                />
              </th>
              <th className="py-3 px-3 w-28">Date</th>
              <th className="py-3 px-3 min-w-[240px]">Narration (Editable)</th>
              <th className="py-3 px-3 text-right w-28">Debit (₹)</th>
              <th className="py-3 px-3 text-right w-28">Credit (₹)</th>
              <th className="py-3 px-3 text-right w-32">Balance (₹)</th>
              <th className="py-3 px-3 min-w-[200px]">Suggested Ledger</th>
              <th className="py-3 px-3 min-w-[140px] text-center">Validation Flags</th>
              <th className="py-3 px-3 text-center w-28">Status</th>
              <th className="py-3 px-3 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border,#E2E8F0)]">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-xs text-[#8E9FAA]">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-[#3D7A64] opacity-50" />
                    <p className="font-medium text-[#1E2A38]">No transactions in this view</p>
                    <p className="text-[11px] text-[#5A6E85]">
                      All transactions match your quality criteria or no rows match the filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isSelected = selectedIds.includes(tx.id);
                const isSaving = savingRowId === tx.id;
                const isSaved = savedSuccessRowId === tx.id;

                const edits = rowEdits[tx.id] || {};
                const currentDate = edits.date !== undefined ? edits.date : (tx.date || '');
                const currentNarration =
                  edits.narration !== undefined
                    ? edits.narration
                    : tx.narration || tx.description || '';
                const currentDebit =
                  edits.debit !== undefined ? edits.debit : String(tx.debit || 0);
                const currentCredit =
                  edits.credit !== undefined ? edits.credit : String(tx.credit || 0);
                const currentBalance =
                  edits.balance !== undefined ? edits.balance : String(tx.balance || 0);
                const currentLedger =
                  edits.suggestedLedger !== undefined
                    ? edits.suggestedLedger
                    : tx.suggestedLedger || '';

                const hasEdits = Object.keys(edits).length > 0;

                const hasMismatch = tx.hasContinuityMismatch;
                const isDuplicate =
                  tx.flags?.includes('POTENTIAL_DUPLICATE') || Boolean(tx.duplicateGroupId);
                const isLowConfidence =
                  tx.status !== 'APPROVED' &&
                  (tx.flags?.includes('LOW_CONFIDENCE') ||
                    (tx.confidenceScore !== null &&
                      tx.confidenceScore !== undefined &&
                      tx.confidenceScore < 85));
                const isUncertainLedger =
                  tx.flags?.includes('UNCERTAIN_LEDGER') ||
                  !currentLedger ||
                  currentLedger === 'Suspense Account';
                const isBothDrCr = tx.flags?.includes('BOTH_DR_CR');
                const isEdited = tx.isUserEdited || tx.flags?.includes('MANUALLY_EDITED') || hasEdits;

                // Bank Trust Blue Row Highlight Styling
                let rowBgClass = '';
                if (hasMismatch) {
                  // Dusty Rose for mathematical mismatch
                  rowBgClass = 'bg-[#9E4A4A]/5 border-l-4 border-l-[#9E4A4A]';
                } else if (isDuplicate) {
                  // Warm Sand/Caramel for duplicate alert
                  rowBgClass = 'bg-[#9E6B42]/5 border-l-4 border-l-[#9E6B42]';
                } else if (isLowConfidence || isUncertainLedger || isBothDrCr) {
                  // Warm Sand for uncertainty / warnings
                  rowBgClass = 'bg-[#9E6B42]/5 border-l-4 border-l-[#9E6B42]';
                } else if (tx.status === 'POSTED') {
                  // Muted Navy for general ledger posted
                  rowBgClass = 'bg-[#4A6FA5]/5 border-l-4 border-l-[#4A6FA5]';
                } else if (tx.status === 'APPROVED') {
                  // Muted Sage Green for approved
                  rowBgClass = 'bg-[#3D7A64]/5 border-l-4 border-l-[#3D7A64]';
                } else if (tx.status === 'REJECTED') {
                  // Dusty Rose with opacity for rejected
                  rowBgClass = 'bg-[#9E4A4A]/5 border-l-4 border-l-[#9E4A4A] opacity-60';
                } else {
                  rowBgClass = 'border-l-4 border-l-transparent';
                }

                return (
                  <tr
                    key={tx.id}
                    className={`transition-colors hover:bg-slate-500/5 ${rowBgClass} ${
                      isSelected ? 'ring-1 ring-inset ring-[#4A6FA5]/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(tx.id)}
                        className="rounded border-[#E2E8F0] text-[#4A6FA5] focus:ring-[#4A6FA5] cursor-pointer"
                      />
                    </td>

                    {/* Date (Editable) */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <input
                        type="text"
                        value={currentDate}
                        onChange={(e) => handleRowChange(tx.id, 'date', e.target.value)}
                        className="w-24 text-xs px-2 py-1 rounded-md border bg-white dark:bg-[#131C2E] border-[#E2E8F0] dark:border-[#1E2B42] text-[#1E2A38] dark:text-slate-100 focus:outline-none focus:border-[#4A6FA5] font-mono"
                        placeholder="YYYY-MM-DD"
                      />
                    </td>

                    {/* Narration (Editable) */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          value={currentNarration}
                          onChange={(e) => handleRowChange(tx.id, 'narration', e.target.value)}
                          className="w-full text-xs px-2.5 py-1 rounded-md border bg-white dark:bg-[#131C2E] border-[#E2E8F0] dark:border-[#1E2B42] text-[#1E2A38] dark:text-slate-100 focus:outline-none focus:border-[#4A6FA5]"
                          placeholder="Narration..."
                        />
                        {tx.reference && (
                          <span className="text-[10px] text-[#8E9FAA] font-mono">
                            Ref: {tx.reference}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Debit (Editable) */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <input
                        type="number"
                        step="any"
                        value={currentDebit === '0' && !edits.debit ? '' : currentDebit}
                        onChange={(e) => handleRowChange(tx.id, 'debit', e.target.value)}
                        placeholder="0.00"
                        className="w-24 text-right text-xs px-2 py-1 rounded-md border bg-white dark:bg-[#131C2E] border-[#E2E8F0] dark:border-[#1E2B42] text-[#9E4A4A] font-semibold font-mono focus:outline-none focus:border-[#4A6FA5]"
                      />
                    </td>

                    {/* Credit (Editable) */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <input
                        type="number"
                        step="any"
                        value={currentCredit === '0' && !edits.credit ? '' : currentCredit}
                        onChange={(e) => handleRowChange(tx.id, 'credit', e.target.value)}
                        placeholder="0.00"
                        className="w-24 text-right text-xs px-2 py-1 rounded-md border bg-white dark:bg-[#131C2E] border-[#E2E8F0] dark:border-[#1E2B42] text-[#3D7A64] font-semibold font-mono focus:outline-none focus:border-[#4A6FA5]"
                      />
                    </td>

                    {/* Balance (Editable) + Row Balance Continuity Check */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end gap-1">
                        <input
                          type="number"
                          step="any"
                          value={currentBalance}
                          onChange={(e) => handleRowChange(tx.id, 'balance', e.target.value)}
                          className={`w-28 text-right text-xs px-2 py-1 rounded-md border bg-white dark:bg-[#131C2E] font-semibold font-mono focus:outline-none focus:border-[#4A6FA5] ${
                            hasMismatch
                              ? 'border-[#9E4A4A] text-[#9E4A4A] bg-[#9E4A4A]/5'
                              : 'border-[#E2E8F0] dark:border-[#1E2B42] text-[#1E2A38] dark:text-slate-100'
                          }`}
                        />
                        {hasMismatch && tx.computedExpectedBalance !== undefined && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#9E4A4A]"
                            title={`Previous Bal + Cr - Dr = ₹${tx.computedExpectedBalance.toLocaleString(
                              'en-IN',
                              { minimumFractionDigits: 2 }
                            )}`}
                          >
                            Exp: ₹{tx.computedExpectedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Suggested Ledger Dropdown (Editable) */}
                    <td className="py-2.5 px-3">
                      <select
                        value={currentLedger}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleRowChange(tx.id, 'suggestedLedger', val);
                        }}
                        className={`w-full text-xs px-2 py-1 rounded-md border bg-white dark:bg-[#131C2E] text-[#1E2A38] dark:text-slate-100 focus:outline-none focus:border-[#4A6FA5] cursor-pointer ${
                          isUncertainLedger
                            ? 'border-[#9E6B42] text-[#9E6B42]'
                            : 'border-[#E2E8F0] dark:border-[#1E2B42]'
                        }`}
                      >
                        <option value="" disabled>
                          Select Ledger...
                        </option>
                        {!STANDARD_TALLY_LEDGERS.includes(currentLedger) && currentLedger && (
                          <option value={currentLedger}>{currentLedger} (Custom)</option>
                        )}
                        {STANDARD_TALLY_LEDGERS.map((ledger) => (
                          <option key={ledger} value={ledger}>
                            {ledger}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Validation Flags & Telemetry */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1 max-w-[180px] mx-auto">
                        {hasMismatch && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#9E4A4A]/10 text-[#9E4A4A] border border-[#9E4A4A]/20"
                            title={`Balance does not reconcile. Diff: ₹${tx.continuityDifference}`}
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Bal Mismatch
                          </span>
                        )}

                        {isDuplicate && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#9E6B42]/10 text-[#9E6B42] border border-[#9E6B42]/20"
                            title={
                              tx.duplicateGroupId
                                ? `Duplicate Group: ${tx.duplicateGroupId}`
                                : 'Duplicate transaction suspected'
                            }
                          >
                            <Copy className="w-2.5 h-2.5" />
                            Duplicate
                          </span>
                        )}

                        {isUncertainLedger && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#9E6B42]/10 text-[#9E6B42] border border-[#9E6B42]/20"
                            title="Ledger unassigned or pointing to Suspense"
                          >
                            <HelpCircle className="w-2.5 h-2.5" />
                            Uncertain
                          </span>
                        )}

                        {isLowConfidence && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#9E6B42]/10 text-[#9E6B42] border border-[#9E6B42]/20"
                            title={`AI confidence score: ${tx.confidenceScore ?? 0}%`}
                          >
                            <AlertCircle className="w-2.5 h-2.5" />
                            Low Conf ({tx.confidenceScore ?? 0}%)
                          </span>
                        )}

                        {isBothDrCr && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#9E4A4A]/10 text-[#9E4A4A] border border-[#9E4A4A]/20"
                            title="Both Debit and Credit amounts detected"
                          >
                            Both Dr/Cr
                          </span>
                        )}

                        {isEdited && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20"
                            title={
                              tx.userEditedFields?.length
                                ? `Fields modified: ${tx.userEditedFields.join(', ')}`
                                : 'Row modified'
                            }
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            CA Edited
                          </span>
                        )}

                        {/* AI Source Tag if present and no major flags */}
                        {!hasMismatch && !isDuplicate && !isUncertainLedger && !isLowConfidence && (
                          <span className="text-[10px] text-[#5A6E85]">
                            {tx.source === 'learned_exact' ? (
                              <span className="inline-flex items-center gap-0.5 text-[#3D7A64] font-medium">
                                <Brain className="w-2.5 h-2.5" /> Learned
                              </span>
                            ) : tx.source === 'fallback' ? (
                              <span className="inline-flex items-center gap-0.5 text-[#9E6B42] font-medium">
                                <Sparkles className="w-2.5 h-2.5" /> AI Guessed
                              </span>
                            ) : (
                              <span className="text-[#8E9FAA]">Verified</span>
                            )}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {tx.status === 'POSTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20">
                          <CheckCircle2 className="w-3 h-3 text-[#4A6FA5]" /> GL Posted
                        </span>
                      )}
                      {tx.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#3D7A64]/10 text-[#3D7A64] border border-[#3D7A64]/20">
                          <CheckCircle2 className="w-3 h-3 text-[#3D7A64]" /> Approved
                        </span>
                      )}
                      {tx.status === 'PENDING' && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            hasMismatch || isDuplicate || isLowConfidence || isUncertainLedger
                              ? 'bg-[#9E6B42]/10 text-[#9E6B42] border-[#9E6B42]/20'
                              : 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20'
                          }`}
                        >
                          {hasMismatch || isDuplicate || isLowConfidence ? (
                            <AlertTriangle className="w-3 h-3 text-[#9E6B42]" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {hasMismatch ? 'Needs Fix' : isLowConfidence ? 'Review' : 'Pending'}
                        </span>
                      )}
                      {tx.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#9E4A4A]/10 text-[#9E4A4A] border border-[#9E4A4A]/20">
                          <XCircle className="w-3 h-3 text-[#9E4A4A]" /> Rejected
                        </span>
                      )}
                    </td>

                    {/* Inline Actions */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#4A6FA5]" />
                        ) : isSaved ? (
                          <Check className="w-4 h-4 text-[#3D7A64] font-bold" />
                        ) : (
                          <>
                            {/* Save changes if row has dirty edits */}
                            {hasEdits && (
                              <button
                                title="Save changes"
                                onClick={() => handleSaveRow(tx, false)}
                                className="p-1 rounded bg-[#4A6FA5]/10 hover:bg-[#4A6FA5]/20 text-[#4A6FA5] transition-colors"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {hasEdits && (
                              <button
                                title="Reset changes"
                                onClick={() => handleResetRowEdits(tx.id)}
                                className="p-1 rounded hover:bg-slate-500/10 text-[#8E9FAA] transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Approve button */}
                            {tx.status !== 'APPROVED' && tx.status !== 'POSTED' && (
                              <button
                                title="Approve & Learn Mapping"
                                onClick={() => handleSaveRow(tx, true)}
                                className="p-1 rounded hover:bg-[#3D7A64]/10 text-[#3D7A64] transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Reject button */}
                            {tx.status !== 'REJECTED' && (
                              <button
                                title="Reject transaction"
                                onClick={() => {
                                  if (onRejectRow) {
                                    onRejectRow(tx.id);
                                  } else {
                                    handleSaveRow(tx, false, 'REJECTED');
                                  }
                                }}
                                className="p-1 rounded hover:bg-[#9E4A4A]/10 text-[#8E9FAA] hover:text-[#9E4A4A] transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
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
}
