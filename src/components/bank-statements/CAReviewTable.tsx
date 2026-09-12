'use client';

import React, { useState } from 'react';
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

interface CAReviewTableProps {
  statementId: string;
  transactions: BankStatementTransaction[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  filterStatus?: string;
}

export function CAReviewTable({
  statementId,
  transactions,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  filterStatus = 'ALL',
}: CAReviewTableProps) {
  const { showToast } = useToast();
  const [updateReviewRow] = useUpdateReviewRowMutation();

  // Local tracking for editing rows
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [savedSuccessRowId, setSavedSuccessRowId] = useState<string | null>(null);

  // Temporary row state for edited fields before committing
  const [rowEdits, setRowEdits] = useState<Record<string, { narration?: string; suggestedLedger?: string }>>({});

  const filteredTransactions = transactions.filter((tx) => {
    if (filterStatus === 'NEEDS_REVIEW') {
      return tx.status !== 'APPROVED' && (tx.needsReview || (tx.confidenceScore !== null && tx.confidenceScore !== undefined && tx.confidenceScore < 80));
    }
    if (filterStatus === 'PENDING') {
      return tx.status === 'PENDING';
    }
    if (filterStatus === 'APPROVED') {
      return tx.status === 'APPROVED';
    }
    if (filterStatus === 'REJECTED') {
      return tx.status === 'REJECTED';
    }
    return true;
  });

  const handleRowChange = (id: string, field: 'narration' | 'suggestedLedger', value: string) => {
    setRowEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSaveRow = async (tx: BankStatementTransaction, autoApprove = false) => {
    const edits = rowEdits[tx.id] || {};
    const finalNarration = edits.narration !== undefined ? edits.narration : tx.narration;
    const finalLedger = edits.suggestedLedger !== undefined ? edits.suggestedLedger : tx.suggestedLedger;

    setSavingRowId(tx.id);
    try {
      await updateReviewRow({
        statementId,
        rowId: tx.id,
        body: {
          narration: finalNarration,
          suggestedLedger: finalLedger,
          approve: autoApprove,
          status: autoApprove ? 'APPROVED' : tx.status,
        },
      }).unwrap();

      setSavedSuccessRowId(tx.id);
      setTimeout(() => setSavedSuccessRowId(null), 2000);
      setEditingRowId(null);
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
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="overflow-x-auto max-h-[650px] relative">
        <table className="w-full text-left text-xs border-collapse">
          <thead
            className="sticky top-0 z-10 text-[11px] uppercase tracking-wider font-semibold border-b shadow-xs backdrop-blur-md"
            style={{
              background: 'var(--color-bg-elevated)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={allFilteredSelected ? onDeselectAll : onSelectAll}
                  className="rounded border-slate-300 text-[#00C2B3] focus:ring-[#00C2B3] cursor-pointer"
                  title={allFilteredSelected ? 'Deselect all' : 'Select all'}
                />
              </th>
              <th className="py-3.5 px-3 w-28">Date</th>
              <th className="py-3.5 px-4 min-w-[240px]">Narration (Editable)</th>
              <th className="py-3.5 px-3 text-right w-28">Debit</th>
              <th className="py-3.5 px-3 text-right w-28">Credit</th>
              <th className="py-3.5 px-3 text-right w-28">Balance</th>
              <th className="py-3.5 px-4 min-w-[220px]">Suggested Ledger</th>
              <th className="py-3.5 px-3 text-center w-32">AI Confidence</th>
              <th className="py-3.5 px-3 text-center w-28">Status</th>
              <th className="py-3.5 px-3 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  No transactions match the selected filter.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isSelected = selectedIds.includes(tx.id);
                const isSaving = savingRowId === tx.id;
                const isSaved = savedSuccessRowId === tx.id;

                const isLowConfidence = tx.status !== 'APPROVED' && (tx.needsReview || (tx.confidenceScore !== null && tx.confidenceScore !== undefined && tx.confidenceScore < 80));
                const isFallback = tx.source === 'fallback';
                const isLearned = tx.source === 'learned_exact';
                const isRule = tx.source === 'rule_based';

                const edits = rowEdits[tx.id] || {};
                const currentNarration = edits.narration !== undefined ? edits.narration : (tx.narration || tx.description || '');
                const currentLedger = edits.suggestedLedger !== undefined ? edits.suggestedLedger : (tx.suggestedLedger || '');

                const hasEdits =
                  (edits.narration !== undefined && edits.narration !== tx.narration) ||
                  (edits.suggestedLedger !== undefined && edits.suggestedLedger !== tx.suggestedLedger);

                // Row highlight color based on AI confidence warning
                let rowBgClass = '';
                if (isLowConfidence && tx.status === 'PENDING') {
                  rowBgClass = 'bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-l-amber-500';
                } else if (tx.status === 'APPROVED') {
                  rowBgClass = 'bg-emerald-500/5 dark:bg-emerald-500/10 border-l-4 border-l-emerald-500';
                } else if (tx.status === 'REJECTED') {
                  rowBgClass = 'bg-rose-500/5 dark:bg-rose-500/10 border-l-4 border-l-rose-500 opacity-60';
                } else {
                  rowBgClass = 'border-l-4 border-l-transparent';
                }

                return (
                  <tr
                    key={tx.id}
                    className={`transition-colors hover:bg-slate-500/5 ${rowBgClass} ${isSelected ? 'ring-1 ring-inset ring-[#00C2B3]/40' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(tx.id)}
                        className="rounded border-slate-300 text-[#00C2B3] focus:ring-[#00C2B3] cursor-pointer"
                      />
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {tx.date}
                    </td>

                    {/* Narration (Editable input) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={currentNarration}
                          onChange={(e) => handleRowChange(tx.id, 'narration', e.target.value)}
                          onFocus={() => setEditingRowId(tx.id)}
                          onBlur={() => {
                            if (hasEdits) handleSaveRow(tx, false);
                          }}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3] transition-colors"
                          placeholder="Transaction narration..."
                        />
                      </div>
                    </td>

                    {/* Debit */}
                    <td className="py-3 px-3 text-right font-medium whitespace-nowrap">
                      {Number(tx.debit) > 0 ? (
                        <span className="text-red-600 dark:text-red-400">
                          ₹{Number(tx.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Credit */}
                    <td className="py-3 px-3 text-right font-medium whitespace-nowrap">
                      {Number(tx.credit) > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          ₹{Number(tx.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-3 text-right font-semibold whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                      ₹{Number(tx.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Suggested Ledger Dropdown */}
                    <td className="py-3 px-4">
                      <div className="relative">
                        <select
                          value={currentLedger}
                          onChange={(e) => {
                            handleRowChange(tx.id, 'suggestedLedger', e.target.value);
                            // Auto trigger save when ledger selection changes
                            setRowEdits((prev) => ({
                              ...prev,
                              [tx.id]: { ...prev[tx.id], suggestedLedger: e.target.value },
                            }));
                            setTimeout(() => {
                              handleSaveRow({ ...tx, suggestedLedger: e.target.value }, false);
                            }, 50);
                          }}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3] cursor-pointer"
                        >
                          <option value="" disabled>Select Ledger...</option>
                          {!STANDARD_TALLY_LEDGERS.includes(currentLedger) && currentLedger && (
                            <option value={currentLedger}>{currentLedger} (Custom)</option>
                          )}
                          {STANDARD_TALLY_LEDGERS.map((ledger) => (
                            <option key={ledger} value={ledger}>
                              {ledger}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* AI Confidence & Source badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-1">
                        {isFallback && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            title="Gemini AI fallback guess — CA verification advised"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                            Gemini AI
                          </span>
                        )}

                        {isLearned && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            title="Learned from firm's past corrections"
                          >
                            <Brain className="w-3 h-3 text-emerald-500" />
                            Learned
                          </span>
                        )}

                        {isRule && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            title="Matched standard rule engine"
                          >
                            <Sliders className="w-3 h-3 text-blue-500" />
                            Rule
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-semibold ${
                            tx.confidenceScore >= 90
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : tx.confidenceScore >= 75
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-500'
                          }`}
                        >
                          {tx.confidenceScore !== null && tx.confidenceScore !== undefined
                            ? `${tx.confidenceScore}% conf`
                            : 'Unscored'}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {tx.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {tx.status === 'PENDING' && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isLowConfidence
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                              : 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20'
                          }`}
                        >
                          {isLowConfidence ? <AlertTriangle className="w-3 h-3 text-amber-500" /> : <Clock className="w-3 h-3" />}
                          {isLowConfidence ? 'Needs Review' : 'Pending'}
                        </span>
                      )}
                      {tx.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>

                    {/* Inline Actions */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#00C2B3]" />
                        ) : isSaved ? (
                          <Check className="w-4 h-4 text-emerald-500 font-bold" />
                        ) : tx.status !== 'APPROVED' ? (
                          <button
                            title="Approve & Learn this ledger"
                            onClick={() => handleSaveRow(tx, true)}
                            className="p-1 rounded hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            title="Save edits"
                            disabled={!hasEdits}
                            onClick={() => handleSaveRow(tx, false)}
                            className={`p-1 rounded text-xs transition-colors ${
                              hasEdits
                                ? 'text-[#00C2B3] hover:bg-teal-500/10'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
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
