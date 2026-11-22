'use client';

import React, { useState } from 'react';
import {
  FileText,
  FileCode2,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  FileSpreadsheet,
  Building2,
  Calendar,
  CreditCard,
  FolderOpen,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge';
import { InvoiceViewModal } from '@/features/invoices/components/InvoiceViewModal';
import { InvoiceFormModal } from '@/features/invoices/components/InvoiceFormModal';
import type { Client } from '@/lib/types/client.types';
import type { Invoice } from '@/lib/types/invoice-management.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ClientAllDataTabProps {
  client: Client;
  invoices?: Invoice[];
  gstReturns?: any[];
  itrReturns?: any[];
  tasks?: any[];
  documents?: any[];
  onRefresh?: () => void;
}

export function ClientAllDataTab({
  client,
  invoices = [],
  gstReturns = [],
  itrReturns = [],
  tasks = [],
  documents = [],
  onRefresh,
}: ClientAllDataTabProps) {
  const { showToast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'gst' | 'itr' | 'documents'>('invoices');

  const handleDownloadTallyXml = async (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_BASE}/invoices/${invoice.id}/tally-xml`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoice.invoiceNumber || invoice.id}_tally.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(`Downloaded Tally XML for ${invoice.invoiceNumber}`, 'success');
    } catch (err) {
      showToast('Failed to download Tally XML', 'error');
    }
  };

  const handleDownloadPdf = async (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_BASE}/invoices/${invoice.id}/pdf`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoice.invoiceNumber || invoice.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(`Downloaded PDF for ${invoice.invoiceNumber}`, 'success');
    } catch (err) {
      showToast('Failed to download invoice PDF', 'error');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ─── Client 360 Header Metrics ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-xl shadow-sm space-y-1"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Total Invoices Raised
          </span>
          <div className="text-2xl font-black" style={{ color: 'var(--color-text-heading)' }}>
            {invoices.length}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            ₹{invoices.reduce((a, b) => a + (Number(b.totalAmount) || 0), 0).toLocaleString('en-IN')} Billed
          </span>
        </div>

        <div
          className="p-4 rounded-xl shadow-sm space-y-1"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            GST Returns Filed
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {gstReturns.length}
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            GSTR-1 & GSTR-3B
          </span>
        </div>

        <div
          className="p-4 rounded-xl shadow-sm space-y-1"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            ITR Statements
          </span>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
            {itrReturns.length}
          </div>
          <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
            Income Tax Returns
          </span>
        </div>

        <div
          className="p-4 rounded-xl shadow-sm space-y-1"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Vault Documents
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {documents.length}
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
            KYC & Registrations
          </span>
        </div>
      </div>

      {/* ─── Sub-Tab Navigation Bar ───────────────────────────────────────── */}
      <div
        className="rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 border"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'invoices'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Invoices & Tally Sync ({invoices.length})
          </button>
          <button
            onClick={() => setActiveSubTab('gst')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'gst'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            GST Filings History ({gstReturns.length})
          </button>
          <button
            onClick={() => setActiveSubTab('itr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'itr'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Income Tax / ITR Records ({itrReturns.length})
          </button>
          <button
            onClick={() => setActiveSubTab('documents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'documents'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Statutory Documents ({documents.length})
          </button>
        </div>

        {activeSubTab === 'invoices' && (
          <Button
            size="sm"
            onClick={() => setIsFormModalOpen(true)}
            leftIcon={<Receipt className="w-3.5 h-3.5" />}
          >
            Create New Invoice
          </Button>
        )}
      </div>

      {/* ─── Sub-Tab 1: INVOICES & TALLY DOWNLOAD ──────────────────────────── */}
      {activeSubTab === 'invoices' && (
        <div
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          {invoices.length === 0 ? (
            <div className="py-16 text-center">
              <Receipt className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                No invoices created for {client.name} yet
              </p>
              <p className="text-xs mt-1 mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Raise a Tally Prime compliant GST sales invoice for this client.
              </p>
              <Button size="sm" onClick={() => setIsFormModalOpen(true)}>
                Create First Invoice
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    className="border-b text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Buyer Order Ref</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Tally & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-500/5 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--color-text-secondary)' }}>
                        {inv.date ? new Date(inv.date).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        {inv.buyerOrderNo || '—'}
                      </td>
                      <td className="py-3 px-4 font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        ₹{Number(inv.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct Tally XML Download */}
                          <button
                            onClick={(e) => handleDownloadTallyXml(e, inv)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                            title="Download Tally Prime XML (.xml)"
                          >
                            <FileCode2 className="w-3.5 h-3.5" />
                            Tally XML
                          </button>

                          {/* PDF Download */}
                          <button
                            onClick={(e) => handleDownloadPdf(e, inv)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Download PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* View Modal */}
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsViewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Sub-Tab 2: GST FILINGS HISTORY ────────────────────────────────── */}
      {activeSubTab === 'gst' && (
        <div
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          {gstReturns.length === 0 ? (
            <div className="py-16 text-center">
              <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                No GST return filings recorded yet
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                GST returns filed via the GST Module will automatically sync here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    className="border-b text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <th className="py-3 px-4">Return Type</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">ARN (Acknowledgement)</th>
                    <th className="py-3 px-4">Tax Liability</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Filing Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {gstReturns.map((ret, idx) => (
                    <tr key={ret.id || idx} className="hover:bg-slate-500/5">
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {ret.returnType || 'GSTR-1'}
                      </td>
                      <td className="py-3 px-4 font-mono">{ret.period || ret.filingPeriod || '—'}</td>
                      <td className="py-3 px-4 font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {ret.arn || ret.acknowledgementNumber || '—'}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        ₹{Number(ret.totalTaxPayable || ret.taxAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ret.status === 'FILED' || ret.status === 'Filed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {ret.status || 'FILED'}
                        </span>
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                        {ret.filedAt || ret.createdAt ? new Date(ret.filedAt || ret.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Sub-Tab 3: ITR RECORDS ────────────────────────────────────────── */}
      {activeSubTab === 'itr' && (
        <div
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          {itrReturns.length === 0 ? (
            <div className="py-16 text-center">
              <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                No Income Tax Return records available
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                ITR filings and computations for this client will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    className="border-b text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <th className="py-3 px-4">Assessment Year</th>
                    <th className="py-3 px-4">Form</th>
                    <th className="py-3 px-4">Acknowledgement #</th>
                    <th className="py-3 px-4">Gross Income</th>
                    <th className="py-3 px-4">Tax Paid</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {itrReturns.map((itr, idx) => (
                    <tr key={itr.id || idx} className="hover:bg-slate-500/5">
                      <td className="py-3 px-4 font-bold">{itr.assessmentYear || 'AY 2024-25'}</td>
                      <td className="py-3 px-4 font-semibold text-teal-600 dark:text-teal-400">
                        {itr.itrFormType || 'ITR-4'}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {itr.acknowledgementNumber || '—'}
                      </td>
                      <td className="py-3 px-4">
                        ₹{Number(itr.grossTotalIncome || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(itr.taxPaid || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          {itr.status || 'VERIFIED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Sub-Tab 4: STATUTORY DOCUMENTS ────────────────────────────────── */}
      {activeSubTab === 'documents' && (
        <div
          className="rounded-2xl shadow-sm overflow-hidden p-4 sm:p-5"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          {documents.length === 0 ? (
            <div className="py-16 text-center">
              <FolderOpen className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                No documents uploaded yet
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Upload PAN, GST Certificate, Financials, or Incorporation docs in the Documents tab.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc, idx) => (
                <div
                  key={doc.id || idx}
                  className="p-3.5 rounded-xl border flex items-center justify-between gap-3 hover:border-emerald-500 transition-colors"
                  style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {doc.title || doc.name || doc.fileName || 'Client Document'}
                      </p>
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {doc.documentType || 'Statutory Document'}
                      </span>
                    </div>
                  </div>
                  {doc.filePath && (
                    <a
                      href={doc.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title="Open Document"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Modals ───────────────────────────────────────────────────────── */}
      <InvoiceViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        invoice={selectedInvoice}
        onEdit={(inv) => {
          setSelectedInvoice(inv);
          setIsFormModalOpen(true);
        }}
      />

      <InvoiceFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          if (onRefresh) onRefresh();
        }}
        invoiceToEdit={selectedInvoice}
      />
    </div>
  );
}
