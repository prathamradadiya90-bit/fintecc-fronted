'use client';

import React, { useState } from 'react';
import { Table, Column } from '../ui/Table';
import { BankTransaction } from '@/lib/types/bankStatement.types';
import { Button } from '../ui/Button';
import { Download, FileCode2, FileSpreadsheet, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useQueueBankStatementSyncMutation } from '@/lib/store/api/bankStatementsApi';
import Link from 'next/link';

interface TransactionsPreviewProps {
  transactions: BankTransaction[];
  onDownloadXml: (companyName: string, bankLedger: string) => void;
  onDownloadCsv: () => void;
  onDownloadExcel?: () => void;
  onDownloadGstJson?: (fp: string) => void;
  isDownloadingXml?: boolean;
  isDownloadingCsv?: boolean;
  isDownloadingExcel?: boolean;
  isDownloadingGstJson?: boolean;
}

export function TransactionsPreview({ 
  transactions, 
  onDownloadXml, 
  onDownloadCsv,
  onDownloadExcel,
  onDownloadGstJson,
  isDownloadingXml,
  isDownloadingCsv,
  isDownloadingExcel,
  isDownloadingGstJson,
}: TransactionsPreviewProps) {
  const [bankLedger, setBankLedger] = useState('Bank Account');
  const [companyName, setCompanyName] = useState('Your Company Name');
  const [filingPeriod, setFilingPeriod] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    return `${mm}${yyyy}`;
  });
  const [showConfig, setShowConfig] = useState(false);
  const [queueBankStatementSync, { isLoading: isSyncingToTally }] = useQueueBankStatementSyncMutation();
  const [tallyJobId, setTallyJobId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSyncToTally = async () => {
    setSyncStatus(null);
    try {
      const response = await queueBankStatementSync({
        transactions,
        bankLedger: bankLedger.trim() || 'Bank Account',
      }).unwrap();

      setTallyJobId(response.data.jobId);
      setSyncStatus({
        type: 'success',
        message: `Queued ${response.data.count} bank transactions for Tally Prime Desktop Connector!`,
      });
    } catch (error: any) {
      console.error('Failed to queue bank statement Tally sync:', error);
      setSyncStatus({
        type: 'error',
        message: error?.data?.message || 'Failed to queue bank statement for Tally sync',
      });
    }
  };

  const columns: Column<BankTransaction>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (tx) => <span className="font-medium text-xs">{tx.originalDate || tx.date}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (tx) => (
        <span className="truncate max-w-xs block text-xs" style={{ color: 'var(--color-text-secondary)' }} title={tx.description}>
          {tx.description}
        </span>
      ),
    },
    {
      key: 'debit',
      header: 'Debit',
      render: (tx) => (
        <span className="text-red-600 dark:text-red-400 font-medium text-xs">
          {tx.debit > 0 ? `₹${tx.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
        </span>
      ),
    },
    {
      key: 'credit',
      header: 'Credit',
      render: (tx) => (
        <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs">
          {tx.credit > 0 ? `₹${tx.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (tx) => (
        <span className="font-semibold text-xs" style={{ color: 'var(--color-text-primary)' }}>
          ₹{tx.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  if (!transactions || transactions.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mt-6 space-y-4"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Parsed Transactions ({transactions.length})
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Extracted on-the-fly. Choose your desired export format below.
          </p>
        </div>

        {/* Actions & format download buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDownloadExcel}
            isLoading={isDownloadingExcel}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />}
            className="text-xs"
          >
            Excel (.xlsx)
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={onDownloadCsv}
            isLoading={isDownloadingCsv}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />}
            className="text-xs"
          >
            CSV
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDownloadXml(companyName.trim() || 'Company', bankLedger.trim() || 'Bank Account')}
            isLoading={isDownloadingXml}
            leftIcon={<FileCode2 className="w-3.5 h-3.5 text-amber-500" />}
            className="text-xs"
          >
            Tally XML
          </Button>

          {onDownloadGstJson && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDownloadGstJson(filingPeriod.trim() || '072026')}
              isLoading={isDownloadingGstJson}
              leftIcon={<FileCode2 className="w-3.5 h-3.5 text-purple-500" />}
              className="text-xs"
            >
              GST JSON
            </Button>
          )}

          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs text-[#00C2B3]"
          >
            {showConfig ? 'Hide Config' : 'Export Settings'}
          </Button>

          <Button 
            variant="primary"
            size="sm"
            onClick={handleSyncToTally}
            isLoading={isSyncingToTally}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Sync to Tally
          </Button>
        </div>
      </div>

      {/* Expandable Export Config */}
      {showConfig && (
        <div
          className="p-3.5 rounded-xl border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fadeIn"
          style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <label className="text-[11px] font-medium block mb-1 text-[var(--color-text-secondary)]">
              Tally Company Name:
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp Pvt Ltd"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium block mb-1 text-[var(--color-text-secondary)]">
              Tally Bank Ledger:
            </label>
            <input
              type="text"
              value={bankLedger}
              onChange={(e) => setBankLedger(e.target.value)}
              placeholder="e.g. HDFC Current A/c"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium block mb-1 text-[var(--color-text-secondary)]">
              GST Filing Period (MMYYYY):
            </label>
            <input
              type="text"
              value={filingPeriod}
              onChange={(e) => setFilingPeriod(e.target.value)}
              placeholder="e.g. 072026"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
            />
          </div>
        </div>
      )}

      {/* Sync Status Banner */}
      {syncStatus && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium animate-fadeIn ${
            syncStatus.type === 'success'
              ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-900'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#00C2B3] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{syncStatus.message}</span>
          </div>

          {tallyJobId && (
            <Link
              href="/dashboard/tally-sync"
              className="inline-flex items-center gap-1 font-semibold text-[#00C2B3] hover:underline shrink-0 ml-3"
            >
              View Sync Queue <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* Table */}
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
