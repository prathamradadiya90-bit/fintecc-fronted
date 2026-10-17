'use client';

import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BankStatementTransaction } from '@/lib/types/bankStatement.types';

interface PostToLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  transactions: BankStatementTransaction[];
  bankLedgerName: string;
}

export function PostToLedgerModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  transactions,
  bankLedgerName,
}: PostToLedgerModalProps) {
  if (!isOpen) return null;

  const approvedTransactions = transactions.filter(
    (t) => t.status === 'APPROVED' || t.status === 'POSTED'
  );

  const totalDebits = approvedTransactions.reduce(
    (sum, t) => sum + Number(t.debit || 0),
    0
  );
  const totalCredits = approvedTransactions.reduce(
    (sum, t) => sum + Number(t.credit || 0),
    0
  );

  // Group by suggested ledger for summary breakdown
  const ledgerBreakdown = approvedTransactions.reduce<
    Record<string, { debits: number; credits: number; count: number }>
  >((acc, t) => {
    const ledger = t.suggestedLedger || 'Suspense Account';
    if (!acc[ledger]) {
      acc[ledger] = { debits: 0, credits: 0, count: 0 };
    }
    acc[ledger].debits += Number(t.debit || 0);
    acc[ledger].credits += Number(t.credit || 0);
    acc[ledger].count += 1;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-xl rounded-2xl shadow-2xl p-6 relative space-y-5 animate-scaleUp"
        style={{
          background: 'var(--color-bg-card, #FFFFFF)',
          border: '1px solid var(--color-border, #E2E8F0)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--color-border, #E2E8F0)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E2A38]">
                Post to General Ledger
              </h3>
              <p className="text-xs text-[#5A6E85]">
                Double-Entry Accounting & Journal Voucher Creation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-500/10 text-[#8E9FAA] hover:text-[#1E2A38] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Double-Entry Balance Verification Banner */}
        <div className="p-3.5 rounded-xl bg-[#3D7A64]/10 border border-[#3D7A64]/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#3D7A64] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 text-[#1E2A38]">
            <p className="font-semibold text-sm text-[#1E2A38]">
              Double-Entry Vouchers Ready
            </p>
            <p className="text-[#5A6E85]">
              Posting will generate balanced <strong>JournalEntry</strong> records with corresponding{' '}
              <strong>JournalLine</strong> items against <strong className="text-[#1E2A38]">{bankLedgerName}</strong>. Running balances in your Chart of Accounts will be updated automatically.
            </p>
          </div>
        </div>

        {/* Telemetry Numbers */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB]">
            <span className="text-[11px] font-medium text-[#5A6E85] block">Approved Rows</span>
            <span className="text-lg font-bold text-[#1E2A38] mt-0.5 block">
              {approvedTransactions.length}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB]">
            <span className="text-[11px] font-medium text-[#5A6E85] block">Total Debits</span>
            <span className="text-lg font-bold text-[#9E4A4A] mt-0.5 block font-mono">
              ₹{totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB]">
            <span className="text-[11px] font-medium text-[#5A6E85] block">Total Credits</span>
            <span className="text-lg font-bold text-[#3D7A64] mt-0.5 block font-mono">
              ₹{totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Ledger Breakdown Preview */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#1E2A38] block">
            Target Ledger Accounts Preview
          </span>
          <div className="max-h-44 overflow-y-auto border border-[#E2E8F0] rounded-xl divide-y divide-[#E2E8F0] text-xs">
            {Object.entries(ledgerBreakdown).map(([ledger, data]) => (
              <div key={ledger} className="p-2.5 flex items-center justify-between bg-white hover:bg-[#F7F9FB]">
                <div>
                  <span className="font-semibold text-[#1E2A38] block">{ledger}</span>
                  <span className="text-[11px] text-[#5A6E85]">{data.count} transaction(s)</span>
                </div>
                <div className="text-right font-mono text-[11px]">
                  {data.debits > 0 && (
                    <span className="text-[#9E4A4A] block">
                      Dr ₹{data.debits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  {data.credits > 0 && (
                    <span className="text-[#3D7A64] block">
                      Cr ₹{data.credits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            size="sm"
            className="text-xs text-[#5A6E85]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={approvedTransactions.length === 0}
            leftIcon={<BookOpen className="w-4 h-4" />}
            className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
          >
            Confirm & Post ({approvedTransactions.length} Vouchers)
          </Button>
        </div>
      </div>
    </div>
  );
}
