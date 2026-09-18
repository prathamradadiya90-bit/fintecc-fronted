'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { useQueueInvoiceSyncMutation } from '@/lib/store/api/tallyApi';
import { useToast } from '@/components/ui/Toast';
import {
  FileCode2,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Edit2,
  Calendar,
  Building2,
  Receipt,
  UserCheck,
  Link2,
  Copy,
  Check,
  Share2,
  Repeat,
  ExternalLink,
} from 'lucide-react';
import type { Invoice } from '@/lib/types/invoice-management.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onEdit: (invoice: Invoice) => void;
}

export function InvoiceViewModal({
  isOpen,
  onClose,
  invoice,
  onEdit,
}: InvoiceViewModalProps) {
  const { showToast } = useToast();
  const [queueInvoiceSync, { isLoading: isSyncing }] = useQueueInvoiceSyncMutation();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingXml, setIsDownloadingXml] = useState(false);
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!invoice) return null;

  const handleCopyPaymentLink = () => {
    if (!invoice.paymentLinkUrl) return;
    navigator.clipboard.writeText(invoice.paymentLinkUrl);
    setCopiedLink(true);
    showToast('Payment link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!invoice.paymentLinkUrl) return;
    const clientName = invoice.client?.companyName || invoice.client?.name || 'Client';
    const text = encodeURIComponent(
      `Hello ${clientName},\n\nPlease find your payment link for Invoice ${invoice.invoiceNumber} (Amount: ₹${Number(invoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}):\n${invoice.paymentLinkUrl}\n\nThank you!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDownload = async (format: 'pdf' | 'tally-xml' | 'csv') => {
    try {
      if (format === 'pdf') setIsDownloadingPdf(true);
      if (format === 'tally-xml') setIsDownloadingXml(true);
      if (format === 'csv') setIsDownloadingCsv(true);

      const endpoint = `${API_BASE}/invoices/${invoice.id}/${format}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`Failed to download ${format}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      let extension = 'pdf';
      if (format === 'tally-xml') extension = 'xml';
      if (format === 'csv') extension = 'csv';

      a.download = `invoice_${invoice.invoiceNumber || invoice.id}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`Downloaded ${format.toUpperCase()} successfully`, 'success');
    } catch (err: any) {
      console.error(`Download error for ${format}:`, err);
      showToast(`Failed to download ${format}`, 'error');
    } finally {
      setIsDownloadingPdf(false);
      setIsDownloadingXml(false);
      setIsDownloadingCsv(false);
    }
  };

  const handleSyncToTally = async () => {
    try {
      await queueInvoiceSync(invoice.id).unwrap();
      showToast('Invoice queued for direct Tally sync!', 'success');
    } catch (err: any) {
      console.error('Tally sync queue error:', err);
      showToast(err?.data?.message || 'Failed to queue Tally sync', 'error');
    }
  };

  const lineItems = invoice.lineItems || [];
  const clientName = invoice.client?.companyName || invoice.client?.name || 'Client';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice: ${invoice.invoiceNumber}`}
      maxWidth="2xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(invoice);
              }}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncToTally}
              isLoading={isSyncing}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#00C2B3]" />}
            >
              Sync to Tally
            </Button>
            {invoice.paymentLinkUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPaymentLink}
                leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5 text-[#00C2B3]" />}
              >
                {copiedLink ? 'Link Copied' : 'Copy Payment Link'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('csv')}
              isLoading={isDownloadingCsv}
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            >
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('tally-xml')}
              isLoading={isDownloadingXml}
              leftIcon={<FileCode2 className="w-3.5 h-3.5" />}
            >
              Tally XML
            </Button>
            <Button
              size="sm"
              onClick={() => handleDownload('pdf')}
              isLoading={isDownloadingPdf}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
            >
              PDF
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Header Summary Card */}
        <div
          className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {invoice.invoiceNumber}
              </span>
              <InvoiceStatusBadge status={invoice.status} />
              {invoice.isRecurring && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Repeat className="w-2.5 h-2.5" />
                  {invoice.recurringInterval ? invoice.recurringInterval.charAt(0) + invoice.recurringInterval.slice(1).toLowerCase() : 'Recurring'}
                </span>
              )}
            </div>
            <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              <Building2 className="w-3.5 h-3.5 text-[#00C2B3]" />
              {clientName} {invoice.client?.gstin ? `(${invoice.client.gstin})` : ''}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Total Amount
            </p>
            <p className="text-xl font-bold text-[#00C2B3]">
              ₹{Number(invoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Razorpay Payment Link Banner if present */}
        {invoice.paymentLinkUrl && (
          <div
            className="p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{
              background: 'rgba(0, 194, 179, 0.05)',
              borderColor: 'rgba(0, 194, 179, 0.25)',
            }}
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00C2B3]">
                <Link2 className="w-3.5 h-3.5" />
                Razorpay Payment Link
              </div>
              <p className="text-xs font-mono truncate select-all" style={{ color: 'var(--color-text-secondary)' }}>
                {invoice.paymentLinkUrl}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPaymentLink}
                leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedLink ? 'Copied' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareWhatsApp}
                leftIcon={<Share2 className="w-3.5 h-3.5 text-emerald-500" />}
              >
                WhatsApp
              </Button>
              <a
                href={invoice.paymentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl border hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                title="Open Payment Link in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Dates & Metadata */}
        <div className={`grid grid-cols-2 ${invoice.isRecurring ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-3`}>
          <div className="p-3 rounded-lg border text-xs space-y-1" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
              <Calendar className="w-3 h-3" /> Issue Date
            </span>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : '—'}
            </p>
          </div>

          <div className="p-3 rounded-lg border text-xs space-y-1" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
              <Calendar className="w-3 h-3" /> Due Date
            </span>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : '—'}
            </p>
          </div>

          <div className="p-3 rounded-lg border text-xs space-y-1" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
              <Receipt className="w-3 h-3" /> Tax Amount
            </span>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              ₹{Number(invoice.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {invoice.isRecurring && (
            <div className="p-3 rounded-lg border text-xs space-y-1" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 text-indigo-500">
                <Repeat className="w-3 h-3" /> Next Bill
              </span>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                {invoice.nextRecurringDate ? new Date(invoice.nextRecurringDate).toLocaleDateString('en-IN') : 'Scheduled'}
              </p>
            </div>
          )}
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            Items & Breakdown
          </h4>
          
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                  <th className="px-3 py-2 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Description</th>
                  <th className="px-3 py-2 font-semibold text-center" style={{ color: 'var(--color-text-secondary)' }}>Qty</th>
                  <th className="px-3 py-2 font-semibold text-right" style={{ color: 'var(--color-text-secondary)' }}>Rate</th>
                  <th className="px-3 py-2 font-semibold text-right" style={{ color: 'var(--color-text-secondary)' }}>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {lineItems.length > 0 ? (
                  lineItems.map((item, idx) => (
                    <tr key={idx} style={{ background: 'var(--color-bg-card)' }}>
                      <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {item.description}
                      </td>
                      <td className="px-3 py-2.5 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2.5 text-right" style={{ color: 'var(--color-text-secondary)' }}>
                        ₹{Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        ₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                      Total invoice summary: ₹{Number(invoice.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
