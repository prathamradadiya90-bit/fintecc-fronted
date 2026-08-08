import React from 'react';
import { Button } from '../ui/Button';
import { FileCode2, FileSpreadsheet, Building2, User2, Receipt, Calendar, Hash, BadgeIndianRupee } from 'lucide-react';
import type { ExtractedInvoice } from '@/lib/types/invoice.types';

interface InvoicePreviewProps {
  invoice: ExtractedInvoice;
  onDownloadXml: () => void;
  onDownloadCsv: () => void;
  isDownloadingXml?: boolean;
  isDownloadingCsv?: boolean;
}

function DetailItem({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}) {
  const display = value !== null && value !== undefined && value !== '' ? String(value) : '—';
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }} title={display}>
        {display}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-[#00C2B3]/10 text-[#00C2B3] flex items-center justify-center">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  );
}

export function InvoicePreview({
  invoice,
  onDownloadXml,
  onDownloadCsv,
  isDownloadingXml,
  isDownloadingCsv,
}: InvoicePreviewProps) {
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '—';
    const symbol = invoice.currency === 'USD' ? '$' : '₹';
    return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mt-6 space-y-5"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Invoice Preview</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            AI-extracted data from your invoice PDF. Download as Tally XML or CSV.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
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

      {/* Invoice Identity */}
      <SectionCard title="Invoice Details" icon={Receipt}>
        <DetailItem label="Invoice Number" value={invoice.invoiceNumber} />
        <DetailItem label="Currency" value={invoice.currency} />
        <DetailItem label="Issue Date" value={invoice.issueDate} />
        <DetailItem label="Due Date" value={invoice.dueDate} />
      </SectionCard>

      {/* Seller & Buyer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Seller" icon={Building2}>
          <DetailItem label="Name" value={invoice.sellerName} className="col-span-2" />
          <DetailItem label="GSTIN" value={invoice.sellerGstin} className="col-span-2" />
        </SectionCard>
        <SectionCard title="Buyer" icon={User2}>
          <DetailItem label="Name" value={invoice.buyerName} className="col-span-2" />
          <DetailItem label="GSTIN" value={invoice.buyerGstin} className="col-span-2" />
        </SectionCard>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-br from-[#00C2B3]/5 to-[#00C2B3]/10 rounded-xl border border-[#00C2B3]/20 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-[#00C2B3]/20 text-[#00C2B3] flex items-center justify-center">
            <BadgeIndianRupee className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Financial Summary</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-[#00C2B3]/10">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Sub Total</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(invoice.subTotal)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#00C2B3]/10">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Tax Amount</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(invoice.taxAmount)}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Total</span>
            <span className="text-xl font-bold text-[#00C2B3]">{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 dark:bg-amber-900/20 dark:border-amber-800">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider dark:text-amber-400">Notes</span>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--color-text-on-card)' }}>{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
