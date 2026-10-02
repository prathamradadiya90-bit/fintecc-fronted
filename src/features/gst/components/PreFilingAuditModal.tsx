'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Filter,
  RefreshCw,
  Search,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePreFilingValidationMutation } from '@/lib/store/api/gstApi';
import type { PreFilingCheckResult } from '@/lib/types/gst.types';

interface PreFilingAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  period: string;
}

export function PreFilingAuditModal({
  isOpen,
  onClose,
  clientId,
  period,
}: PreFilingAuditModalProps) {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'ERROR' | 'WARNING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [preFilingValidation, { data: auditResponse, isLoading }] = usePreFilingValidationMutation();

  const [hasRun, setHasRun] = useState(false);

  if (!isOpen) return null;

  const handleRunAudit = async () => {
    try {
      await preFilingValidation({ clientId, period }).unwrap();
      setHasRun(true);
    } catch (err: any) {
      alert(err?.data?.message || 'Pre-filing audit check failed');
    }
  };

  const auditData = auditResponse?.data;
  const results = auditData?.results || [];

  const filteredResults = results.filter((item) => {
    const matchSeverity =
      filterSeverity === 'ALL' || item.severity === filterSeverity;
    const matchSearch =
      !searchTerm.trim() ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.invoiceRef && item.invoiceRef.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSeverity && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-3xl rounded-2xl border shadow-2xl my-8 overflow-hidden transition-all"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-[rgba(74,111,165,0.06)] via-transparent to-transparent"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                GST Pre-Filing 30-Rule Audit Engine
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Period: {period} • Pre-validates GSTIN formats, HSN consistency, duplicate invoices, and negative tax values.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {!hasRun && !auditData ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
                  Run Automated Pre-Filing Diagnostics
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Execute all 30 algorithmic tax checks across your period purchase and sales register before pushing data to the GST Portal.
                </p>
              </div>
              <Button
                onClick={handleRunAudit}
                isLoading={isLoading}
                className="bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Start Pre-Filing Audit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className="p-3.5 rounded-xl border flex items-center gap-3"
                  style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
                >
                  <div className="p-2 rounded-lg bg-[rgba(61,122,100,0.08)] text-[#3D7A64]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Checks</span>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
                      30 Automated Rules
                    </p>
                  </div>
                </div>

                <div
                  className="p-3.5 rounded-xl border flex items-center gap-3"
                  style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
                >
                  <div className="p-2 rounded-lg bg-[rgba(158,74,74,0.08)] text-[#9E4A4A]">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Critical Errors</span>
                    <p className="text-sm font-bold text-[#9E4A4A]">
                      {auditData?.errorCount || 0} (Blocks Filing)
                    </p>
                  </div>
                </div>

                <div
                  className="p-3.5 rounded-xl border flex items-center gap-3"
                  style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
                >
                  <div className="p-2 rounded-lg bg-[rgba(158,107,66,0.08)] text-[#9E6B42]">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Notices / Warnings</span>
                    <p className="text-sm font-bold text-[#9E6B42]">
                      {auditData?.warningCount || 0} Need Review
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              {auditData?.passed ? (
                <div className="p-3.5 rounded-xl border border-[rgba(61,122,100,0.25)] bg-[rgba(61,122,100,0.06)] flex items-center gap-2.5 text-xs text-[#3D7A64] font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All pre-filing checks passed! The return payload complies with GST portal validation schemas.</span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-[rgba(158,74,74,0.25)] bg-[rgba(158,74,74,0.06)] flex items-center gap-2.5 text-xs text-[#9E4A4A] font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Found {auditData?.errorCount} blocking errors and {auditData?.warningCount} warnings. Please resolve errors before filing.</span>
                </div>
              )}

              {/* Filter / Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search findings..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs focus:outline-hidden"
                    style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                  />
                </div>

                <div className="flex items-center gap-1.5 self-end">
                  <button
                    onClick={() => setFilterSeverity('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      filterSeverity === 'ALL'
                        ? 'bg-[#4A6FA5] text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    All ({results.length})
                  </button>
                  <button
                    onClick={() => setFilterSeverity('ERROR')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      filterSeverity === 'ERROR'
                        ? 'bg-[#9E4A4A] text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Errors ({auditData?.errorCount || 0})
                  </button>
                  <button
                    onClick={() => setFilterSeverity('WARNING')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      filterSeverity === 'WARNING'
                        ? 'bg-[#9E6B42] text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Warnings ({auditData?.warningCount || 0})
                  </button>
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-2">
                {filteredResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border flex items-start justify-between gap-3 text-xs"
                    style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            item.severity === 'ERROR'
                              ? 'bg-[rgba(158,74,74,0.08)] text-[#9E4A4A] border-[rgba(158,74,74,0.2)]'
                              : 'bg-[rgba(158,107,66,0.08)] text-[#9E6B42] border-[rgba(158,107,66,0.2)]'
                          }`}
                        >
                          {item.code}
                        </span>
                        {item.invoiceRef && (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Inv: {item.invoiceRef}
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--color-text-primary)' }}>{item.message}</p>
                    </div>

                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.severity === 'ERROR'
                          ? 'text-[#9E4A4A] bg-[rgba(158,74,74,0.08)]'
                          : 'text-[#9E6B42] bg-[rgba(158,107,66,0.08)]'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                ))}

                {filteredResults.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No discrepancies found for the selected filter.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-4 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {hasRun && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunAudit}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Re-run Audit
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" onClick={onClose}>
              Close Diagnostics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
