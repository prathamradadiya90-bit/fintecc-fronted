'use client';

import React, { useState } from 'react';
import {
  FileCode2,
  FileSpreadsheet,
  FileText,
  Building2,
  AlertTriangle,
  Download,
  X,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  statementId: string;
  unapprovedCount: number;
  totalCount: number;
  companyNameDefault?: string;
  bankLedgerDefault?: string;
}

type ExportFormat = 'xml' | 'gst-json' | 'excel' | 'csv';

export function ExportModal({
  isOpen,
  onClose,
  statementId,
  unapprovedCount,
  totalCount,
  companyNameDefault = 'My Firm Client',
  bankLedgerDefault = 'Bank Account',
}: ExportModalProps) {
  const { showToast } = useToast();

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('xml');
  const [companyName, setCompanyName] = useState(companyNameDefault);
  const [bankLedger, setBankLedger] = useState(bankLedgerDefault);
  const [filingPeriod, setFilingPeriod] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    return `${mm}${yyyy}`;
  });
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const isExportBlocked = unapprovedCount > 0;

  const handleDownload = async () => {
    if (isExportBlocked) {
      showToast(`Cannot export: ${unapprovedCount} transactions are still pending CA approval.`, 'error');
      return;
    }

    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      params.append('format', selectedFormat);

      if (selectedFormat === 'xml') {
        params.append('companyName', companyName.trim() || 'Company');
        params.append('bankLedger', bankLedger.trim() || 'Bank Account');
      } else if (selectedFormat === 'gst-json') {
        params.append('fp', filingPeriod.trim() || '042024');
      }

      const response = await fetch(`${API_BASE}/bank-statements/${statementId}/export?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        throw new Error(errorJson?.message || `Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      let filename = `statement_${statementId}`;
      if (selectedFormat === 'xml') filename += `_tally.xml`;
      else if (selectedFormat === 'gst-json') filename += `_gstr1_${filingPeriod}.json`;
      else if (selectedFormat === 'excel') filename += `.xlsx`;
      else filename += `.csv`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`Exported ${selectedFormat.toUpperCase()} successfully!`, 'success');
      onClose();
    } catch (err: any) {
      console.error('Export error:', err);
      showToast(err.message || 'Failed to generate export file', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl p-6 relative space-y-5 animate-scaleUp"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#00C2B3]/10 text-[#00C2B3]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                Export Validated Statement
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Generate accounting vouchers & GST JSON payloads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Approved-Only Guard Alert */}
        {isExportBlocked ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Strict Approval Guard Active</span>
            </div>
            <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
              <strong>{unapprovedCount} of {totalCount}</strong> transactions are still pending review. The backend export engine requires 100% of transactions to be explicitly <strong>APPROVED</strong> before generating export files.
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              Tip: Close this modal and click <em>"Approve All Pending"</em> on the review toolbar to clear this guard.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>All {totalCount} transactions are APPROVED. Export verified!</span>
          </div>
        )}

        {/* Format Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Choose Export Engine Format
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedFormat('xml')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                selectedFormat === 'xml'
                  ? 'border-[#00C2B3] bg-[#00C2B3]/10 ring-1 ring-[#00C2B3]'
                  : 'border-[var(--color-border)] hover:bg-slate-500/5'
              }`}
            >
              <FileCode2 className={`w-4 h-4 mt-0.5 ${selectedFormat === 'xml' ? 'text-[#00C2B3]' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Tally Prime XML
                </div>
                <div className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                  Standard vouchers XML
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('gst-json')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                selectedFormat === 'gst-json'
                  ? 'border-[#00C2B3] bg-[#00C2B3]/10 ring-1 ring-[#00C2B3]'
                  : 'border-[var(--color-border)] hover:bg-slate-500/5'
              }`}
            >
              <Building2 className={`w-4 h-4 mt-0.5 ${selectedFormat === 'gst-json' ? 'text-[#00C2B3]' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  GST Offline JSON
                </div>
                <div className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                  GSTR-1 compatible
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('excel')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                selectedFormat === 'excel'
                  ? 'border-[#00C2B3] bg-[#00C2B3]/10 ring-1 ring-[#00C2B3]'
                  : 'border-[var(--color-border)] hover:bg-slate-500/5'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 mt-0.5 ${selectedFormat === 'excel' ? 'text-[#00C2B3]' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Excel Sheet (.xlsx)
                </div>
                <div className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                  Audited & color-styled
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('csv')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                selectedFormat === 'csv'
                  ? 'border-[#00C2B3] bg-[#00C2B3]/10 ring-1 ring-[#00C2B3]'
                  : 'border-[var(--color-border)] hover:bg-slate-500/5'
              }`}
            >
              <FileText className={`w-4 h-4 mt-0.5 ${selectedFormat === 'csv' ? 'text-[#00C2B3]' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Clean CSV
                </div>
                <div className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                  Universal comma-separated
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Config Fields based on selected format */}
        {selectedFormat === 'xml' && (
          <div className="space-y-3 p-3.5 rounded-xl border" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#00C2B3]">
              Tally XML Configurations
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Tally Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp Pvt Ltd"
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Bank Ledger in Tally
                </label>
                <input
                  type="text"
                  value={bankLedger}
                  onChange={(e) => setBankLedger(e.target.value)}
                  placeholder="e.g. HDFC Current A/c"
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
                />
              </div>
            </div>
          </div>
        )}

        {selectedFormat === 'gst-json' && (
          <div className="space-y-3 p-3.5 rounded-xl border" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#00C2B3]">
              GST Return Filing Period (fp)
            </div>
            <div>
              <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Filing Period (MMYYYY)
              </label>
              <input
                type="text"
                value={filingPeriod}
                onChange={(e) => setFilingPeriod(e.target.value)}
                placeholder="e.g. 042024 for April 2024"
                className="w-full text-xs px-3 py-2 rounded-lg border bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
              />
              <p className="text-[10px] mt-1 text-slate-400">
                Format required by GST Offline Tool (e.g. 042024 for April 2024, 052024 for May 2024).
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="ghost" onClick={onClose} size="sm" className="text-xs">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            isLoading={isExporting}
            disabled={isExportBlocked}
            leftIcon={<Download className="w-4 h-4" />}
            className="text-xs"
          >
            Download {selectedFormat.toUpperCase()}
          </Button>
        </div>
      </div>
    </div>
  );
}
