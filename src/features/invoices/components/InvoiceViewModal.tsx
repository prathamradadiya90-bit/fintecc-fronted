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
  Building2,
  Link2,
  Check,
  Truck,
  Landmark,
  Printer,
  LayoutTemplate,
  Receipt,
} from 'lucide-react';
import type { Invoice } from '@/lib/types/invoice-management.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function numberToWordsIndian(num: number | string | undefined | null): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Number(num);
  if (isNaN(n) || n === 0) return 'INR Zero Only';

  const parts = n.toFixed(2).split('.');
  const whole = parseInt(parts[0], 10);
  const fraction = parseInt(parts[1], 10);

  function convertTwoDigits(val: number): string {
    if (val < 20) return a[val];
    return b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : ' ');
  }

  function convertThreeDigits(val: number): string {
    let str = '';
    if (val >= 100) {
      str += a[Math.floor(val / 100)] + 'Hundred ';
      val %= 100;
    }
    if (val > 0) {
      str += convertTwoDigits(val);
    }
    return str;
  }

  let str = '';
  let crore = Math.floor(whole / 10000000);
  let rem = whole % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  let thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  let hundred = rem;

  if (crore > 0) str += convertTwoDigits(crore) + 'Crore ';
  if (lakh > 0) str += convertTwoDigits(lakh) + 'Lakh ';
  if (thousand > 0) str += convertTwoDigits(thousand) + 'Thousand ';
  if (hundred > 0) str += convertThreeDigits(hundred);

  let result = 'INR ' + str.trim();
  if (fraction > 0) {
    result += ' and ' + convertTwoDigits(fraction).trim() + ' Paise';
  }
  return result + ' Only';
}

function formatDateTally(d: any): string {
  if (!d) return '—';
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return String(d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(dateObj.getDate()).padStart(2, '0')}-${months[dateObj.getMonth()]}-${dateObj.getFullYear()}`;
}

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
  const [viewMode, setViewMode] = useState<'tally-print' | 'summary'>('tally-print');

  if (!invoice) return null;

  const handleCopyPaymentLink = () => {
    if (!invoice.paymentLinkUrl) return;
    navigator.clipboard.writeText(invoice.paymentLinkUrl);
    setCopiedLink(true);
    showToast('Payment link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
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

  const handlePrint = () => {
    window.print();
  };

  const rawLineItems = invoice.lineItems || [];
  const lineItems = rawLineItems.length > 0 ? rawLineItems : [{
    id: '1',
    description: (invoice as any).description || 'Professional Accounting & CA Services',
    hsnSac: '998313',
    quantity: 1,
    uom: 'NOS',
    unitPrice: Number(invoice.subTotal || invoice.totalAmount || 0),
    amount: Number(invoice.subTotal || invoice.totalAmount || 0),
    gstRate: invoice.taxRate || 18,
  }];

  const clientName = invoice.client?.companyName || invoice.client?.name || 'Sundry Debtor';
  const totalAmount = Number(invoice.totalAmount || (invoice as any).total || 0);
  const subTotal = Number(invoice.subTotal) || lineItems.reduce((acc, it) => acc + Number(it.amount || ((it.quantity || 1) * (it.unitPrice || 0))), 0);
  const taxAmount = Number(invoice.taxAmount) || Math.max(0, totalAmount - subTotal);
  const totalQuantity = lineItems.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);

  // Inter-State vs Intra-State Tax Detection
  const clientGstin = (invoice.client?.gstin || invoice.clientGstin || '').trim();
  const firmState = '27'; // Default Maharashtra
  const clientState = clientGstin.length >= 2 ? clientGstin.substring(0, 2) : firmState;
  const isInterState = Boolean(firmState && clientState && firmState !== clientState);

  const cgstAmount = isInterState ? 0 : taxAmount / 2;
  const sgstAmount = isInterState ? 0 : taxAmount / 2;
  const igstAmount = isInterState ? taxAmount : 0;

  return (
    <>
      {/* ─── PRINT ONLY CSS ─────────────────────────────────────────────────── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #tally-prime-print-area,
          #tally-prime-print-area * {
            visibility: visible !important;
          }
          #tally-prime-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 10px !important;
          }
        }
      `}</style>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Tax Invoice: ${invoice.invoiceNumber}`}
        maxWidth="4xl"
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
                onClick={handlePrint}
                leftIcon={<Printer className="w-3.5 h-3.5 text-blue-500" />}
              >
                Print Invoice
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
                Download Tally PDF
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                View Format:
              </span>
              <button
                type="button"
                onClick={() => setViewMode('tally-print')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'tally-print'
                    ? 'bg-[#4A6FA5] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                Tally Prime Tax Invoice (Print Format)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'summary'
                    ? 'bg-[#4A6FA5] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                Modern Summary Cards
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Tally Prime 2.0-5.0 Compatible
              </span>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* 1. TALLY PRIME EXACT TAX INVOICE PRINT LAYOUT                          */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {viewMode === 'tally-print' && (
            <div
              id="tally-prime-print-area"
              className="p-4 sm:p-6 bg-white text-slate-900 border-2 border-slate-900 text-[11px] font-sans leading-tight shadow-md select-text"
              style={{ minHeight: '680px' }}
            >
              {/* Top Title */}
              <div className="text-center border-b-2 border-slate-900 pb-1.5">
                <h1 className="text-base font-extrabold tracking-wider uppercase">TAX INVOICE</h1>
                <p className="text-[10px] text-slate-700 font-semibold tracking-wide">(ORIGINAL FOR RECIPIENT)</p>
              </div>

              {/* Top 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-b-2 border-slate-900">
                {/* Left Column: Seller & Consignee & Buyer */}
                <div className="border-b md:border-b-0 md:border-r-2 border-slate-900 p-2.5 space-y-2">
                  {/* Seller Particulars */}
                  <div>
                    <h2 className="text-sm font-black uppercase text-slate-900">
                      Apex Technologies Private Limited
                    </h2>
                    <p className="text-[11px] text-slate-800">
                      Plot No. 42, Silicon Valley Industrial Estate, Andheri East, Mumbai, Maharashtra - 400069
                    </p>
                    <p className="font-semibold text-slate-900 mt-1">
                      GSTIN/UIN: <span className="font-mono font-bold">27AABCA1234F1Z5</span>
                    </p>
                    <p className="text-slate-800">
                      State Name: Maharashtra, Code: 27
                    </p>
                    <p className="text-slate-800">
                      Contact: info@apextech.in | +91 98765 43210
                    </p>
                  </div>

                  {/* Consignee (Ship to) */}
                  <div className="border-t border-slate-400 pt-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Consignee (Ship to):
                    </p>
                    <p className="font-bold text-xs text-slate-900">
                      {invoice.consigneeName || clientName}
                    </p>
                    <p className="text-[11px] text-slate-800">
                      {invoice.consigneeAddress || (invoice.client as any)?.address?.street || 'Principal Place of Business'}
                    </p>
                    <p className="font-semibold text-slate-900">
                      GSTIN/UIN: <span className="font-mono font-bold">{invoice.consigneeGstin || clientGstin || 'Unregistered'}</span>
                    </p>
                    <p className="text-slate-800">
                      State Name: {invoice.consigneeState || 'Maharashtra'}, Code: {clientState}
                    </p>
                  </div>

                  {/* Buyer (Bill to) */}
                  <div className="border-t border-slate-400 pt-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Buyer (Bill to):
                    </p>
                    <p className="font-bold text-xs text-slate-900">{clientName}</p>
                    <p className="text-[11px] text-slate-800">
                      {(invoice.client as any)?.address?.street || (invoice.client as any)?.address || 'Registered Office Address'}
                    </p>
                    <p className="font-semibold text-slate-900">
                      GSTIN/UIN: <span className="font-mono font-bold">{clientGstin || 'Unregistered'}</span>
                    </p>
                    <p className="text-slate-800">
                      State Name: Maharashtra, Code: {clientState}
                    </p>
                    {invoice.placeOfSupply && (
                      <p className="text-slate-700">Place of Supply: {invoice.placeOfSupply}</p>
                    )}
                  </div>
                </div>

                {/* Right Column: Tally Dispatch & Order Grid */}
                <div className="divide-y divide-slate-400">
                  {/* Row 1 */}
                  <div className="grid grid-cols-2 divide-x divide-slate-400">
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Invoice No.</p>
                      <p className="font-mono font-extrabold text-xs text-slate-900">{invoice.invoiceNumber}</p>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Dated</p>
                      <p className="font-bold text-xs text-slate-900">{formatDateTally(invoice.date || (invoice as any).issueDate || (invoice as any).createdAt)}</p>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-2 divide-x divide-slate-400">
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Delivery Note</p>
                      <p className="font-semibold text-slate-900">{invoice.deliveryNote || '—'}</p>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Mode/Terms of Payment</p>
                      <p className="font-semibold text-slate-900">{invoice.termsOfPayment || 'Net 30 Days'}</p>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-2 divide-x divide-slate-400">
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Reference No. & Date</p>
                      <p className="font-semibold text-slate-900">{invoice.referenceNo || '—'}</p>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Other References</p>
                      <p className="font-semibold text-slate-900">{invoice.otherReferences || 'Tally Prime Integration'}</p>
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="grid grid-cols-2 divide-x divide-slate-400">
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Buyer&apos;s Order No.</p>
                      <p className="font-semibold text-slate-900">{invoice.buyerOrderNo || '—'}</p>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Dated</p>
                      <p className="font-semibold text-slate-900">{invoice.buyerOrderDate ? formatDateTally(invoice.buyerOrderDate) : '—'}</p>
                    </div>
                  </div>

                  {/* Row 5 */}
                  <div className="grid grid-cols-2 divide-x divide-slate-400">
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Dispatch Doc No.</p>
                      <p className="font-semibold text-slate-900">{invoice.dispatchDocNo || '—'}</p>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Delivery Note Date</p>
                      <p className="font-semibold text-slate-900">{invoice.deliveryNoteDate ? formatDateTally(invoice.deliveryNoteDate) : '—'}</p>
                    </div>
                  </div>

                  {/* Row 6 */}
                  <div className="grid grid-cols-2 divide-x divide-slate-400">
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Dispatched through</p>
                      <p className="font-semibold text-slate-900">{invoice.dispatchedThrough || invoice.carrierName || 'Road Transport'}</p>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Destination</p>
                      <p className="font-semibold text-slate-900">{invoice.destination || 'Consignee City'}</p>
                    </div>
                  </div>

                  {/* Row 7 */}
                  <div className="grid grid-cols-2 divide-x divide-slate-400">
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Bill of Lading/LR-RR No.</p>
                      <p className="font-semibold text-slate-900">{invoice.billOfLadingNo || '—'}</p>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-600">Motor Vehicle No.</p>
                      <p className="font-mono font-bold text-slate-900">
                        {invoice.motorVehicleNo || (invoice.eWayBillNo ? `EWB: ${invoice.eWayBillNo}` : '—')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-b-2 border-slate-900">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-100 font-bold text-[10px] text-slate-900">
                      <th className="p-1.5 border-r border-slate-400 text-center w-10">Sl No.</th>
                      <th className="p-1.5 border-r border-slate-400">Description of Goods</th>
                      <th className="p-1.5 border-r border-slate-400 text-center w-20">HSN/SAC</th>
                      <th className="p-1.5 border-r border-slate-400 text-center w-24">Quantity</th>
                      <th className="p-1.5 border-r border-slate-400 text-right w-24">Rate</th>
                      <th className="p-1.5 border-r border-slate-400 text-center w-14">per</th>
                      <th className="p-1.5 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {lineItems.map((item, idx) => {
                      const qty = Number(item.quantity) || 1;
                      const rate = Number(item.unitPrice ?? (item as any).rate ?? 0);
                      const amt = Number(item.amount ?? (qty * rate));
                      const uom = (item.uom || 'NOS').toUpperCase();
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-1.5 border-r border-slate-400 text-center font-medium">{idx + 1}</td>
                          <td className="p-1.5 border-r border-slate-400">
                            <span className="font-bold text-slate-900">{item.description}</span>
                          </td>
                          <td className="p-1.5 border-r border-slate-400 text-center font-mono text-[10px]">{item.hsnSac || '998313'}</td>
                          <td className="p-1.5 border-r border-slate-400 text-center font-semibold">{qty} {uom}</td>
                          <td className="p-1.5 border-r border-slate-400 text-right font-mono">{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="p-1.5 border-r border-slate-400 text-center text-slate-600">{uom}</td>
                          <td className="p-1.5 text-right font-mono font-bold">{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}

                    {/* Tax Breakdown rows inside table matching Tally Prime */}
                    {taxAmount > 0 && (
                      <>
                        {isInterState ? (
                          <tr className="bg-slate-50/50">
                            <td className="p-1.5 border-r border-slate-400"></td>
                            <td className="p-1.5 border-r border-slate-400 font-bold text-slate-900 pl-6">Output IGST @ 18%</td>
                            <td className="p-1.5 border-r border-slate-400"></td>
                            <td className="p-1.5 border-r border-slate-400"></td>
                            <td className="p-1.5 border-r border-slate-400"></td>
                            <td className="p-1.5 border-r border-slate-400"></td>
                            <td className="p-1.5 text-right font-mono font-bold">{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ) : (
                          <>
                            <tr className="bg-slate-50/50">
                              <td className="p-1.5 border-r border-slate-400"></td>
                              <td className="p-1.5 border-r border-slate-400 font-bold text-slate-900 pl-6">Output CGST @ 9%</td>
                              <td className="p-1.5 border-r border-slate-400"></td>
                              <td className="p-1.5 border-r border-slate-400"></td>
                              <td className="p-1.5 border-r border-slate-400"></td>
                              <td className="p-1.5 border-r border-slate-400"></td>
                              <td className="p-1.5 text-right font-mono font-bold">{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr className="bg-slate-50/50">
                              <td className="p-1.5 border-r border-slate-400"></td>
                              <td className="p-1.5 border-r border-slate-400 font-bold text-slate-900 pl-6">Output SGST @ 9%</td>
                              <td className="p-1.5 border-r border-slate-400"></td>
                              <td className="p-1.5 border-r border-slate-400"></td>
                              <td className="p-1.5 border-r border-slate-400"></td>
                              <td className="p-1.5 border-r border-slate-400"></td>
                              <td className="p-1.5 text-right font-mono font-bold">{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          </>
                        )}
                      </>
                    )}

                    {/* Total Row */}
                    <tr className="border-t-2 border-slate-900 bg-slate-100 font-bold">
                      <td className="p-1.5 border-r border-slate-400"></td>
                      <td className="p-1.5 border-r border-slate-400 text-right uppercase tracking-wider font-extrabold">Total</td>
                      <td className="p-1.5 border-r border-slate-400"></td>
                      <td className="p-1.5 border-r border-slate-400 text-center font-extrabold">{totalQuantity} NOS</td>
                      <td className="p-1.5 border-r border-slate-400"></td>
                      <td className="p-1.5 border-r border-slate-400"></td>
                      <td className="p-1.5 text-right font-mono font-black text-sm text-slate-900">
                        ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount Chargeable in Words */}
              <div className="border-b border-slate-900 p-2 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-600 block">Amount Chargeable (in words):</span>
                  <span className="font-extrabold text-xs text-slate-900">{numberToWordsIndian(totalAmount)}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 italic">E. &amp; O.E</span>
              </div>

              {/* HSN/SAC Tax Summary Table */}
              <div className="border-b-2 border-slate-900">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-400 bg-slate-50 font-bold">
                      <th className="p-1.5 border-r border-slate-300">HSN/SAC</th>
                      <th className="p-1.5 border-r border-slate-300 text-right">Taxable Value</th>
                      <th className="p-1.5 border-r border-slate-300 text-center">Central Tax Rate</th>
                      <th className="p-1.5 border-r border-slate-300 text-right">Central Tax Amount</th>
                      <th className="p-1.5 border-r border-slate-300 text-center">State Tax Rate</th>
                      <th className="p-1.5 border-r border-slate-300 text-right">State Tax Amount</th>
                      <th className="p-1.5 text-right">Total Tax Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1.5 border-r border-slate-300 font-mono font-bold">998313</td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 border-r border-slate-300 text-center">{isInterState ? '0%' : '9%'}</td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 border-r border-slate-300 text-center">{isInterState ? '0%' : '9%'}</td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 text-right font-mono font-bold">{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="border-t border-slate-300 font-bold bg-slate-100">
                      <td className="p-1.5 border-r border-slate-300 text-right uppercase">Total</td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 border-r border-slate-300 text-center"></td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 border-r border-slate-300 text-center"></td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 text-right font-mono font-black text-slate-900">{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tax in Words */}
              <div className="border-b border-slate-900 p-2">
                <span className="text-[9px] uppercase font-bold text-slate-600">Tax Amount (in words): </span>
                <span className="font-bold text-xs text-slate-900">{numberToWordsIndian(taxAmount)}</span>
              </div>

              {/* Bottom: Bank Remittance Details & Declaration & Signature */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b border-slate-900">
                {/* Bank Details & Declaration */}
                <div className="p-2 space-y-2">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-600">Company&apos;s Bank Details:</p>
                    <p className="font-bold text-slate-900">Bank Name: {invoice.bankName || 'HDFC Bank Limited'}</p>
                    <p className="font-mono text-slate-800">A/c No.: {invoice.bankAccountNumber || '50200012345678'}</p>
                    <p className="font-mono text-slate-800">Branch &amp; IFS Code: {invoice.bankBranch || 'Fort Mumbai'} &amp; {invoice.bankIfsc || 'HDFC0000060'}</p>
                  </div>
                  <div className="border-t border-slate-300 pt-1">
                    <p className="text-[9px] uppercase font-bold text-slate-600">Declaration:</p>
                    <p className="text-[10px] text-slate-700 italic">
                      {invoice.termsConditions || 'We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.'}
                    </p>
                  </div>
                </div>

                {/* Authorised Signatory */}
                <div className="p-2 flex flex-col justify-between text-right" style={{ minHeight: '90px' }}>
                  <p className="font-bold text-xs text-slate-900">for Apex Technologies Private Limited</p>
                  <p className="font-bold text-xs text-slate-900 border-t border-slate-400 pt-1 inline-block self-end">
                    Authorised Signatory
                  </p>
                </div>
              </div>

              {/* Computer Generated Footer */}
              <div className="text-center pt-2">
                <p className="text-[9px] text-slate-500 italic">This is a Computer Generated Invoice</p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* 2. MODERN SUMMARY VIEW                                                 */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {viewMode === 'summary' && (
            <div className="space-y-4 text-xs">
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
                  </div>
                  <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                    {clientName} {clientGstin ? `(GSTIN: ${clientGstin})` : ''}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                    Total Invoice Amount
                  </p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Buyer & Consignee Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  {clientGstin && (
                    <p className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      GSTIN: <span className="font-semibold">{clientGstin}</span>
                    </p>
                  )}
                  {invoice.placeOfSupply && (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Place of Supply: {invoice.placeOfSupply}
                    </p>
                  )}
                </div>

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
                    GSTIN: <span className="font-semibold">{invoice.consigneeGstin || clientGstin || 'Same as Billed'}</span>
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {invoice.consigneeAddress || 'Principal Place of Business'}
                  </p>
                </div>
              </div>

              {/* Tally Order & Dispatch Info */}
              {(invoice.buyerOrderNo || invoice.dispatchDocNo || invoice.destination || invoice.motorVehicleNo) && (
                <div
                  className="p-3.5 rounded-xl border space-y-2"
                  style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Truck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Tally Prime Order &amp; Dispatch Particulars</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {invoice.buyerOrderNo && (
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Buyer Order No.</span>
                        <p className="font-semibold">{invoice.buyerOrderNo}</p>
                      </div>
                    )}
                    {invoice.termsOfPayment && (
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Payment Terms</span>
                        <p className="font-semibold">{invoice.termsOfPayment}</p>
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
                  </div>
                </div>
              )}

              {/* Line Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Accounting &amp; Inventory Items
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
                      {lineItems.map((item, idx) => (
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
                            ₹{Number(item.unitPrice || (item as any).rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2.5 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                            {item.gstRate ?? 18}%
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            ₹{Number(item.amount || (item.quantity * (item.unitPrice || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bank & Narration */}
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
          )}
        </div>
      </Modal>
    </>
  );
}
