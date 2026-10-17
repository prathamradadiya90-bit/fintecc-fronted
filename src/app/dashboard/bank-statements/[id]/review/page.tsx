'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  Brain,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  Copy,
  Edit3,
  HelpCircle,
  AlertCircle,
  Filter,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useGetStatementReviewQuery,
  useBulkApproveRowsMutation,
  useBulkRejectRowsMutation,
  useQueueBankStatementSyncMutation,
  useConfirmAndPostToLedgerMutation,
} from '@/lib/store/api/bankStatementsApi';
import { CAReviewTable } from '@/components/bank-statements/CAReviewTable';
import { ExportModal } from '@/components/bank-statements/ExportModal';
import { PostToLedgerModal } from '@/components/bank-statements/PostToLedgerModal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BankStatementReviewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const statementId = resolvedParams.id;
  const router = useRouter();
  const { showToast } = useToast();

  const [pollingInterval, setPollingInterval] = useState<number>(0);

  const {
    data: reviewResponse,
    isLoading,
    isError,
    refetch,
  } = useGetStatementReviewQuery(statementId, {
    pollingInterval,
  });

  const [bulkApproveRows, { isLoading: isApproving }] = useBulkApproveRowsMutation();
  const [bulkRejectRows, { isLoading: isRejecting }] = useBulkRejectRowsMutation();
  const [queueBankStatementSync, { isLoading: isQueueingTally }] = useQueueBankStatementSyncMutation();
  const [confirmAndPostToLedger, { isLoading: isPostingToLedger }] = useConfirmAndPostToLedgerMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [bankLedgerName, setBankLedgerName] = useState('Bank Account');

  const reviewData = reviewResponse?.data;
  const statementInfo = reviewData?.statementInfo;
  const summary = reviewData?.summary;
  const transactions = reviewData?.transactions || [];

  const isProcessingStatus = [
    'PROCESSING',
    'INSPECTING',
    'EXTRACTING',
    'VALIDATING',
    'UPLOADED',
    'TEXT_PARSED',
    'NEEDS_OCR',
  ].includes(statementInfo?.status as string);

  useEffect(() => {
    setPollingInterval(isProcessingStatus ? 3500 : 0);
  }, [isProcessingStatus]);

  // Categorize counts
  const unapprovedTransactions = useMemo(
    () => transactions.filter((t) => t.status !== 'APPROVED' && t.status !== 'POSTED'),
    [transactions]
  );
  const unapprovedCount = unapprovedTransactions.length;

  const approvedTransactions = useMemo(
    () => transactions.filter((t) => t.status === 'APPROVED'),
    [transactions]
  );
  const approvedCount = approvedTransactions.length;

  const postedTransactions = useMemo(
    () => transactions.filter((t) => t.status === 'POSTED'),
    [transactions]
  );
  const postedCount = postedTransactions.length;

  // Flagged / Needs Review
  const needsReviewTransactions = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.status !== 'APPROVED' &&
          t.status !== 'POSTED' &&
          (t.needsReview ||
            (t.flags && t.flags.length > 0) ||
            t.balanceMismatch ||
            (t.confidenceScore !== null &&
              t.confidenceScore !== undefined &&
              t.confidenceScore < 85))
      ),
    [transactions]
  );
  const needsReviewCount = needsReviewTransactions.length;

  // Potential Duplicates
  const duplicateTransactions = useMemo(
    () =>
      transactions.filter(
        (t) => t.flags?.includes('POTENTIAL_DUPLICATE') || Boolean(t.duplicateGroupId)
      ),
    [transactions]
  );
  const duplicateCount = duplicateTransactions.length;

  // Balance mismatches count
  const openingBal = statementInfo?.validationReport?.openingBalance ?? null;
  const mismatchCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      if (tx.balanceMismatch || tx.flags?.includes('BALANCE_MISMATCH')) {
        count++;
        continue;
      }
      if (i === 0 && openingBal !== null) {
        const expected = Number((openingBal + Number(tx.credit || 0) - Number(tx.debit || 0)).toFixed(2));
        if (Math.abs(expected - Number(tx.balance || 0)) > 0.05) count++;
      } else if (i > 0) {
        const prevBal = Number(transactions[i - 1].balance || 0);
        const expected = Number((prevBal + Number(tx.credit || 0) - Number(tx.debit || 0)).toFixed(2));
        if (Math.abs(expected - Number(tx.balance || 0)) > 0.05) count++;
      }
    }
    return count;
  }, [transactions, openingBal]);

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

      showToast(
        `Approved ${res.data?.count || selectedIds.length} transactions. AI learned any updated mappings!`,
        'success'
      );
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

  const handleRejectSingleRow = async (rowId: string) => {
    try {
      await bulkRejectRows({
        statementId,
        rowIds: [rowId],
        reason: 'Rejected individually by CA',
      }).unwrap();

      showToast('Transaction rejected.', 'info');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to reject transaction', 'error');
    }
  };

  const handleConfirmPostToLedger = async () => {
    try {
      const res = await confirmAndPostToLedger({
        statementId,
      }).unwrap();

      showToast(
        `Successfully posted ${res.data?.postedCount || approvedCount} transaction vouchers to General Ledger!`,
        'success'
      );
      setIsPostModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error('Failed to post to General Ledger:', err);
      showToast(err?.data?.message || 'Failed to post to General Ledger', 'error');
    }
  };

  const handleSyncToTally = async () => {
    if (unapprovedCount > 0) {
      showToast(
        `Cannot sync to Tally: ${unapprovedCount} transactions are pending CA approval.`,
        'error'
      );
      return;
    }

    try {
      await queueBankStatementSync({
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
      <div className="w-full py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#4A6FA5] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-[#5A6E85]">
          Loading statement review dataset, validation reports, and AI mappings...
        </p>
      </div>
    );
  }

  if (isError || !reviewData) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="p-3 rounded-2xl bg-[#9E4A4A]/10 text-[#9E4A4A] inline-block">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-[#1E2A38] dark:text-slate-100">
          Statement Not Found
        </h2>
        <p className="text-xs text-[#5A6E85]">
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
  const isMathValid =
    statementInfo?.validationStatus === 'PASSED' ||
    (validationReport && Math.abs(Number(validationReport.difference || 0)) < 0.05);

  const flagCounts = summary?.flagCounts || {};

  return (
    <div className="w-full space-y-5 pb-16">
      {/* Top Breadcrumb & Header */}
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4"
        style={{ borderColor: 'var(--color-border, #E2E8F0)' }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/bank-statements"
              className="text-xs font-semibold flex items-center gap-1 text-[#4A6FA5] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Statements
            </Link>
            <span className="text-[#8E9FAA]">/</span>
            <span className="text-xs text-[#5A6E85]">CA Verification & Reconciliation</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#1E2A38] dark:text-slate-100">
              {statementInfo?.bankName || 'Bank Statement'} Review
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                unapprovedCount === 0 && transactions.length > 0
                  ? 'bg-[#3D7A64]/10 text-[#3D7A64] border-[#3D7A64]/20'
                  : 'bg-[#4A6FA5]/10 text-[#4A6FA5] border-[#4A6FA5]/20'
              }`}
            >
              {unapprovedCount === 0 && transactions.length > 0
                ? 'ALL APPROVED'
                : statementInfo?.status || 'REVIEW'}
            </span>
          </div>

          <p className="text-xs text-[#5A6E85]">
            Statement ID: <span className="font-mono text-[#8E9FAA]">{statementId}</span> · Parser:{' '}
            <span className="font-medium text-[#1E2A38] dark:text-slate-200">
              {statementInfo?.parserUsed || 'Universal Intake Engine'}
            </span>
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Post to General Ledger Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPostModalOpen(true)}
            disabled={approvedCount === 0}
            leftIcon={<BookOpen className="w-3.5 h-3.5" />}
            title={
              approvedCount > 0
                ? `Create double-entry journal vouchers for ${approvedCount} approved rows`
                : 'Approve rows before posting to General Ledger'
            }
            className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
          >
            Post to General Ledger ({approvedCount})
          </Button>

          {/* Export Engine Modal */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs border-[#E2E8F0] dark:border-[#1E2B42] text-[#1E2A38] dark:text-slate-200"
          >
            Export (Tally/Excel)
          </Button>

          {/* Desktop Sync */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSyncToTally}
            isLoading={isQueueingTally}
            disabled={unapprovedCount > 0}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            title={unapprovedCount > 0 ? 'Approve all rows before desktop sync' : 'Push to Desktop Tally'}
            className="text-xs text-[#5A6E85]"
          >
            Tally Sync
          </Button>
        </div>
      </div>

      {/* Active Processing Banner if user opened review while OCR/Extraction is running */}
      {isProcessingStatus && (
        <div className="p-4 rounded-2xl border bg-[#4A6FA5]/10 border-[#4A6FA5]/30 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#4A6FA5]/15 text-[#4A6FA5] shrink-0 mt-0.5">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1E2A38] dark:text-slate-100 flex items-center gap-2">
              Extraction Pipeline in Progress
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#4A6FA5]/20 text-[#4A6FA5]">
                {statementInfo?.status === 'NEEDS_OCR' ? 'Vision OCR' : statementInfo?.status}
              </span>
            </h3>
            <p className="text-xs text-[#5A6E85]">
              This statement document is currently being parsed by the background extraction engine.
              This review screen is automatically polling and will display all extracted transaction rows, confidence scores, and ledger mappings as soon as processing completes.
            </p>
          </div>
        </div>
      )}

      {/* Duplicate Re-upload Alert Banner */}
      {validationReport?.error && (validationReport.error.includes('Duplicate') || (validationReport.skippedDuplicates && transactions.length === 0)) ? (
        <div className="p-4 rounded-2xl border bg-[#9E6B42]/10 border-[#9E6B42]/30 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#9E6B42]/15 text-[#9E6B42] shrink-0 mt-0.5">
            <Copy className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1E2A38] dark:text-slate-100">
              All Transactions Skipped (Duplicate Statement Upload)
            </h3>
            <p className="text-xs text-[#5A6E85]">
              {validationReport.error} The duplicate protection engine skipped{' '}
              <strong className="text-[#1E2A38] dark:text-slate-200">{validationReport.skippedDuplicates} identical records</strong>{' '}
              that were already extracted and saved in a previously processed statement for this client to prevent double-counting in your accounting ledger.
            </p>
            <div className="pt-1.5">
              <Link
                href="/dashboard/bank-statements"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#4A6FA5] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Statements list to view previously processed statements
              </Link>
            </div>
          </div>
        </div>
      ) : validationReport && validationReport.openingBalance !== undefined && validationReport.openingBalance !== null ? (
        /* 1. Mathematical Reconciliation Card */
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isMathValid
              ? 'bg-[#3D7A64]/5 border-[#3D7A64]/20'
              : 'bg-[#9E4A4A]/5 border-[#9E4A4A]/25'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isMathValid
                    ? 'bg-[#3D7A64]/10 text-[#3D7A64]'
                    : 'bg-[#9E4A4A]/10 text-[#9E4A4A]'
                }`}
              >
                {isMathValid ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <ShieldAlert className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#1E2A38] dark:text-slate-100">
                    {isMathValid
                      ? 'Mathematical Reconciliation Verified'
                      : 'Mathematical Reconciliation Discrepancy'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      isMathValid
                        ? 'bg-[#3D7A64]/10 text-[#3D7A64] border border-[#3D7A64]/20'
                        : 'bg-[#9E4A4A]/10 text-[#9E4A4A] border border-[#9E4A4A]/20'
                    }`}
                  >
                    {isMathValid ? 'BALANCED' : 'UNBALANCED'}
                  </span>
                </div>
                <div className="text-xs text-[#5A6E85] font-mono flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span>
                    Opening ₹
                    {Number(validationReport.openingBalance || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-[#3D7A64]">
                    + Credits ₹
                    {Number(validationReport.totalCredits || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-[#9E4A4A]">
                    - Debits ₹
                    {Number(validationReport.totalDebits || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span>
                    = Expected ₹
                    {Number(validationReport.expectedClosing || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-[#1E2A38] dark:text-slate-200 font-bold">
                    (Actual ₹
                    {Number(validationReport.actualClosing || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                    )
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isMathValid && (
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-[#9E4A4A] font-semibold">Net Difference</span>
                  <span className="text-base font-bold text-[#9E4A4A] font-mono">
                    ₹{Math.abs(Number(validationReport.difference || 0)).toFixed(2)}
                  </span>
                </div>
              )}

              {mismatchCount > 0 && (
                <button
                  onClick={() => setActiveFilter('BALANCE_MISMATCH')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#9E4A4A]/10 hover:bg-[#9E4A4A]/20 text-[#9E4A4A] border border-[#9E4A4A]/30 transition-colors flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Filter Mismatched Rows ({mismatchCount})
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div
          className="rounded-xl p-3.5 border shadow-xs"
          style={{
            background: 'var(--color-bg-card, #FFFFFF)',
            borderColor: 'var(--color-border, #E2E8F0)',
          }}
        >
          <div className="text-[11px] font-semibold text-[#8E9FAA]">TOTAL TRANSACTIONS</div>
          <div className="text-xl font-bold mt-1 text-[#1E2A38] dark:text-slate-100">
            {summary?.totalRows || transactions.length}
          </div>
          <span className="text-[11px] text-[#5A6E85]">Extracted rows</span>
        </div>

        <div
          className="rounded-xl p-3.5 border shadow-xs"
          style={{
            background: 'var(--color-bg-card, #FFFFFF)',
            borderColor: 'var(--color-border, #E2E8F0)',
          }}
        >
          <div className="text-[11px] font-semibold text-[#9E6B42] flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> NEEDS REVIEW
          </div>
          <div className="text-xl font-bold text-[#9E6B42] mt-1">
            {needsReviewCount}
          </div>
          <span className="text-[11px] text-[#5A6E85]">Uncertain / Low Conf</span>
        </div>

        <div
          className="rounded-xl p-3.5 border shadow-xs"
          style={{
            background: 'var(--color-bg-card, #FFFFFF)',
            borderColor: 'var(--color-border, #E2E8F0)',
          }}
        >
          <div className="text-[11px] font-semibold text-[#5A6E85] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> PENDING APPROVAL
          </div>
          <div className="text-xl font-bold mt-1 text-[#1E2A38] dark:text-slate-100">
            {unapprovedCount}
          </div>
          <span className="text-[11px] text-[#5A6E85]">Awaiting CA sign-off</span>
        </div>

        <div
          className="rounded-xl p-3.5 border shadow-xs"
          style={{
            background: 'var(--color-bg-card, #FFFFFF)',
            borderColor: 'var(--color-border, #E2E8F0)',
          }}
        >
          <div className="text-[11px] font-semibold text-[#3D7A64] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED ROWS
          </div>
          <div className="text-xl font-bold text-[#3D7A64] mt-1">
            {approvedCount}
          </div>
          <span className="text-[11px] text-[#5A6E85]">Ready to Post to GL</span>
        </div>

        <div
          className="rounded-xl p-3.5 border shadow-xs"
          style={{
            background: 'var(--color-bg-card, #FFFFFF)',
            borderColor: 'var(--color-border, #E2E8F0)',
          }}
        >
          <div className="text-[11px] font-semibold text-[#4A6FA5] flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> GL POSTED
          </div>
          <div className="text-xl font-bold text-[#4A6FA5] mt-1">
            {postedCount}
          </div>
          <span className="text-[11px] text-[#5A6E85]">Vouchers recorded</span>
        </div>
      </div>

      {/* 3. Interactive Flag Telemetry Bar */}
      <div
        className="rounded-2xl p-3 border shadow-xs space-y-2"
        style={{
          background: 'var(--color-bg-card, #FFFFFF)',
          borderColor: 'var(--color-border, #E2E8F0)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#1E2A38] dark:text-slate-100 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#4A6FA5]" /> Flag Telemetry & Inspection Filters
          </span>
          {activeFilter !== 'ALL' && (
            <button
              onClick={() => setActiveFilter('ALL')}
              className="text-xs text-[#4A6FA5] hover:underline font-medium"
            >
              Reset to All ({transactions.length})
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* All */}
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-[#4A6FA5] text-white shadow-xs'
                : 'bg-[#F7F9FB] dark:bg-[#131C2E] text-[#5A6E85] hover:bg-slate-500/10 border border-[#E2E8F0] dark:border-[#1E2B42]'
            }`}
          >
            All Rows ({transactions.length})
          </button>

          {/* Needs Review */}
          <button
            onClick={() => setActiveFilter('NEEDS_REVIEW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeFilter === 'NEEDS_REVIEW'
                ? 'bg-[#9E6B42] text-white shadow-xs'
                : 'bg-[#9E6B42]/10 text-[#9E6B42] hover:bg-[#9E6B42]/20 border border-[#9E6B42]/20'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Needs Review ({needsReviewCount})
          </button>

          {/* Balance Mismatch Chip */}
          {mismatchCount > 0 && (
            <button
              onClick={() => setActiveFilter('BALANCE_MISMATCH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === 'BALANCE_MISMATCH'
                  ? 'bg-[#9E4A4A] text-white shadow-xs'
                  : 'bg-[#9E4A4A]/10 text-[#9E4A4A] hover:bg-[#9E4A4A]/20 border border-[#9E4A4A]/20'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              Balance Mismatch ({mismatchCount})
            </button>
          )}

          {/* Potential Duplicate Chip */}
          {duplicateCount > 0 && (
            <button
              onClick={() => setActiveFilter('POTENTIAL_DUPLICATE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === 'POTENTIAL_DUPLICATE'
                  ? 'bg-[#9E6B42] text-white shadow-xs'
                  : 'bg-[#9E6B42]/10 text-[#9E6B42] hover:bg-[#9E6B42]/20 border border-[#9E6B42]/20'
              }`}
            >
              <Copy className="w-3 h-3" />
              Duplicates ({duplicateCount})
            </button>
          )}

          {/* Uncertain Ledger Chip */}
          {(flagCounts.UNCERTAIN_LEDGER || 0) > 0 && (
            <button
              onClick={() => setActiveFilter('UNCERTAIN_LEDGER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === 'UNCERTAIN_LEDGER'
                  ? 'bg-[#9E6B42] text-white shadow-xs'
                  : 'bg-[#9E6B42]/10 text-[#9E6B42] hover:bg-[#9E6B42]/20 border border-[#9E6B42]/20'
              }`}
            >
              <HelpCircle className="w-3 h-3" />
              Uncertain Ledger ({flagCounts.UNCERTAIN_LEDGER})
            </button>
          )}

          {/* Low Confidence Chip */}
          {(flagCounts.LOW_CONFIDENCE || 0) > 0 && (
            <button
              onClick={() => setActiveFilter('LOW_CONFIDENCE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === 'LOW_CONFIDENCE'
                  ? 'bg-[#9E6B42] text-white shadow-xs'
                  : 'bg-[#9E6B42]/10 text-[#9E6B42] hover:bg-[#9E6B42]/20 border border-[#9E6B42]/20'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              Low Conf ({flagCounts.LOW_CONFIDENCE})
            </button>
          )}

          {/* CA Edited Chip */}
          {((summary?.userEditedRows || 0) > 0 || (flagCounts.MANUALLY_EDITED || 0) > 0) && (
            <button
              onClick={() => setActiveFilter('MANUALLY_EDITED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === 'MANUALLY_EDITED'
                  ? 'bg-[#4A6FA5] text-white shadow-xs'
                  : 'bg-[#4A6FA5]/10 text-[#4A6FA5] hover:bg-[#4A6FA5]/20 border border-[#4A6FA5]/20'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              CA Edited ({summary?.userEditedRows || flagCounts.MANUALLY_EDITED})
            </button>
          )}

          {/* Approved Rows */}
          <button
            onClick={() => setActiveFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeFilter === 'APPROVED'
                ? 'bg-[#3D7A64] text-white shadow-xs'
                : 'bg-[#3D7A64]/10 text-[#3D7A64] hover:bg-[#3D7A64]/20 border border-[#3D7A64]/20'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Approved ({approvedCount})
          </button>

          {/* GL Posted Rows */}
          {postedCount > 0 && (
            <button
              onClick={() => setActiveFilter('POSTED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === 'POSTED'
                  ? 'bg-[#4A6FA5] text-white shadow-xs'
                  : 'bg-[#4A6FA5]/10 text-[#4A6FA5] hover:bg-[#4A6FA5]/20 border border-[#4A6FA5]/20'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              GL Posted ({postedCount})
            </button>
          )}
        </div>
      </div>

      {/* 4. Selection Toolbar & Bulk Operations */}
      <div
        className="rounded-2xl p-3 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{
          background: 'var(--color-bg-card, #FFFFFF)',
          borderColor: 'var(--color-border, #E2E8F0)',
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#4A6FA5]">
                {selectedIds.length} Row(s) Selected
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkReject}
                isLoading={isRejecting}
                leftIcon={<XCircle className="w-3.5 h-3.5 text-[#9E4A4A]" />}
                className="text-xs text-[#9E4A4A] border-[#9E4A4A]/30 hover:bg-[#9E4A4A]/10"
              >
                Reject Selected
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkApprove}
                isLoading={isApproving}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="text-xs bg-[#3D7A64] hover:bg-[#2F5E4D] text-white"
              >
                Approve Selected ({selectedIds.length})
              </Button>

              <button
                onClick={handleDeselectAll}
                className="text-xs text-[#8E9FAA] hover:text-[#1E2A38] ml-2"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#8E9FAA] font-medium">Quick Select:</span>
              <button
                onClick={handleSelectNeedsReview}
                className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#1E2B42] hover:bg-slate-500/5 text-[#9E6B42] font-medium"
              >
                Select Flagged ({needsReviewCount})
              </button>
              <button
                onClick={handleSelectPending}
                className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#1E2B42] hover:bg-slate-500/5 text-[#5A6E85] font-medium"
              >
                Select All Pending ({unapprovedCount})
              </button>
            </div>
          )}
        </div>

        <div className="text-[11px] text-[#8E9FAA] flex items-center gap-1">
          <Brain className="w-3.5 h-3.5 text-[#3D7A64]" />
          Approving rows auto-trains firm ledger mappings.
        </div>
      </div>

      {/* 5. Main CA Review Grid */}
      <CAReviewTable
        statementId={statementId}
        transactions={transactions}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        filterStatus={activeFilter}
        openingBalance={openingBal}
        onRejectRow={handleRejectSingleRow}
      />

      {/* 6. Post To General Ledger Double-Entry Modal */}
      <PostToLedgerModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onConfirm={handleConfirmPostToLedger}
        isLoading={isPostingToLedger}
        transactions={transactions}
        bankLedgerName={bankLedgerName}
      />

      {/* 7. Export Engine Modal */}
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
