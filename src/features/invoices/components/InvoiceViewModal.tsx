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
  Link2,
  Copy,
  Check,
  Share2,
  Repeat,
  ExternalLink,
  Truck,
  Landmark,
  ShieldCheck,
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
      `Hello ${clientName},\n\nPlease find your invoice ${invoice.invoiceNumber} (Amount: ₹${Number(invoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}):\n${invoice.paymentLinkUrl}\n\nThank you!`
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

      a.download = `invoice_${invoice.invoiceNumber || invoice.id}${format === 'tally-xml' ? '_tally' : ''}.${extension}`;
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
      title={`Tax Invoice: ${invoice.invoiceNumber}`}
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
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-emerald-500" />}
            >
              Direct Tally Sync
            </Button>
            {invoice.paymentLinkUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPaymentLink}
                leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5 text-emerald-500" />}
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
              Tally CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('tally-xml')}
              isLoading={isDownloadingXml}
              className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 font-bold"
              leftIcon={<FileCode2 className="w-3.5 h-3.5 text-emerald-500" />}
            >
              Download Tally XML
            </Button>
            <Button
              size="sm"
              onClick={() => handleDownload('pdf')}
              isLoading={isDownloadingPdf}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
            >
              PDF Invoice
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Header Summary Card */}
        <div
          className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border"
          style={{
            background: 'var(--color-bg-subtle)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {invoice.invoiceNumber}
              </span>
              <InvoiceStatusBadge status={invoice.status} />
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Tally Prime XML Compatible
              </span>
            </div>
            <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              <Building2 className="w-3.5 h-3.5 text-emerald-500" />
              {clientName} {invoice.client?.gstin ? `(GSTIN: ${invoice.client.gstin})` : ''}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              Total Invoice Amount
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{Number(invoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* ─── Buyer & Consignee Details ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Billed To / Buyer */}
          <div
            className="p-3.5 rounded-xl border space-y-1.5"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Billed To (Buyer)
            </span>
            <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {clientName}
            </p>
            {invoice.client?.gstin && (
              <p className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                GSTIN: <span className="font-semibold">{invoice.client.gstin}</span>
              </p>
            )}
            {invoice.client?.pan && (
              <p className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                PAN: <span className="font-semibold">{invoice.client.pan}</span>
              </p>
            )}
            {invoice.placeOfSupply && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Place of Supply: {invoice.placeOfSupply}
              </p>
            )}
          </div>

          {/* Shipped To / Consignee */}
          <div
            className="p-3.5 rounded-xl border space-y-1.5"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Shipped To (Consignee)
            </span>
            <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {invoice.consigneeName || clientName}
            </p>
            <p className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              GSTIN: <span className="font-semibold">{invoice.consigneeGstin || invoice.client?.gstin || 'Same as Billed'}</span>
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
              {invoice.consigneeAddress || 'Principal Place of Business'}
            </p>
            {invoice.consigneeState && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                State: {invoice.consigneeState}
              </p>
            )}
          </div>
        </div>

        {/* ─── Tally Order & Dispatch Info ────────────────────────────────── */}
        {(invoice.buyerOrderNo || invoice.dispatchDocNo || invoice.destination || invoice.motorVehicleNo) && (
          <div
            className="p-3.5 rounded-xl border space-y-2"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Truck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tally Prime Order & Dispatch Particulars</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {invoice.buyerOrderNo && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Buyer Order No.</span>
                  <p className="font-semibold">{invoice.buyerOrderNo}</p>
                </div>
              )}
              {invoice.buyerOrderDate && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Order Date</span>
                  <p className="font-semibold">{invoice.buyerOrderDate}</p>
                </div>
              )}
              {invoice.termsOfPayment && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Payment Terms</span>
                  <p className="font-semibold">{invoice.termsOfPayment}</p>
                </div>
              )}
              {invoice.dispatchDocNo && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Dispatch Doc No.</span>
                  <p className="font-semibold">{invoice.dispatchDocNo}</p>
                </div>
              )}
              {invoice.dispatchedThrough && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Dispatched Via</span>
                  <p className="font-semibold">{invoice.dispatchedThrough}</p>
                </div>
              )}
              {invoice.destination && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Destination</span>
                  <p className="font-semibold">{invoice.destination}</p>
                </div>
              )}
              {invoice.motorVehicleNo && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Vehicle No.</span>
                  <p className="font-semibold font-mono">{invoice.motorVehicleNo}</p>
                </div>
              )}
              {invoice.eWayBillNo && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">E-Way Bill #</span>
                  <p className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">{invoice.eWayBillNo}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Line Items Table ───────────────────────────────────────────── */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            Accounting & Inventory Items
          </h4>
          
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                  <th className="px-3 py-2 font-semibold">Description</th>
                  <th className="px-3 py-2 font-semibold text-center">HSN/SAC</th>
                  <th className="px-3 py-2 font-semibold text-center">Qty / UOM</th>
                  <th className="px-3 py-2 font-semibold text-right">Rate</th>
                  <th className="px-3 py-2 font-semibold text-center">GST %</th>
                  <th className="px-3 py-2 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {lineItems.length > 0 ? (
                  lineItems.map((item, idx) => (
                    <tr key={idx} style={{ background: 'var(--color-bg-card)' }}>
                      <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {item.description}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        {item.hsnSac || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-center font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.quantity} {item.uom || 'NOS'}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                        ₹{Number(item.unitPrice || item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2.5 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.gstRate ?? 18}%
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        ₹{Number(item.amount || (item.quantity * (item.unitPrice || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                      Invoice Total: ₹{Number(invoice.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Bank & Narration ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {invoice.bankName && (
            <div
              className="p-3 rounded-xl border space-y-1"
              style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-slate-500">
                <Landmark className="w-3 h-3 text-emerald-500" /> Remittance Bank Account
              </span>
              <p className="font-semibold text-xs">{invoice.bankName}</p>
              <p className="font-mono text-[11px]">A/C: {invoice.bankAccountNumber}</p>
              <p className="font-mono text-[11px]">IFSC: {invoice.bankIfsc} {invoice.bankBranch ? `(${invoice.bankBranch})` : ''}</p>
            </div>
          )}

          <div
            className="p-3 rounded-xl border space-y-1"
            style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Tally Voucher Narration
            </span>
            <p className="text-xs italic" style={{ color: 'var(--color-text-primary)' }}>
              {invoice.narration || invoice.notes || `Being invoice ${invoice.invoiceNumber} billed to ${clientName}`}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
