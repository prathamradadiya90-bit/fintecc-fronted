'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Printer,
  Trash2,
  Calendar,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import {
  useGetClientLedgerQuery,
  useCreateClientLedgerEntryMutation,
  useDeleteClientLedgerEntryMutation,
} from '@/lib/store/api/clientLedgersApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Column } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import type {
  ClientLedgerEntry,
  ClientLedgerTransactionType,
} from '@/lib/types/client-ledger.types';

interface ClientLedgerTabProps {
  clientId: string;
  clientName?: string;
}

const typeConfig: Record<
  ClientLedgerTransactionType,
  { label: string; bg: string; text: string; border: string }
> = {
  INVOICE: {
    label: 'Tax Invoice (Dr)',
    bg: 'bg-[rgba(74,111,165,0.08)]',
    text: 'text-[#4A6FA5] dark:text-[#A8C5DA]',
    border: 'border-[rgba(74,111,165,0.2)]',
  },
  PAYMENT: {
    label: 'Payment Recd (Cr)',
    bg: 'bg-[rgba(61,122,100,0.08)]',
    text: 'text-[#3D7A64] dark:text-emerald-400',
    border: 'border-[rgba(61,122,100,0.2)]',
  },
  REFUND: {
    label: 'Refund (Dr)',
    bg: 'bg-[rgba(158,107,66,0.08)]',
    text: 'text-[#9E6B42] dark:text-amber-400',
    border: 'border-[rgba(158,107,66,0.2)]',
  },
  OPENING_BALANCE: {
    label: 'Opening Bal',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
  },
};

export function ClientLedgerTab({ clientId, clientName }: ClientLedgerTabProps) {
  const { showToast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for manual entry
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionType, setTransactionType] =
    useState<ClientLedgerTransactionType>('PAYMENT');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [referenceId, setReferenceId] = useState('');

  const { data: response, isLoading, isFetching } = useGetClientLedgerQuery({
    clientId,
    limit: 100,
  });

  const [createEntry, { isLoading: isCreating }] =
    useCreateClientLedgerEntryMutation();
  const [deleteEntry] = useDeleteClientLedgerEntryMutation();

  const entries = response?.data || [];

  // Summary figures
  const stats = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    entries.forEach((e) => {
      totalDebit += Number(e.debit) || 0;
      totalCredit += Number(e.credit) || 0;
    });
    const netBalance = totalDebit - totalCredit;
    return { totalDebit, totalCredit, netBalance };
  }, [entries]);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      showToast('Please enter a valid positive amount', 'error');
      return;
    }

    try {
      const isDebit = transactionType === 'INVOICE' || transactionType === 'REFUND';
      const debitVal = isDebit ? numAmount : 0;
      const creditVal = !isDebit ? numAmount : 0;

      await createEntry({
        clientId,
        date: new Date(date).toISOString(),
        transactionType,
        description: description.trim() || `${transactionType} entry`,
        debit: debitVal,
        credit: creditVal,
        referenceId: referenceId.trim() || undefined,
      }).unwrap();

      showToast('Ledger entry recorded successfully', 'success');
      setIsAddModalOpen(false);
      setDescription('');
      setAmount('');
      setReferenceId('');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to record entry', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this ledger entry?')) return;
    try {
      await deleteEntry({ id, clientId }).unwrap();
      showToast('Entry removed from ledger', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete entry', 'error');
    }
  };

  const columns: Column<ClientLedgerEntry>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item) => (
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {item.date ? new Date(item.date).toLocaleDateString('en-IN') : '—'}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Transaction Type',
      render: (item) => {
        const config = typeConfig[item.transactionType] || typeConfig.OPENING_BALANCE;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${config.bg} ${config.text} ${config.border}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'description',
      header: 'Particulars / Description',
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {item.description}
          </span>
          {item.referenceId && (
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              Ref: {item.referenceId}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'debit',
      header: 'Debit (Dr)',
      render: (item) => {
        const val = Number(item.debit) || 0;
        return (
          <span className="text-xs font-semibold" style={{ color: val > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
            {val > 0 ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
          </span>
        );
      },
    },
    {
      key: 'credit',
      header: 'Credit (Cr)',
      render: (item) => {
        const val = Number(item.credit) || 0;
        return (
          <span className="text-xs font-semibold text-[#3D7A64]">
            {val > 0 ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
          </span>
        );
      },
    },
    {
      key: 'balance',
      header: 'Running Balance',
      render: (item) => {
        const bal = Number(item.balance) || 0;
        return (
          <span className="text-xs font-bold" style={{ color: bal > 0 ? '#9E6B42' : 'var(--color-text-primary)' }}>
            ₹{bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <button
          onClick={() => handleDelete(item.id)}
          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          title="Delete entry"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-2xl border flex items-center gap-3.5 shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-2.5 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5]">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Total Invoiced (Debits)
            </p>
            <p className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              ₹{stats.totalDebit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border flex items-center gap-3.5 shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-2.5 rounded-xl bg-[rgba(61,122,100,0.08)] text-[#3D7A64]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Total Payments Received (Credits)
            </p>
            <p className="text-xl font-bold text-[#3D7A64]">
              ₹{stats.totalCredit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border flex items-center gap-3.5 shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-2.5 rounded-xl bg-[rgba(158,107,66,0.08)] text-[#9E6B42]">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Net Outstanding Balance
            </p>
            <p
              className="text-xl font-bold"
              style={{ color: stats.netBalance > 0 ? '#9E6B42' : '#3D7A64' }}
            >
              ₹{stats.netBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border shadow-xs"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
            Client Statement of Account
          </h3>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Chronological audit ledger of all invoices, settlements, and manual adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Statement
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white"
          >
            Record Entry
          </Button>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden shadow-xs"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <Table
          data={entries}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading || isFetching}
          emptyMessage="No ledger entries found for this client. Click 'Record Entry' to add opening balance or transaction."
        />
      </div>

      {/* Add Manual Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-2xl border shadow-xl overflow-hidden"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
                Record Ledger Entry
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Entry Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value as ClientLedgerTransactionType)}
                  className="w-full h-9 px-3 rounded-xl border text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4A6FA5]"
                  style={{
                    background: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <option value="PAYMENT">Payment Received (Credit Cr)</option>
                  <option value="INVOICE">Tax Invoice / Bill (Debit Dr)</option>
                  <option value="OPENING_BALANCE">Opening Balance</option>
                  <option value="REFUND">Refund Issued (Debit Dr)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Amount (₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Description / Particulars
                </label>
                <Input
                  placeholder="e.g. Received via NEFT / SBI Bank"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Reference # (UTR / Cheque / Receipt #)
                </label>
                <Input
                  placeholder="e.g. UTR192837465"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isCreating}
                  className="bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white"
                >
                  Save Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
