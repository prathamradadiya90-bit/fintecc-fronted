'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  RefreshCw,
  SlidersHorizontal,
  Brain,
  ShieldAlert,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useGetStatementReviewQuery,
  useBulkApproveRowsMutation,
  useBulkRejectRowsMutation,
  useQueueBankStatementSyncMutation,
} from '@/lib/store/api/bankStatementsApi';
import { CAReviewTable } from '@/components/bank-statements/CAReviewTable';
import { ExportModal } from '@/components/bank-statements/ExportModal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BankStatementReviewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const statementId = resolvedParams.id;
  const router = useRouter();
  const { showToast } = useToast();

  const { data: reviewResponse, isLoading, isError, refetch } = useGetStatementReviewQuery(statementId);
  const [bulkApproveRows, { isLoading: isApproving }] = useBulkApproveRowsMutation();
  const [bulkRejectRows, { isLoading: isRejecting }] = useBulkRejectRowsMutation();
  const [queueBankStatementSync, { isLoading: isQueueingTally }] = useQueueBankStatementSyncMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [bankLedgerName, setBankLedgerName] = useState('Bank Account');

  const reviewData = reviewResponse?.data;
  const statementInfo = reviewData?.statementInfo;
  const summary = reviewData?.summary;
  const transactions = reviewData?.transactions || [];

  const unapprovedTransactions = transactions.filter((t) => t.status !== 'APPROVED');
  const unapprovedCount = unapprovedTransactions.length;
  const needsReviewTransactions = transactions.filter(
    (t) => t.status !== 'APPROVED' && (t.needsReview || (t.confidenceScore !== null && t.confidenceScore !== undefined && t.confidenceScore < 80))
  );
  const needsReviewCount = needsReviewTransactions.length;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(transactions.map((t) => t.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleSelectPending = () => {
    setSelectedIds(unapprovedTransactions.map((t) => t.id));
  };

  const handleSelectNeedsReview = () => {
    setSelectedIds(needsReviewTransactions.map((t) => t.id));
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      showToast('Select at least one transaction to approve', 'error');
      return;
    }

    try {
      const res = await bulkApproveRows({
        statementId,
        rowIds: selectedIds,
        transactionIds: selectedIds,
      }).unwrap();

      showToast(`Approved ${res.data?.count || selectedIds.length} transactions. AI learned any updated mappings!`, 'success');
      setSelectedIds([]);
      refetch();
    } catch (err: any) {
      console.error('Bulk approve failed:', err);
      showToast(err?.data?.message || 'Failed to approve transactions', 'error');
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) {
      showToast('Select at least one transaction to reject', 'error');
      return;
    }

    try {
      const res = await bulkRejectRows({
        statementId,
        rowIds: selectedIds,
        transactionIds: selectedIds,
        reason: 'Flagged by CA during review',
      }).unwrap();

      showToast(`Flagged ${res.data?.count || selectedIds.length} transactions as rejected`, 'info');
      setSelectedIds([]);
      refetch();
    } catch (err: any) {
      console.error('Bulk reject failed:', err);
      showToast(err?.data?.message || 'Failed to reject transactions', 'error');
    }
  };

  const handleSyncToTally = async () => {
    if (unapprovedCount > 0) {
      showToast(`Cannot sync to Tally: ${unapprovedCount} transactions are pending CA approval.`, 'error');
      return;
    }

    try {
      const res = await queueBankStatementSync({
        statementId,
        bankLedger: bankLedgerName.trim() || 'Bank Account',
      }).unwrap();

      showToast('Queued for Desktop Tally Sync', 'success');
    } catch (err: any) {
      console.error('Tally queue sync error:', err);
      showToast(err?.data?.message || 'Failed to queue for Tally sync', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#00C2B3] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Loading statement review dataset and AI mappings...
        </p>
      </div>
    );
  }

  if (isError || !reviewData) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 inline-block">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-heading)' }}>
          Statement Not Found
        </h2>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          The requested bank statement could not be loaded or you do not have permission to review it.
        </p>
        <Link href="/dashboard/bank-statements">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Statements
          </Button>
        </Link>
      </div>
    );
  }

  const validationReport = statementInfo?.validationReport;
  const isMathValid = statementInfo?.validationStatus === 'PASSED';

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/bank-statements"
              className="text-xs font-semibold flex items-center gap-1 text-[#00C2B3] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Statements
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-400">Statement Review</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              {statementInfo?.bankName || 'Bank Statement'} Review
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                unapprovedCount === 0 && transactions.length > 0
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-[#00C2B3]/10 text-[#00C2B3] border border-[#00C2B3]/20'
              }`}
            >
              {unapprovedCount === 0 && transactions.length > 0 ? 'COMPLETED' : (statementInfo?.status || 'REVIEW')}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Statement ID: <span className="font-mono text-slate-400">{statementId}</span> · Parser: {statementInfo?.parserUsed || 'Universal Intake'}
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncToTally}
            isLoading={isQueueingTally}
            disabled={unapprovedCount > 0}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            title={unapprovedCount > 0 ? 'Approve all rows before syncing' : 'Push to Desktop Tally'}
            className="text-xs"
          >
            Sync to Tally Prime
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Export Engine
          </Button>
        </div>
      </div>

      {/* Math Reconciliation Check Banner */}
      {validationReport && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isMathValid
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isMathValid ? (
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {isMathValid ? 'Ledger Reconciliation Math Verified (Passed)' : 'Reconciliation Math Notice'}
              </span>
              <p className="text-[11px] opacity-80 mt-0.5">
                Opening ₹{Number(validationReport.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} + Credits ₹{Number(validationReport.totalCredits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} - Debits ₹{Number(validationReport.totalDebits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} = Expected ₹{Number(validationReport.expectedClosing || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Actual ₹{Number(validationReport.actualClosing || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })})
              </p>
            </div>
          </div>

          {!isMathValid && validationReport.difference && (
            <span className="font-semibold text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-900 dark:text-amber-100 border border-amber-500/30 whitespace-nowrap">
              Difference: ₹{Math.abs(Number(validationReport.difference)).toFixed(2)}
            </span>
          )}
        </div>
      )}

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className="rounded-xl p-3.5 border shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="text-[11px] font-semibold text-slate-400">TOTAL TRANSACTIONS</div>
          <div className="text-xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
            {summary?.totalRows || transactions.length}
          </div>
        </div>

        <div
          className="rounded-xl p-3.5 border shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> NEEDS REVIEW / UNCERTAIN
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {needsReviewCount}
          </div>
        </div>

        <div
          className="rounded-xl p-3.5 border shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="text-[11px] font-semibold text-slate-400">PENDING APPROVAL</div>
          <div className="text-xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
            {unapprovedCount}
          </div>
        </div>

        <div
          className="rounded-xl p-3.5 border shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED ROWS
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {summary?.approvedRows || (transactions.length - unapprovedCount)}
          </div>
        </div>
      </div>

      {/* Machine Learning Feedback Alert Banner */}
      <div
        className="p-3.5 rounded-xl border flex items-start sm:items-center justify-between gap-3 text-xs"
        style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 text-[#00C2B3] shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="font-semibold text-xs" style={{ color: 'var(--color-text-primary)' }}>
              Active AI Feedback & Auto-Learning Loop
            </span>
            <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
              When you edit a suggested ledger and click <strong>Approve</strong>, Fintecc automatically learns this pattern. Future bank statements for this firm will auto-map to your preferred ledger with 95%+ confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Bulk Actions Toolbar */}
      <div
        className="rounded-2xl p-3 border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-[#00C2B3] text-white'
                : 'text-slate-500 hover:bg-slate-500/10'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setActiveFilter('NEEDS_REVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeFilter === 'NEEDS_REVIEW'
                ? 'bg-amber-500 text-white'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Needs Review ({needsReviewCount})
          </button>
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'PENDING'
                ? 'bg-slate-700 text-white'
                : 'text-slate-500 hover:bg-slate-500/10'
            }`}
          >
            Pending ({unapprovedCount})
          </button>
          <button
            onClick={() => setActiveFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-colors ${
              activeFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white dark:text-white'
                : 'hover:bg-emerald-500/10'
            }`}
          >
            Approved ({transactions.length - unapprovedCount})
          </button>
        </div>

        {/* Selection & Bulk Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#00C2B3]">
                {selectedIds.length} Selected
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkReject}
                isLoading={isRejecting}
                leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                className="text-xs"
              >
                Reject
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkApprove}
                isLoading={isApproving}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Approve Selected ({selectedIds.length})
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <button
                onClick={handleSelectNeedsReview}
                className="px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:bg-slate-500/5 text-amber-600 dark:text-amber-400"
              >
                Select Flagged ({needsReviewCount})
              </button>
              <button
                onClick={handleSelectPending}
                className="px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:bg-slate-500/5"
              >
                Select All Pending ({unapprovedCount})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Review Grid */}
      <CAReviewTable
        statementId={statementId}
        transactions={transactions}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        filterStatus={activeFilter}
      />

      {/* Export Engine Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        statementId={statementId}
        unapprovedCount={unapprovedCount}
        totalCount={transactions.length}
        companyNameDefault={statementInfo?.bankName || 'Client Firm'}
      />
    </div>
  );
}
