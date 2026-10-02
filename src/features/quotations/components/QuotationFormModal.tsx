'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Calendar, Building2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { useCreateQuotationMutation, useUpdateQuotationMutation } from '@/lib/store/api/quotationsApi';
import { useToast } from '@/components/ui/Toast';
import type { Quotation, QuotationLineItem } from '@/lib/types/quotation.types';

interface QuotationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationToEdit?: Quotation | null;
  defaultClientId?: string;
}

export function QuotationFormModal({
  isOpen,
  onClose,
  quotationToEdit,
  defaultClientId,
}: QuotationFormModalProps) {
  const { showToast } = useToast();
  const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery({ limit: 100 });
  const [createQuotation, { isLoading: isCreating }] = useCreateQuotationMutation();
  const [updateQuotation, { isLoading: isUpdating }] = useUpdateQuotationMutation();

  const clients = clientsData?.data || [];

  const [clientId, setClientId] = useState('');
  const [quotationNumber, setQuotationNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState<number>(18);
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([
    { description: 'Professional Accounting & Advisory Services', qty: 1, rate: 10000, amount: 10000 },
  ]);

  useEffect(() => {
    if (quotationToEdit) {
      setClientId(quotationToEdit.clientId || '');
      setQuotationNumber(quotationToEdit.quotationNumber || '');
      setDate(
        quotationToEdit.date
          ? new Date(quotationToEdit.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setValidUntil(
        quotationToEdit.validUntil
          ? new Date(quotationToEdit.validUntil).toISOString().split('T')[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      );
      setScopeOfWork(quotationToEdit.scopeOfWork || '');
      setNotes(quotationToEdit.notes || '');
      if (Array.isArray(quotationToEdit.lineItems) && quotationToEdit.lineItems.length > 0) {
        setLineItems(quotationToEdit.lineItems);
      }
      const sub = Number(quotationToEdit.subTotal) || 0;
      const tax = Number(quotationToEdit.taxAmount) || 0;
      if (sub > 0) {
        setTaxRate(Math.round((tax / sub) * 100));
      }
    } else {
      setClientId(defaultClientId || '');
      setQuotationNumber(`QUO-${Date.now().toString().slice(-6)}`);
      setDate(new Date().toISOString().split('T')[0]);
      setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setScopeOfWork('');
      setNotes('');
      setTaxRate(18);
      setLineItems([{ description: 'Professional Accounting & Advisory Services', qty: 1, rate: 10000, amount: 10000 }]);
    }
  }, [quotationToEdit, defaultClientId, isOpen]);

  const handleLineItemChange = (index: number, field: keyof QuotationLineItem, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index] };

    if (field === 'qty') {
      const q = Math.max(1, Number(value) || 1);
      item.qty = q;
      item.amount = q * (item.rate || 0);
    } else if (field === 'rate') {
      const r = Math.max(0, Number(value) || 0);
      item.rate = r;
      item.amount = (item.qty || 1) * r;
    } else if (field === 'description') {
      item.description = String(value);
    }

    updated[index] = item;
    setLineItems(updated);
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', qty: 1, rate: 0, amount: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Calculations
  const subTotal = lineItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const taxAmount = Math.round(((subTotal * taxRate) / 100) * 100) / 100;
  const totalAmount = Math.round((subTotal + taxAmount) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      showToast('Please select a client', 'error');
      return;
    }

    if (lineItems.some((item) => !item.description.trim())) {
      showToast('All line items must have a description', 'error');
      return;
    }

    try {
      const payload = {
        clientId,
        quotationNumber: quotationNumber.trim() || `QUO-${Date.now().toString().slice(-6)}`,
        date: new Date(date).toISOString(),
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        scopeOfWork,
        subTotal,
        taxAmount,
        totalAmount,
        lineItems,
        notes,
      };

      if (quotationToEdit) {
        await updateQuotation({ id: quotationToEdit.id, data: payload }).unwrap();
        showToast('Quotation updated successfully', 'success');
      } else {
        await createQuotation(payload).unwrap();
        showToast('Quotation created successfully', 'success');
      }
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to save quotation', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-3xl rounded-2xl border shadow-xl my-8 overflow-hidden transition-all"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                {quotationToEdit ? 'Edit Quotation / Estimate' : 'Create New Quotation / Estimate'}
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Provide engagement scope, deliverables, and fee structure.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Client & Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Client <span className="text-rose-500">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full h-9 px-3 rounded-xl border text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4A6FA5]"
                style={{
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName ? `${c.companyName} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Quotation Number
              </label>
              <Input
                value={quotationNumber}
                onChange={(e) => setQuotationNumber(e.target.value)}
                placeholder="QUO-001"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Valid Until
              </label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          {/* Scope of Work */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Scope of Engagement & Deliverables
            </label>
            <textarea
              rows={2}
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              placeholder="e.g. Statutory audit, filing GSTR-9/9C, monthly ledger reconciliation, and tax advisory."
              className="w-full p-2.5 rounded-xl border text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4A6FA5]"
              style={{
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-heading)' }}>
                Services / Line Items
              </label>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#4A6FA5] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl border"
                  style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Item description / service"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4A6FA5]"
                      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => handleLineItemChange(idx, 'qty', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4A6FA5] text-center"
                      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      placeholder="Rate (₹)"
                      value={item.rate}
                      onChange={(e) => handleLineItemChange(idx, 'rate', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4A6FA5] text-right"
                      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                    />
                  </div>
                  <div className="w-28 text-right pr-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & GST Breakdown */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border"
            style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Applicable GST Rate:
              </label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="h-8 px-2.5 rounded-lg border text-xs font-semibold focus:outline-hidden"
                style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18% (Standard CA)</option>
                <option value={28}>28%</option>
              </select>
            </div>

            <div className="space-y-1 text-right">
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Subtotal: <span className="font-semibold text-xs">₹{subTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                GST ({taxRate}%): <span className="font-semibold text-xs">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-sm font-bold pt-1 border-t" style={{ color: 'var(--color-text-heading)', borderColor: 'var(--color-border)' }}>
                Total Estimate: ₹{totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Terms & Conditions / Payment Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 50% advance upon confirmation, balance upon filing completion."
              className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4A6FA5]"
              style={{
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <Button variant="outline" type="button" onClick={onClose} disabled={isCreating || isUpdating}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isCreating || isUpdating}
              className="bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white"
            >
              {quotationToEdit ? 'Save Changes' : 'Create Quotation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
