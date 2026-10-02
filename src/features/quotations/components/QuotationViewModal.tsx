'use client';

import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Receipt,
  ClipboardList,
  Building2,
  Calendar,
  Clock,
  Printer,
  Edit2,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QuotationStatusBadge } from './QuotationStatusBadge';
import {
  useConvertToInvoiceMutation,
  useConvertToTaskMutation,
} from '@/lib/store/api/quotationsApi';
import { useToast } from '@/components/ui/Toast';
import type { Quotation } from '@/lib/types/quotation.types';

interface QuotationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onEdit?: (quotation: Quotation) => void;
}

export function QuotationViewModal({
  isOpen,
  onClose,
  quotation,
  onEdit,
}: QuotationViewModalProps) {
  const { showToast } = useToast();
  const [convertToInvoice, { isLoading: isConvertingInvoice }] = useConvertToInvoiceMutation();
  const [convertToTask, { isLoading: isConvertingTask }] = useConvertToTaskMutation();

  if (!isOpen || !quotation) return null;

  const handleConvertToInvoice = async () => {
    try {
      await convertToInvoice(quotation.id).unwrap();
      showToast('Successfully converted quotation into a Draft Tax Invoice!', 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to convert to invoice', 'error');
    }
  };

  const handleConvertToTask = async () => {
    try {
      await convertToTask({ id: quotation.id }).unwrap();
      showToast('Successfully converted quotation scope into a Work Task on Work Board!', 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to convert to task', 'error');
    }
  };

  const lineItems = Array.isArray(quotation.lineItems) ? quotation.lineItems : [];

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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5]">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                  Quotation: {quotation.quotationNumber}
                </h2>
                <QuotationStatusBadge status={quotation.status} />
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Date Issued: {quotation.date ? new Date(quotation.date).toLocaleDateString('en-IN') : '—'}
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

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="p-4 rounded-xl border space-y-1.5"
              style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
            >
              <div className="text-xs font-semibold text-[#4A6FA5] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Client Information
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
                {quotation.client?.companyName || quotation.client?.name || 'Client Details'}
              </p>
              {quotation.client?.gstin && (
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  GSTIN: {quotation.client.gstin}
                </p>
              )}
              {quotation.client?.email && (
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Email: {quotation.client.email}
                </p>
              )}
            </div>

            <div
              className="p-4 rounded-xl border space-y-1.5"
              style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
            >
              <div className="text-xs font-semibold text-[#4A6FA5] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Engagement Validity
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Valid Until:{' '}
                <span className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>
                  {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-IN') : '30 Days from issue'}
                </span>
              </p>
              {quotation.linkedInvoiceId && (
                <p className="text-xs text-[#3D7A64] font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Converted to Tax Invoice
                </p>
              )}
              {quotation.linkedTaskId && (
                <p className="text-xs text-[#3D7A64] font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Converted to Task on Work Board
                </p>
              )}
            </div>
          </div>

          {/* Scope of Work */}
          {quotation.scopeOfWork && (
            <div
              className="p-4 rounded-xl border space-y-1"
              style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
            >
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-heading)' }}>
                Scope of Work & Deliverables
              </span>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {quotation.scopeOfWork}
              </p>
            </div>
          )}

          {/* Line Items Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-heading)' }}>
              Fee Breakdown & Services
            </span>
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <table className="w-full text-xs">
                <thead style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}>
                  <tr>
                    <th className="px-3.5 py-2.5 text-left font-semibold">Service Description</th>
                    <th className="px-3.5 py-2.5 text-center font-semibold w-20">Qty</th>
                    <th className="px-3.5 py-2.5 text-right font-semibold w-28">Rate</th>
                    <th className="px-3.5 py-2.5 text-right font-semibold w-32">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {lineItems.map((item, idx) => (
                    <tr key={idx} style={{ color: 'var(--color-text-primary)' }}>
                      <td className="px-3.5 py-2.5 font-medium">{item.description}</td>
                      <td className="px-3.5 py-2.5 text-center">{item.qty}</td>
                      <td className="px-3.5 py-2.5 text-right">₹{Number(item.rate).toLocaleString('en-IN')}</td>
                      <td className="px-3.5 py-2.5 text-right font-bold">₹{Number(item.amount).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3.5 py-4 text-center text-slate-400">
                        No individual line items specified.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div
              className="w-72 p-4 rounded-xl border space-y-1.5"
              style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Subtotal:</span>
                <span className="font-semibold">₹{Number(quotation.subTotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Taxes (GST):</span>
                <span className="font-semibold">₹{Number(quotation.taxAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div
                className="flex justify-between text-sm font-bold pt-2 border-t"
                style={{ color: 'var(--color-text-heading)', borderColor: 'var(--color-border)' }}
              >
                <span>Total Amount:</span>
                <span className="text-[#4A6FA5]">₹{Number(quotation.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span className="font-semibold">Notes / Payment Terms:</span> {quotation.notes}
            </div>
          )}
        </div>

        {/* Footer Actions / Conversions */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t bg-[rgba(247,249,251,0.5)] dark:bg-transparent"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(quotation);
                }}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print
            </Button>
          </div>

          {/* Conversion Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {!quotation.linkedTaskId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConvertToTask}
                isLoading={isConvertingTask}
                leftIcon={<ClipboardList className="w-3.5 h-3.5 text-[#4A6FA5]" />}
                className="text-[#4A6FA5] border-[#4A6FA5]/30 hover:bg-[#4A6FA5]/10"
              >
                Convert to Task
              </Button>
            )}

            {!quotation.linkedInvoiceId && (
              <Button
                size="sm"
                onClick={handleConvertToInvoice}
                isLoading={isConvertingInvoice}
                leftIcon={<Receipt className="w-3.5 h-3.5 text-white" />}
                className="bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white"
              >
                Convert to Tax Invoice
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
