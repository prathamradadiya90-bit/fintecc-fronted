'use client';

import React, { useState, useMemo } from 'react';
import {
  FileSignature,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  XCircle,
  Copy,
  ShieldCheck,
  FileText,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetSignaturesQuery } from '@/lib/store/api/signaturesApi';
import { CreateSignatureModal } from '@/components/signatures/CreateSignatureModal';
import { UpdateSignatureModal } from '@/components/signatures/UpdateSignatureModal';
import { useToast } from '@/components/ui/Toast';
import type { SignatureRequest, SignatureStatus } from '@/lib/types/signature.types';

const statusBadgeStyles: Record<SignatureStatus, { label: string; badge: string; icon: React.ElementType }> = {
  PENDING: {
    label: 'Pending Signature',
    badge: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    icon: Clock,
  },
  VIEWED: {
    label: 'Opened / Viewed',
    badge: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
    icon: Eye,
  },
  SIGNED: {
    label: 'Signed & Executed',
    badge: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
    icon: CheckCircle2,
  },
  DECLINED: {
    label: 'Declined',
    badge: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
    icon: XCircle,
  },
};

export default function DigitalSignaturesPage() {
  const { showToast } = useToast();
  const { data: signaturesResponse, isLoading } = useGetSignaturesQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SignatureStatus>('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<SignatureRequest | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const signatures = useMemo(() => signaturesResponse?.data || [], [signaturesResponse]);

  // Metrics
  const metrics = useMemo(() => {
    const total = signatures.length;
    let pending = 0;
    let signed = 0;
    let declined = 0;

    signatures.forEach((s) => {
      if (s.status === 'PENDING' || s.status === 'VIEWED') pending += 1;
      else if (s.status === 'SIGNED') signed += 1;
      else if (s.status === 'DECLINED') declined += 1;
    });

    const completionRate = total > 0 ? Math.round((signed / total) * 100) : 0;

    return { total, pending, signed, declined, completionRate };
  }, [signatures]);

  // Filtered
  const filteredSignatures = useMemo(() => {
    return signatures.filter((sig) => {
      const clientName = sig.client?.companyName || sig.client?.name || '';
      const matchesSearch =
        searchQuery === '' ||
        sig.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sig.envelopeId && sig.envelopeId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || sig.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [signatures, searchQuery, statusFilter]);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Document link copied to clipboard!', 'success');
  };

  const openUpdateModal = (sig: SignatureRequest) => {
    setSelectedSignature(sig);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Digital Signatures & Legal eSign
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Aadhaar & DocuSign
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Dispatch, monitor, and execute client engagement letters, representation certificates, and legal authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Signature Request
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-2xl border space-y-2"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Total Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FileSignature className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {metrics.total}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">All envelopes issued</span>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border space-y-2"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Pending Execution
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {metrics.pending}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Awaiting client signature</span>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border space-y-2"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Signed & Executed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.signed}
            </div>
            <span className="text-[11px] text-emerald-500 font-semibold">
              {metrics.completionRate}% completion rate
            </span>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border space-y-2"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Declined / Voided
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {metrics.declined}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Needs re-drafting</span>
          </div>
        </div>
      </div>

      {/* Legal & Security Banner */}
      <div
        className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3"
      >
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Legal Compliance & Cryptographic Validity
          </span>
          <p className="leading-relaxed">
            All signatures generated and recorded adhere to Indian IT Act (2000) standards for Electronic Signature Providers (ESP). Envelopes contain verifiable hash audits, timestamp certificates, and IP tracking.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by document title or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              style={{
                background: 'var(--color-bg-subtle)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div className="hidden sm:flex items-center gap-1">
            {(['ALL', 'PENDING', 'VIEWED', 'SIGNED', 'DECLINED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-16 rounded-2xl border animate-pulse"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            />
          ))}
        </div>
      ) : filteredSignatures.length === 0 ? (
        <div
          className="p-12 text-center rounded-2xl border space-y-3"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              No Digital Signature Requests Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or status filter.'
                : 'Send legal engagement letters and documents for client electronic signing.'}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Signature Request
          </Button>
        </div>
      ) : (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-subtle)' }}>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Document Title</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Client Recipient</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Provider & Security</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Timeline</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {filteredSignatures.map((sig) => {
                  const StatusIcon = statusBadgeStyles[sig.status].icon;
                  const clientTitle = sig.client?.companyName || sig.client?.name || 'Client';

                  return (
                    <tr
                      key={sig.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {sig.documentName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-xs block">
                              {sig.documentUrl}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {clientTitle}
                        </span>
                        {sig.client?.email && (
                          <span className="text-[11px] text-slate-400 block truncate">
                            {sig.client.email}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {sig.provider || 'Aadhaar eSign'}
                        </span>
                        {sig.providerMetadata?.txnId && (
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                            {sig.providerMetadata.txnId}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border inline-flex items-center gap-1.5 ${statusBadgeStyles[sig.status].badge}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusBadgeStyles[sig.status].label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        <div>
                          Created: {new Date(sig.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        {sig.signedAt && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Signed: {new Date(sig.signedAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(sig.documentUrl)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Copy Document Link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {sig.signedDocumentUrl && (
                            <a
                              href={sig.signedDocumentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                              title="Download Signed PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUpdateModal(sig)}
                            className="text-xs"
                          >
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateSignatureModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <UpdateSignatureModal
        signature={selectedSignature}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </div>
  );
}
