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
import {
  Plus,
  Trash2,
  Receipt,
  Repeat,
  CreditCard,
  Link2,
  Check,
  Copy,
  Truck,
  FileSpreadsheet,
  Building,
  Landmark,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Invoice, InvoiceLineItem, InvoiceStatus, RecurringInterval } from '@/lib/types/invoice-management.types';

const UOM_OPTIONS = [
  'NOS', 'PCS', 'KGS', 'MTR', 'BOX', 'PKT', 'SET', 'BAG', 'LTR', 'HRS', 'TON', 'OTH'
];

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
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [generatePaymentLink, setGeneratePaymentLink] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<RecurringInterval>('MONTHLY');

  // Tally Prime Statutory & Dispatch Details
  const [showTallyDetails, setShowTallyDetails] = useState(false);
  const [tallyTab, setTallyTab] = useState<'order-dispatch' | 'consignee' | 'bank-statutory'>('order-dispatch');
  
  const [buyerOrderNo, setBuyerOrderNo] = useState('');
  const [buyerOrderDate, setBuyerOrderDate] = useState('');
  const [termsOfPayment, setTermsOfPayment] = useState('Net 30 Days');
  const [otherReferences, setOtherReferences] = useState('');

  const [consigneeName, setConsigneeName] = useState('');
  const [consigneeAddress, setConsigneeAddress] = useState('');
  const [consigneeGstin, setConsigneeGstin] = useState('');
  const [consigneeState, setConsigneeState] = useState('');

  const [dispatchDocNo, setDispatchDocNo] = useState('');
  const [dispatchedThrough, setDispatchedThrough] = useState('');
  const [destination, setDestination] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [billOfLadingNo, setBillOfLadingNo] = useState('');
  const [billOfLadingDate, setBillOfLadingDate] = useState('');
  const [motorVehicleNo, setMotorVehicleNo] = useState('');

  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankBranch, setBankBranch] = useState('');

  const [eWayBillNo, setEWayBillNo] = useState('');
  const [eWayBillDate, setEWayBillDate] = useState('');
  const [narration, setNarration] = useState('');
  const [termsConditions, setTermsConditions] = useState('');

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      description: '',
      hsnSac: '998311',
      quantity: 1,
      uom: 'NOS',
      unitPrice: 0,
      rate: 0,
      discountPercent: 0,
      gstRate: 18,
      amount: 0,
    },
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
      setPlaceOfSupply(invoiceToEdit.placeOfSupply || '');
      setGeneratePaymentLink(false);
      setIsRecurring(Boolean(invoiceToEdit.isRecurring));
      setRecurringInterval((invoiceToEdit.recurringInterval as RecurringInterval) || 'MONTHLY');

      setBuyerOrderNo(invoiceToEdit.buyerOrderNo || '');
      setBuyerOrderDate(invoiceToEdit.buyerOrderDate || '');
      setTermsOfPayment(invoiceToEdit.termsOfPayment || 'Net 30 Days');
      setOtherReferences(invoiceToEdit.otherReferences || '');

      setConsigneeName(invoiceToEdit.consigneeName || '');
      setConsigneeAddress(invoiceToEdit.consigneeAddress || '');
      setConsigneeGstin(invoiceToEdit.consigneeGstin || '');
      setConsigneeState(invoiceToEdit.consigneeState || '');

      setDispatchDocNo(invoiceToEdit.dispatchDocNo || '');
      setDispatchedThrough(invoiceToEdit.dispatchedThrough || '');
      setDestination(invoiceToEdit.destination || '');
      setCarrierName(invoiceToEdit.carrierName || '');
      setBillOfLadingNo(invoiceToEdit.billOfLadingNo || '');
      setBillOfLadingDate(invoiceToEdit.billOfLadingDate || '');
      setMotorVehicleNo(invoiceToEdit.motorVehicleNo || '');

      setBankName(invoiceToEdit.bankName || '');
      setBankAccountNumber(invoiceToEdit.bankAccountNumber || '');
      setBankIfsc(invoiceToEdit.bankIfsc || '');
      setBankBranch(invoiceToEdit.bankBranch || '');

      setEWayBillNo(invoiceToEdit.eWayBillNo || '');
      setEWayBillDate(invoiceToEdit.eWayBillDate || '');
      setNarration(invoiceToEdit.narration || invoiceToEdit.notes || '');
      setTermsConditions(invoiceToEdit.termsConditions || '');

      const items =
        invoiceToEdit.lineItems && invoiceToEdit.lineItems.length > 0
          ? invoiceToEdit.lineItems.map((item) => ({
              ...item,
              hsnSac: item.hsnSac || '998311',
              uom: item.uom || 'NOS',
              unitPrice: Number(item.unitPrice ?? item.rate) || 0,
              rate: Number(item.rate ?? item.unitPrice) || 0,
              discountPercent: Number(item.discountPercent) || 0,
              gstRate: Number(item.gstRate ?? 18),
              amount: Number(item.amount) || Number((item.quantity || 1) * (item.unitPrice || 0)),
            }))
          : [
              {
                description: 'Professional Accounting & CA Services',
                hsnSac: '998311',
                quantity: 1,
                uom: 'NOS',
                unitPrice: Number(invoiceToEdit.totalAmount) || 0,
                rate: Number(invoiceToEdit.totalAmount) || 0,
                discountPercent: 0,
                gstRate: 18,
                amount: Number(invoiceToEdit.totalAmount) || 0,
              },
            ];

      setLineItems(items);
      setShowTallyDetails(Boolean(invoiceToEdit.buyerOrderNo || invoiceToEdit.dispatchDocNo || invoiceToEdit.consigneeName));
    } else {
      setClientId('');
      setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
      setDate(new Date().toISOString().split('T')[0]);
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split('T')[0]);
      setStatus('DRAFT');
      setPlaceOfSupply('');
      setGeneratePaymentLink(false);
      setIsRecurring(false);
      setRecurringInterval('MONTHLY');

      setBuyerOrderNo('');
      setBuyerOrderDate('');
      setTermsOfPayment('Net 30 Days');
      setOtherReferences('');
      setConsigneeName('');
      setConsigneeAddress('');
      setConsigneeGstin('');
      setConsigneeState('');
      setDispatchDocNo('');
      setDispatchedThrough('');
      setDestination('');
      setCarrierName('');
      setBillOfLadingNo('');
      setBillOfLadingDate('');
      setMotorVehicleNo('');
      setBankName('');
      setBankAccountNumber('');
      setBankIfsc('');
      setBankBranch('');
      setEWayBillNo('');
      setEWayBillDate('');
      setNarration('');
      setTermsConditions('');

      setLineItems([
        {
          description: '',
          hsnSac: '998311',
          quantity: 1,
          uom: 'NOS',
          unitPrice: 0,
          rate: 0,
          discountPercent: 0,
          gstRate: 18,
          amount: 0,
        },
      ]);
      setShowTallyDetails(false);
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
  const calculatedItems = lineItems.map((item) => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.unitPrice) || 0;
    const gross = qty * rate;
    const disc = (gross * (Number(item.discountPercent) || 0)) / 100;
    const taxable = gross - disc;
    const gstRate = Number(item.gstRate ?? 18);
    const tax = (taxable * gstRate) / 100;
    return {
      ...item,
      amount: Number(taxable.toFixed(2)),
      taxAmount: Number(tax.toFixed(2)),
      total: Number((taxable + tax).toFixed(2)),
    };
  });

  const subTotal = calculatedItems.reduce((acc, item) => acc + item.amount, 0);
  const taxAmount = Number(calculatedItems.reduce((acc, item) => acc + item.taxAmount, 0).toFixed(2));
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
    } else if (field === 'hsnSac') {
      current.hsnSac = String(value);
    } else if (field === 'uom') {
      current.uom = String(value);
    } else if (field === 'quantity') {
      current.quantity = Number(value) || 0;
      current.amount = Number(((current.quantity * (current.unitPrice || 0)) * (1 - (current.discountPercent || 0) / 100)).toFixed(2));
    } else if (field === 'unitPrice') {
      current.unitPrice = Number(value) || 0;
      current.rate = current.unitPrice;
      current.amount = Number((((current.quantity || 1) * current.unitPrice) * (1 - (current.discountPercent || 0) / 100)).toFixed(2));
    } else if (field === 'discountPercent') {
      current.discountPercent = Number(value) || 0;
      current.amount = Number((((current.quantity || 1) * (current.unitPrice || 0)) * (1 - current.discountPercent / 100)).toFixed(2));
    } else if (field === 'gstRate') {
      current.gstRate = Number(value) || 0;
    }

    updated[index] = current;
    setLineItems(updated);
  };

  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: '',
        hsnSac: '998311',
        quantity: 1,
        uom: 'NOS',
        unitPrice: 0,
        rate: 0,
        discountPercent: 0,
        gstRate: 18,
        amount: 0,
      },
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
    if (hasEmptyDesc) errs.lineItems = 'All items must have an item description';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const handleCopyExistingLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Payment link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
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
        placeOfSupply: placeOfSupply.trim() || undefined,
        totalAmount,
        subTotal,
        taxAmount,
        lineItems: calculatedItems,
        generatePaymentLink,
        isRecurring,
        recurringInterval: isRecurring ? recurringInterval : undefined,

        // Tally Prime Statutory, Order, Dispatch & Remittance fields
        buyerOrderNo: buyerOrderNo.trim() || undefined,
        buyerOrderDate: buyerOrderDate || undefined,
        termsOfPayment: termsOfPayment.trim() || undefined,
        otherReferences: otherReferences.trim() || undefined,

        consigneeName: consigneeName.trim() || undefined,
        consigneeAddress: consigneeAddress.trim() || undefined,
        consigneeGstin: consigneeGstin.trim().toUpperCase() || undefined,
        consigneeState: consigneeState.trim() || undefined,

        dispatchDocNo: dispatchDocNo.trim() || undefined,
        dispatchedThrough: dispatchedThrough.trim() || undefined,
        destination: destination.trim() || undefined,
        carrierName: carrierName.trim() || undefined,
        billOfLadingNo: billOfLadingNo.trim() || undefined,
        billOfLadingDate: billOfLadingDate || undefined,
        motorVehicleNo: motorVehicleNo.trim().toUpperCase() || undefined,

        bankName: bankName.trim() || undefined,
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        bankIfsc: bankIfsc.trim().toUpperCase() || undefined,
        bankBranch: bankBranch.trim() || undefined,

        eWayBillNo: eWayBillNo.trim() || undefined,
        eWayBillDate: eWayBillDate || undefined,
        narration: narration.trim() || undefined,
        termsConditions: termsConditions.trim() || undefined,
      };

      if (isEditing && invoiceToEdit) {
        await updateInvoice({ id: invoiceToEdit.id, data: payload }).unwrap();
        showToast('Invoice updated successfully', 'success');
      } else {
        await createInvoice(payload).unwrap();
        showToast('Tally Prime compliant Invoice created successfully', 'success');
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
      title={isEditing ? `Edit Invoice (${invoiceToEdit.invoiceNumber})` : 'Create Tally Prime Compliant Invoice'}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Tally XML & GST Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="invoice-form"
              isLoading={isCreating || isUpdating}
              leftIcon={<Receipt className="w-4 h-4" />}
            >
              {isEditing ? 'Save Changes' : 'Create & Generate Tally XML'}
            </Button>
          </div>
        </div>
      }
    >
      <form id="invoice-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Client and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
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
              Voucher Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              className="w-full h-10 px-3 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
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

        {/* Row 2: Invoice #, Date, Due Date, Place of Supply */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            label="Invoice Number *"
            placeholder="INV-001"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            error={errors.invoiceNumber}
          />
          <Input
            type="date"
            label="Invoice Date *"
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
          <Input
            label="Place of Supply (State)"
            placeholder="e.g. 27-Maharashtra"
            value={placeOfSupply}
            onChange={(e) => setPlaceOfSupply(e.target.value)}
          />
        </div>

        {/* ─── TALLY PRIME & STATUTORY ACCORDION ─────────────────────────── */}
        <div
          className="rounded-xl border overflow-hidden transition-all"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-subtle)' }}
        >
          <button
            type="button"
            onClick={() => setShowTallyDetails(!showTallyDetails)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-500/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text-heading)' }}>
                  Tally Prime Statutory & Dispatch Specifications
                </span>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  Buyer Order PO, Dispatch doc, Consignee / Ship-to, Bank remittance, E-way bill & Narration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>{showTallyDetails ? 'Hide Fields' : 'Configure Tally Fields'}</span>
              {showTallyDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showTallyDetails && (
            <div className="p-4 pt-1 space-y-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              {/* Internal tabs */}
              <div className="flex items-center gap-1 border-b pb-2" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setTallyTab('order-dispatch')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    tallyTab === 'order-dispatch'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Order & Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => setTallyTab('consignee')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    tallyTab === 'consignee'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Consignee (Ship To)
                </button>
                <button
                  type="button"
                  onClick={() => setTallyTab('bank-statutory')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    tallyTab === 'bank-statutory'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Bank & Statutory
                </button>
              </div>

              {/* Tab 1: Order & Dispatch */}
              {tallyTab === 'order-dispatch' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <Input
                    label="Buyer's Order / PO No."
                    placeholder="e.g. PO-2026-981"
                    value={buyerOrderNo}
                    onChange={(e) => setBuyerOrderNo(e.target.value)}
                  />
                  <Input
                    type="date"
                    label="Order Date"
                    value={buyerOrderDate}
                    onChange={(e) => setBuyerOrderDate(e.target.value)}
                  />
                  <Input
                    label="Terms of Payment"
                    placeholder="e.g. Net 30 Days"
                    value={termsOfPayment}
                    onChange={(e) => setTermsOfPayment(e.target.value)}
                  />
                  <Input
                    label="Dispatch Document / DC No."
                    placeholder="e.g. DC-1029"
                    value={dispatchDocNo}
                    onChange={(e) => setDispatchDocNo(e.target.value)}
                  />
                  <Input
                    label="Dispatched Through"
                    placeholder="e.g. By Road / Courier"
                    value={dispatchedThrough}
                    onChange={(e) => setDispatchedThrough(e.target.value)}
                  />
                  <Input
                    label="Destination (Place of Delivery)"
                    placeholder="e.g. Mumbai / Pune Works"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                  <Input
                    label="Carrier / Transporter Name"
                    placeholder="e.g. BlueDart / V-Trans"
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                  />
                  <Input
                    label="Bill of Lading / LR-RR No."
                    placeholder="e.g. LR-448899"
                    value={billOfLadingNo}
                    onChange={(e) => setBillOfLadingNo(e.target.value)}
                  />
                  <Input
                    label="Motor Vehicle No."
                    placeholder="e.g. MH-12-AB-1234"
                    value={motorVehicleNo}
                    onChange={(e) => setMotorVehicleNo(e.target.value)}
                  />
                </div>
              )}

              {/* Tab 2: Consignee Details */}
              {tallyTab === 'consignee' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <Input
                    label="Consignee (Ship-To) Name"
                    placeholder="Leave blank if same as Billed Client"
                    value={consigneeName}
                    onChange={(e) => setConsigneeName(e.target.value)}
                  />
                  <Input
                    label="Consignee GSTIN"
                    placeholder="15-digit GSTIN"
                    value={consigneeGstin}
                    onChange={(e) => setConsigneeGstin(e.target.value)}
                  />
                  <Input
                    label="Consignee State / State Code"
                    placeholder="e.g. Maharashtra (27)"
                    value={consigneeState}
                    onChange={(e) => setConsigneeState(e.target.value)}
                  />
                  <Input
                    label="Consignee Shipping Address"
                    placeholder="Full delivery warehouse address"
                    value={consigneeAddress}
                    onChange={(e) => setConsigneeAddress(e.target.value)}
                  />
                </div>
              )}

              {/* Tab 3: Bank & Statutory */}
              {tallyTab === 'bank-statutory' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <Input
                    label="Remittance Bank Name"
                    placeholder="e.g. HDFC Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                  <Input
                    label="Account Number"
                    placeholder="e.g. 50200012345678"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                  />
                  <Input
                    label="Bank IFSC Code"
                    placeholder="e.g. HDFC0001234"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value)}
                  />
                  <Input
                    label="Bank Branch"
                    placeholder="e.g. Fort, Mumbai"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                  />
                  <Input
                    label="E-Way Bill Number"
                    placeholder="12-digit E-Way bill"
                    value={eWayBillNo}
                    onChange={(e) => setEWayBillNo(e.target.value)}
                  />
                  <Input
                    type="date"
                    label="E-Way Bill Date"
                    value={eWayBillDate}
                    onChange={(e) => setEWayBillDate(e.target.value)}
                  />
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Tally Voucher Narration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Being sales of statutory consulting and CA services against PO #..."
                      value={narration}
                      onChange={(e) => setNarration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-xs bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
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
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                Line Items (Accounting & Stock Specifications)
              </h4>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                HSN/SAC code, quantity, Unit of Measurement (UOM), rate, discount % & GST rate
              </p>
            </div>
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
                className="grid grid-cols-12 gap-2 items-center rounded-xl p-3 border"
                style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
              >
                {/* Description */}
                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    Item / Service Description *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Statutory Audit Consulting"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    required
                  />
                </div>

                {/* HSN/SAC */}
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    HSN/SAC
                  </label>
                  <input
                    type="text"
                    placeholder="998311"
                    value={item.hsnSac || ''}
                    onChange={(e) => handleItemChange(index, 'hsnSac', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-4 sm:col-span-1">
                  <label className="block text-[10px] font-semibold mb-1 text-center" style={{ color: 'var(--color-text-muted)' }}>
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || ''}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>

                {/* UOM */}
                <div className="col-span-4 sm:col-span-1">
                  <label className="block text-[10px] font-semibold mb-1 text-center" style={{ color: 'var(--color-text-muted)' }}>
                    UOM
                  </label>
                  <select
                    value={item.uom || 'NOS'}
                    onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                    className="w-full h-8 px-1 rounded-lg border text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {UOM_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rate */}
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] font-semibold mb-1 text-right" style={{ color: 'var(--color-text-muted)' }}>
                    Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.unitPrice || ''}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>

                {/* GST % */}
                <div className="col-span-4 sm:col-span-1">
                  <label className="block text-[10px] font-semibold mb-1 text-center" style={{ color: 'var(--color-text-muted)' }}>
                    GST %
                  </label>
                  <select
                    value={item.gstRate ?? 18}
                    onChange={(e) => handleItemChange(index, 'gstRate', e.target.value)}
                    className="w-full h-8 px-1 rounded-lg border text-xs text-center font-semibold"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                {/* Action Remove */}
                <div className="col-span-4 sm:col-span-1 text-center pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={lineItems.length === 1}
                    className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
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
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                ✓ Auto-computed Tally ledger entries for Sales & Duties
              </span>
            </div>

            <div className="w-full sm:w-64 space-y-1">
              <div className="flex justify-between" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Subtotal (Taxable):</span>
                <span>₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Total GST Output:</span>
                <span>₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-1 border-t font-bold text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                <span>Invoice Total:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
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
