'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import {
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
} from '@/lib/store/api/invoicesApi';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2, Calculator, Receipt } from 'lucide-react';
import type { Invoice, InvoiceLineItem, InvoiceStatus } from '@/lib/types/invoice-management.types';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceToEdit?: Invoice | null;
}

export function InvoiceFormModal({
  isOpen,
  onClose,
  invoiceToEdit,
}: InvoiceFormModalProps) {
  const { showToast } = useToast();
  const { data: clientsData, isLoading: isClientsLoading } = useGetClientsQuery({ limit: 100 });
  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();

  const isEditing = !!invoiceToEdit;

  // Form State
  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<InvoiceStatus>('DRAFT');
  const [taxRatePercent, setTaxRatePercent] = useState<number>(18);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, amount: 0 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or Populate form on open/edit change
  useEffect(() => {
    if (invoiceToEdit) {
      setClientId(invoiceToEdit.clientId || '');
      setInvoiceNumber(invoiceToEdit.invoiceNumber || '');
      setDate(
        invoiceToEdit.date
          ? new Date(invoiceToEdit.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setDueDate(
        invoiceToEdit.dueDate
          ? new Date(invoiceToEdit.dueDate).toISOString().split('T')[0]
          : ''
      );
      setStatus(invoiceToEdit.status || 'DRAFT');
      
      const items = invoiceToEdit.lineItems && invoiceToEdit.lineItems.length > 0
        ? invoiceToEdit.lineItems
        : [{ description: 'Professional Services', quantity: 1, unitPrice: Number(invoiceToEdit.totalAmount) || 0, amount: Number(invoiceToEdit.totalAmount) || 0 }];
      
      setLineItems(items);
      
      // Infer tax rate if available
      if (invoiceToEdit.totalAmount && invoiceToEdit.taxAmount) {
        const sub = Number(invoiceToEdit.totalAmount) - Number(invoiceToEdit.taxAmount);
        if (sub > 0) {
          setTaxRatePercent(Math.round((Number(invoiceToEdit.taxAmount) / sub) * 100));
        }
      }
    } else {
      setClientId('');
      setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
      setDate(new Date().toISOString().split('T')[0]);
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split('T')[0]);
      setStatus('DRAFT');
      setTaxRatePercent(18);
      setLineItems([{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
    }
    setErrors({});
  }, [invoiceToEdit, isOpen]);

  // Client dropdown options
  const clientOptions: SearchableOption[] = (clientsData?.data || []).map((client) => ({
    value: client.id,
    label: client.companyName || client.name,
    sublabel: client.name !== client.companyName ? client.name : undefined,
    badge: client.gstin || client.pan,
  }));

  // Calculations
  const subTotal = lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const taxAmount = Number(((subTotal * (taxRatePercent || 0)) / 100).toFixed(2));
  const totalAmount = Number((subTotal + taxAmount).toFixed(2));

  // Line item handlers
  const handleItemChange = (
    index: number,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    const updated = [...lineItems];
    const current = { ...updated[index] };

    if (field === 'description') {
      current.description = String(value);
    } else if (field === 'quantity') {
      current.quantity = Number(value) || 0;
      current.amount = Number((current.quantity * current.unitPrice).toFixed(2));
    } else if (field === 'unitPrice') {
      current.unitPrice = Number(value) || 0;
      current.amount = Number((current.quantity * current.unitPrice).toFixed(2));
    }

    updated[index] = current;
    setLineItems(updated);
  };

  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      { description: '', quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!clientId) errs.clientId = 'Please select a client';
    if (!invoiceNumber.trim()) errs.invoiceNumber = 'Invoice number is required';
    if (!date) errs.date = 'Invoice date is required';
    if (!dueDate) errs.dueDate = 'Due date is required';

    const hasEmptyDesc = lineItems.some((item) => !item.description.trim());
    if (hasEmptyDesc) errs.lineItems = 'All items must have a description';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        clientId,
        invoiceNumber: invoiceNumber.trim(),
        date: new Date(date).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        status,
        totalAmount,
        taxAmount,
        lineItems,
      };

      if (isEditing && invoiceToEdit) {
        await updateInvoice({ id: invoiceToEdit.id, data: payload }).unwrap();
        showToast('Invoice updated successfully', 'success');
      } else {
        await createInvoice(payload).unwrap();
        showToast('Invoice created successfully', 'success');
      }
      onClose();
    } catch (error: any) {
      console.error('Save invoice error:', error);
      showToast(error?.data?.message || 'Failed to save invoice', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Invoice (${invoiceToEdit.invoiceNumber})` : 'Create New Invoice'}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="invoice-form"
            isLoading={isCreating || isUpdating}
            leftIcon={<Receipt className="w-4 h-4" />}
          >
            {isEditing ? 'Save Changes' : 'Create Invoice'}
          </Button>
        </div>
      }
    >
      <form id="invoice-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Client and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SearchableSelect
              label="Select Client *"
              placeholder="Search client by name / GSTIN..."
              options={clientOptions}
              value={clientId}
              onChange={(val) => {
                setClientId(val);
                if (errors.clientId) setErrors((prev) => ({ ...prev, clientId: '' }));
              }}
              error={errors.clientId}
              isLoading={isClientsLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              className="w-full h-10 px-3 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Row 2: Invoice #, Date, Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Invoice Number *"
            placeholder="INV-001"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            error={errors.invoiceNumber}
          />
          <Input
            type="date"
            label="Issue Date *"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />
          <Input
            type="date"
            label="Due Date *"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            error={errors.dueDate}
          />
        </div>

        {/* Line Items Section */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Line Items & Services
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Item
            </Button>
          </div>

          {errors.lineItems && (
            <p className="text-xs text-rose-500">{errors.lineItems}</p>
          )}

          <div className="space-y-2.5">
            {lineItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-center rounded-lg p-2.5"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
              >
                <div className="col-span-12 sm:col-span-5">
                  <input
                    type="text"
                    placeholder="Description (e.g. Audit Consultation)"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-[#00C2B3]"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity || ''}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#00C2B3]"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Rate (₹)"
                    value={item.unitPrice || ''}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#00C2B3]"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>
                <div className="col-span-3 sm:col-span-2 text-right">
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="col-span-1 sm:col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={lineItems.length === 1}
                    className="p-1 rounded text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tax & Total Summary */}
          <div className="pt-3 border-t flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                GST / Tax Rate:
              </label>
              <select
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(Number(e.target.value))}
                className="px-2 py-1 rounded-md border text-xs font-medium"
                style={{
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={18}>18% GST (Standard)</option>
                <option value={28}>28% GST</option>
              </select>
            </div>

            <div className="w-full sm:w-64 space-y-1">
              <div className="flex justify-between" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Subtotal:</span>
                <span>₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Tax ({taxRatePercent}%):</span>
                <span>₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-1 border-t font-bold text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                <span>Total:</span>
                <span className="text-[#00C2B3]">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
