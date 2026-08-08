import React from 'react';
import { Table, Column } from '../ui/Table';
import { BankTransaction } from '@/lib/types/bankStatement.types';
import { Button } from '../ui/Button';
import { Download, FileCode2, FileSpreadsheet } from 'lucide-react';

interface TransactionsPreviewProps {
  transactions: BankTransaction[];
  onDownloadXml: () => void;
  onDownloadCsv: () => void;
  isDownloadingXml?: boolean;
  isDownloadingCsv?: boolean;
}

export function TransactionsPreview({ 
  transactions, 
  onDownloadXml, 
  onDownloadCsv,
  isDownloadingXml,
  isDownloadingCsv
}: TransactionsPreviewProps) {
  const columns: Column<BankTransaction>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (tx) => <span className="font-medium">{tx.originalDate || tx.date}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (tx) => (
        <span className="truncate max-w-xs block" style={{ color: 'var(--color-text-secondary)' }} title={tx.description}>
          {tx.description}
        </span>
      ),
    },
    {
      key: 'debit',
      header: 'Debit',
      render: (tx) => (
        <span className="text-red-600 dark:text-red-400 font-medium">
          {tx.debit > 0 ? `₹${tx.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
        </span>
      ),
    },
    {
      key: 'credit',
      header: 'Credit',
      render: (tx) => (
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          {tx.credit > 0 ? `₹${tx.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (tx) => (
        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          ₹{tx.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  if (!transactions || transactions.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mt-6"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Preview Transactions</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Successfully extracted {transactions.length} transactions from your statement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={onDownloadCsv}
            isLoading={isDownloadingCsv}
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Download CSV
          </Button>
          <Button 
            onClick={onDownloadXml}
            isLoading={isDownloadingXml}
            leftIcon={<FileCode2 className="w-4 h-4" />}
          >
            Download Tally XML
          </Button>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto rounded-xl" style={{ border: '1px solid var(--color-border)' }}>
        <Table 
          data={transactions}
          columns={columns}
          emptyMessage="No transactions found."
          keyExtractor={(_, index) => `tx-${index}`}
        />
      </div>
    </div>
  );
}
