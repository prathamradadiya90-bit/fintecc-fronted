'use client';

import React from 'react';
import { X, ShieldCheck, Building2, Calendar, FileText, IndianRupee, Copy, Printer, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UdinStatusBadge } from './UdinStatusBadge';
import { useToast } from '@/components/ui/Toast';
import type { UdinRecord } from '@/lib/types/udin.types';

interface UdinViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  udin: UdinRecord | null;
  onRevoke?: (udin: UdinRecord) => void;
}

export function UdinViewModal({ isOpen, onClose, udin, onRevoke }: UdinViewModalProps) {
  const { showToast } = useToast();

  if (!isOpen || !udin) return null;

  const handleCopyUdin = () => {
    navigator.clipboard.writeText(udin.udinNumber);
    showToast('UDIN copied to clipboard', 'info');
  };

  const figures = udin.figures || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-xl rounded-2xl border shadow-xl my-8 overflow-hidden transition-all"
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
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                  UDIN Register Record
                </h2>
                <UdinStatusBadge status={udin.status} />
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Official ICAI certification record details
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
          {/* Main UDIN Callout Banner */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between gap-3"
            style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
          >
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                Unique Document Identification Number
              </span>
              <div className="font-mono text-base font-bold text-[#4A6FA5] tracking-wide">
                {udin.udinNumber}
              </div>
            </div>
            <button
              onClick={handleCopyUdin}
              className="p-2 rounded-lg border text-slate-600 hover:text-[#4A6FA5] hover:bg-white dark:hover:bg-slate-800 transition-colors"
              title="Copy UDIN"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Revocation Alert if Revoked */}
          {udin.status === 'REVOKED' && (
            <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-50 dark:bg-rose-950/20 text-xs space-y-1">
              <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Revocation Notice
              </span>
              <p className="text-rose-700 dark:text-rose-300">
                Reason: {udin.revocationReason || 'No reason specified'}
              </p>
              {udin.revokedAt && (
                <p className="text-[11px] text-rose-600/80">
                  Revoked on: {new Date(udin.revokedAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          )}

          {/* Information Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block font-medium mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Document / Certificate Type
              </span>
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)' }}>
                {udin.documentType}
              </span>
            </div>

            <div>
              <span className="block font-medium mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Financial Year
              </span>
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)' }}>
                {udin.financialYear || '—'}
              </span>
            </div>

            <div>
              <span className="block font-medium mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Date of Generation
              </span>
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {udin.dateOfGeneration ? new Date(udin.dateOfGeneration).toLocaleDateString('en-IN') : '—'}
              </span>
            </div>

            <div>
              <span className="block font-medium mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Associated Client
              </span>
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {udin.client?.companyName || udin.client?.name || 'Independent / Not Linked'}
              </span>
            </div>
          </div>

          {/* Disclosed Figures */}
          {Object.keys(figures).length > 0 && (
            <div
              className="p-3.5 rounded-xl border space-y-2"
              style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
            >
              <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--color-text-heading)' }}>
                Key Figures Disclosed on Certificate
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {figures.turnover !== undefined && (
                  <div>
                    <span className="text-slate-500 block">Turnover / Receipts</span>
                    <span className="font-bold text-sm" style={{ color: 'var(--color-text-heading)' }}>
                      ₹{Number(figures.turnover).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {figures.netProfit !== undefined && (
                  <div>
                    <span className="text-slate-500 block">Net Profit / Net Worth</span>
                    <span className="font-bold text-sm" style={{ color: 'var(--color-text-heading)' }}>
                      ₹{Number(figures.netProfit).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {udin.documentDescription && (
            <div className="text-xs space-y-1">
              <span className="font-semibold block" style={{ color: 'var(--color-text-secondary)' }}>
                Remarks / Purpose
              </span>
              <p className="p-3 rounded-xl border" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                {udin.documentDescription}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-4 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print
          </Button>

          <div className="flex items-center gap-2">
            {udin.status === 'ACTIVE' && onRevoke && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onRevoke(udin);
                }}
                className="text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
              >
                Revoke UDIN
              </Button>
            )}
            <Button size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
