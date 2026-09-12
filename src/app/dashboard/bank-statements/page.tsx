'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  Building2,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useGetStatementsQuery } from '@/lib/store/api/bankStatementsApi';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { UploadIntakeModal } from '@/components/bank-statements/UploadIntakeModal';
import { BankStatement } from '@/lib/types/bankStatement.types';

export default function BankStatementsHubPage() {
  const { showToast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: statementsData, isLoading, isFetching, refetch } = useGetStatementsQuery(
    selectedClientId ? { clientId: selectedClientId } : undefined,
    {
      pollingInterval: 5000, // Poll every 5s if any statements are processing
    }
  );

  const { data: clientsData } = useGetClientsQuery();
  const clients = clientsData?.data || [];
  const statements: BankStatement[] = statementsData?.data || [];

  const filteredStatements = statements.filter((stmt) => {
    const bank = stmt.bankName?.toLowerCase() || '';
    const clientName = stmt.client?.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return bank.includes(query) || clientName.includes(query) || stmt.id.includes(query);
  });

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Fully Approved
        </span>
      );
    }
    if (status === 'REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00C2B3]/10 text-[#00C2B3] border border-[#00C2B3]/20">
          <CheckCircle2 className="w-3 h-3" /> Ready for Review
        </span>
      );
    }
    if (status === 'PROCESSING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <RefreshCw className="w-3 h-3 animate-spin text-amber-500" /> AI Parsing...
        </span>
      );
    }
    if (status === 'FAILED' || status === 'FAILED_PASSWORD') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <AlertTriangle className="w-3 h-3" /> {status === 'FAILED_PASSWORD' ? 'Password Protected' : 'Failed'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-500">
        <Clock className="w-3 h-3" /> {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div
        className="rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#00C2B3]/10 text-[#00C2B3] flex items-center justify-center font-bold shrink-0 shadow-sm">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Bank Statements & Document Automation
            </h1>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Upload statements (Native PDF, Scanned OCR, Excel), review 3-Tier AI mappings, and export to Tally & GST.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<UploadCloud className="w-4 h-4" />}
            className="text-xs shadow-sm"
          >
            Upload Statement
          </Button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div
        className="rounded-2xl p-4 border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by bank name, client, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3] cursor-pointer w-full md:w-60"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.companyName ? `(${c.companyName})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statements Table / List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#00C2B3] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Loading statements...
          </p>
        </div>
      ) : filteredStatements.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center shadow-sm space-y-4"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'var(--color-bg-skeleton)' }}
          >
            <FileSpreadsheet className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              No Bank Statements Found
            </h3>
            <p className="text-xs mt-1 max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Upload your first client statement to run Google Document AI & Gemini OCR with 3-Tier ledger mapping.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<UploadCloud className="w-4 h-4" />}
            className="text-xs"
          >
            Upload Statement Now
          </Button>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden border shadow-sm"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead
                className="text-[11px] uppercase tracking-wider font-semibold border-b"
                style={{
                  background: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <tr>
                  <th className="py-3.5 px-4">Bank / Client</th>
                  <th className="py-3.5 px-4">Parser Engine</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Reconciliation Math</th>
                  <th className="py-3.5 px-4">Uploaded Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredStatements.map((stmt) => (
                  <tr
                    key={stmt.id}
                    className="hover:bg-slate-500/5 transition-colors group cursor-pointer"
                  >
                    {/* Bank & Client */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-xs" style={{ color: 'var(--color-text-primary)' }}>
                        {stmt.bankName || 'Bank Statement'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Client: {stmt.client?.name || 'Unassigned'} · {stmt.format || 'PDF'}
                      </div>
                    </td>

                    {/* Parser Engine */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Sparkles className="w-3 h-3 text-[#00C2B3]" />
                        {stmt.parserUsed || 'Intake Auto-detect'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(stmt.status)}
                    </td>

                    {/* Math Reconciliation */}
                    <td className="py-3.5 px-4 text-center">
                      {stmt.validationStatus === 'PASSED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                        </span>
                      ) : stmt.validationStatus === 'FAILED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Diff Detected
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Upload Date */}
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(stmt.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {stmt.status === 'PROCESSING' ? (
                        <span className="text-[11px] text-amber-500 font-semibold animate-pulse">
                          Processing...
                        </span>
                      ) : (
                        <Link href={`/dashboard/bank-statements/${stmt.id}/review`}>
                          <Button
                            variant="primary"
                            size="sm"
                            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                            className="text-xs font-semibold"
                          >
                            Review & Export
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Intake Modal */}
      <UploadIntakeModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        preselectedClientId={selectedClientId}
      />
    </div>
  );
}
