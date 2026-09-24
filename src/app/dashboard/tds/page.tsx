'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Receipt,
  FileCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Search,
} from 'lucide-react';
import {
  useGetChallansQuery,
  useCreateChallanMutation,
  useDeleteChallanMutation,
  useGetReturnsQuery,
  useCreateReturnMutation,
  useDeleteReturnMutation,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useDeleteTransactionMutation,
  useGetNoticesQuery,
  useCreateNoticeMutation,
  useDeleteNoticeMutation,
} from '@/lib/store/api/tdsApi';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Column } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type {
  TdsChallan,
  TdsReturn,
  TdsTransaction,
  TdsNotice,
  TdsFormType,
  TdsQuarter,
  TdsNoticeType,
} from '@/lib/types/tds.types';

type TdsTab = 'challans' | 'returns' | 'transactions' | 'notices';

export default function TdsCompliancePage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TdsTab>('challans');
  const [searchTerm, setSearchTerm] = useState('');

  // Clients list for dropdowns
  const { data: clientsResponse } = useGetClientsQuery();
  const clients = clientsResponse?.data || [];

  // API Queries
  const { data: challansData, isLoading: isLoadingChallans } = useGetChallansQuery();
  const { data: returnsData, isLoading: isLoadingReturns } = useGetReturnsQuery();
  const { data: transactionsData, isLoading: isLoadingTransactions } = useGetTransactionsQuery();
  const { data: noticesData, isLoading: isLoadingNotices } = useGetNoticesQuery();

  // Mutations
  const [createChallan, { isLoading: isCreatingChallan }] = useCreateChallanMutation();
  const [deleteChallan] = useDeleteChallanMutation();

  const [createReturn, { isLoading: isCreatingReturn }] = useCreateReturnMutation();
  const [deleteReturn] = useDeleteReturnMutation();

  const [createTransaction, { isLoading: isCreatingTransaction }] = useCreateTransactionMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();

  const [createNotice, { isLoading: isCreatingNotice }] = useCreateNoticeMutation();
  const [deleteNotice] = useDeleteNoticeMutation();

  // Modal Open States
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  // Form States - Challan
  const [challanForm, setChallanForm] = useState({
    clientId: '',
    bsrCode: '',
    challanSerialNumber: '',
    tenderDate: new Date().toISOString().split('T')[0],
    taxAmount: 0,
    interestAmount: 0,
    penaltyAmount: 0,
    totalAmount: 0,
    status: 'VERIFIED' as const,
  });

  // Form States - Return
  const [returnForm, setReturnForm] = useState({
    clientId: '',
    formType: '26Q' as TdsFormType,
    financialYear: '2025-26',
    quarter: 'Q4' as TdsQuarter,
    prn: '',
    filingStatus: 'PENDING' as const,
  });

  // Form States - Transaction
  const [transactionForm, setTransactionForm] = useState({
    clientId: '',
    deducteePan: '',
    deducteeName: '',
    section: '194C',
    dateOfPayment: new Date().toISOString().split('T')[0],
    amountPaid: 0,
    rate: 1,
    tdsAmount: 0,
  });

  // Form States - Notice
  const [noticeForm, setNoticeForm] = useState({
    clientId: '',
    noticeType: 'SHORT_DEDUCTION' as TdsNoticeType,
    demandAmount: 0,
    noticeDate: new Date().toISOString().split('T')[0],
    status: 'OPEN' as const,
  });

  // Handlers - Challan
  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challanForm.clientId) {
      showToast('Please select a client', 'error');
      return;
    }
    try {
      await createChallan({
        ...challanForm,
        tenderDate: new Date(challanForm.tenderDate).toISOString(),
        totalAmount: Number(challanForm.taxAmount) + Number(challanForm.interestAmount) + Number(challanForm.penaltyAmount),
      }).unwrap();
      showToast('Challan recorded successfully!', 'success');
      setIsChallanModalOpen(false);
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to record challan', 'error');
    }
  };

  // Handlers - Return
  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnForm.clientId) {
      showToast('Please select a client', 'error');
      return;
    }
    try {
      await createReturn(returnForm).unwrap();
      showToast('TDS Return entry created!', 'success');
      setIsReturnModalOpen(false);
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to create return entry', 'error');
    }
  };

  // Handlers - Transaction
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionForm.clientId) {
      showToast('Please select a client', 'error');
      return;
    }
    try {
      const calculatedTds = (Number(transactionForm.amountPaid) * Number(transactionForm.rate)) / 100;
      await createTransaction({
        ...transactionForm,
        dateOfPayment: new Date(transactionForm.dateOfPayment).toISOString(),
        amountPaid: Number(transactionForm.amountPaid),
        rate: Number(transactionForm.rate),
        tdsAmount: transactionForm.tdsAmount || calculatedTds,
      }).unwrap();
      showToast('Deductee transaction logged!', 'success');
      setIsTransactionModalOpen(false);
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to log transaction', 'error');
    }
  };

  // Handlers - Notice
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.clientId) {
      showToast('Please select a client', 'error');
      return;
    }
    try {
      await createNotice({
        ...noticeForm,
        demandAmount: Number(noticeForm.demandAmount),
        noticeDate: new Date(noticeForm.noticeDate).toISOString(),
      }).unwrap();
      showToast('Demand notice logged successfully!', 'success');
      setIsNoticeModalOpen(false);
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to log notice', 'error');
    }
  };

  // Columns Definitions
  const challanColumns: Column<TdsChallan>[] = [
    {
      key: 'client',
      header: 'Client',
      render: (c) => <span className="font-semibold text-xs">{c.client?.name || '—'}</span>,
    },
    {
      key: 'bsrCode',
      header: 'BSR Code',
      render: (c) => <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{c.bsrCode}</span>,
    },
    {
      key: 'challanSerialNumber',
      header: 'Challan Serial No.',
      render: (c) => <span className="font-mono text-xs">{c.challanSerialNumber}</span>,
    },
    {
      key: 'tenderDate',
      header: 'Tender Date',
      render: (c) => <span className="text-xs">{new Date(c.tenderDate).toLocaleDateString('en-IN')}</span>,
    },
    {
      key: 'totalAmount',
      header: 'Deposit Amount (₹)',
      render: (c) => (
        <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
          ₹{Number(c.totalAmount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            c.status === 'VERIFIED'
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              : c.status === 'CONSUMED'
              ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
          }`}
        >
          {c.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (c) => (
        <button
          onClick={() => deleteChallan(c.id)}
          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
          title="Delete Challan"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const returnColumns: Column<TdsReturn>[] = [
    {
      key: 'client',
      header: 'Client / Deductor',
      render: (r) => <span className="font-semibold text-xs">{r.client?.name || '—'}</span>,
    },
    {
      key: 'formType',
      header: 'Form Type',
      render: (r) => (
        <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          {r.formType}
        </span>
      ),
    },
    {
      key: 'quarter',
      header: 'Quarter & FY',
      render: (r) => (
        <span className="text-xs font-medium">
          {r.quarter} ({r.financialYear})
        </span>
      ),
    },
    {
      key: 'filingStatus',
      header: 'Filing Status',
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            r.filingStatus === 'FILED' || r.filingStatus === 'PROCESSED'
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
          }`}
        >
          {r.filingStatus}
        </span>
      ),
    },
    {
      key: 'prn',
      header: 'PRN / Ack No.',
      render: (r) => (
        <span className="font-mono text-xs text-slate-500">{r.prn || 'Pending'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <button
          onClick={() => deleteReturn(r.id)}
          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
          title="Delete Return"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const transactionColumns: Column<TdsTransaction>[] = [
    {
      key: 'client',
      header: 'Deductor',
      render: (t) => <span className="font-semibold text-xs">{t.client?.name || '—'}</span>,
    },
    {
      key: 'deducteeName',
      header: 'Deductee Name',
      render: (t) => <span className="font-semibold text-xs">{t.deducteeName}</span>,
    },
    {
      key: 'deducteePan',
      header: 'PAN',
      render: (t) => <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{t.deducteePan}</span>,
    },
    {
      key: 'section',
      header: 'Section',
      render: (t) => (
        <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          Sec {t.section}
        </span>
      ),
    },
    {
      key: 'amountPaid',
      header: 'Amount Paid (₹)',
      render: (t) => <span className="text-xs">₹{Number(t.amountPaid).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'rate',
      header: 'Rate',
      render: (t) => <span className="text-xs font-semibold">{t.rate}%</span>,
    },
    {
      key: 'tdsAmount',
      header: 'TDS Deducted (₹)',
      render: (t) => (
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          ₹{Number(t.tdsAmount).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (t) => (
        <button
          onClick={() => deleteTransaction(t.id)}
          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
          title="Delete Transaction"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const noticeColumns: Column<TdsNotice>[] = [
    {
      key: 'client',
      header: 'Client / Deductor',
      render: (n) => <span className="font-semibold text-xs">{n.client?.name || '—'}</span>,
    },
    {
      key: 'noticeType',
      header: 'Notice Type',
      render: (n) => (
        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
          {n.noticeType.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'demandAmount',
      header: 'Demand Amount (₹)',
      render: (n) => (
        <span className="text-xs font-bold text-rose-600">
          ₹{Number(n.demandAmount).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'noticeDate',
      header: 'Notice Date',
      render: (n) => <span className="text-xs">{new Date(n.noticeDate).toLocaleDateString('en-IN')}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (n) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            n.status === 'CLOSED'
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
          }`}
        >
          {n.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (n) => (
        <button
          onClick={() => deleteNotice(n.id)}
          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
          title="Delete Notice"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const challansList = challansData?.data || [];
  const returnsList = returnsData?.data || [];
  const transactionsList = transactionsData?.data || [];
  const noticesList = noticesData?.data || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              TDS Compliance & TRACES Hub
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Tax Deducted at Source
            </span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Manage ITNS 281 Challans, quarterly salary (24Q) & vendor (26Q) returns, deductee PAN ledgers, and 154 demand intimations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'challans' && (
            <Button onClick={() => setIsChallanModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Record Challan
            </Button>
          )}
          {activeTab === 'returns' && (
            <Button onClick={() => setIsReturnModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Add Return
            </Button>
          )}
          {activeTab === 'transactions' && (
            <Button onClick={() => setIsTransactionModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Log Transaction
            </Button>
          )}
          {activeTab === 'notices' && (
            <Button onClick={() => setIsNoticeModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Log Demand Notice
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { id: 'challans', label: `Challans (${challansList.length})`, icon: Receipt },
          { id: 'returns', label: `Quarterly Returns (${returnsList.length})`, icon: FileCheck },
          { id: 'transactions', label: `Deductee Ledger (${transactionsList.length})`, icon: Calculator },
          { id: 'notices', label: `Demand Notices (${noticesList.length})`, icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TdsTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'challans' && (
        <Table
          data={challansList}
          columns={challanColumns}
          keyExtractor={(c) => c.id}
          isLoading={isLoadingChallans}
          emptyMessage="No ITNS 281 tax challans recorded yet. Click 'Record Challan' above to add one."
        />
      )}

      {activeTab === 'returns' && (
        <Table
          data={returnsList}
          columns={returnColumns}
          keyExtractor={(r) => r.id}
          isLoading={isLoadingReturns}
          emptyMessage="No quarterly TDS returns created yet. Click 'Add Return' to start."
        />
      )}

      {activeTab === 'transactions' && (
        <Table
          data={transactionsList}
          columns={transactionColumns}
          keyExtractor={(t) => t.id}
          isLoading={isLoadingTransactions}
          emptyMessage="No deductee transactions logged. Click 'Log Transaction' to add TDS records."
        />
      )}

      {activeTab === 'notices' && (
        <Table
          data={noticesList}
          columns={noticeColumns}
          keyExtractor={(n) => n.id}
          isLoading={isLoadingNotices}
          emptyMessage="No TRACES demand notices on file. Great job keeping filings in order!"
        />
      )}

      {/* CHALLAN MODAL */}
      <Modal
        isOpen={isChallanModalOpen}
        onClose={() => setIsChallanModalOpen(false)}
        title="Record ITNS 281 Challan"
      >
        <form onSubmit={handleCreateChallan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
              Select Client *
            </label>
            <select
              value={challanForm.clientId}
              onChange={(e) => setChallanForm({ ...challanForm, clientId: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border text-xs focus:outline-none"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              required
            >
              <option value="">-- Choose Client --</option>
              {clients.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.name} ({cl.pan || 'No PAN'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                BSR Code (7 Digits) *
              </label>
              <Input
                type="text"
                placeholder="0210001"
                maxLength={7}
                value={challanForm.bsrCode}
                onChange={(e) => setChallanForm({ ...challanForm, bsrCode: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Challan Serial Number *
              </label>
              <Input
                type="text"
                placeholder="10423"
                value={challanForm.challanSerialNumber}
                onChange={(e) => setChallanForm({ ...challanForm, challanSerialNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Tender Date *
              </label>
              <Input
                type="date"
                value={challanForm.tenderDate}
                onChange={(e) => setChallanForm({ ...challanForm, tenderDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Tax Amount (₹) *
              </label>
              <Input
                type="number"
                min="0"
                value={challanForm.taxAmount || ''}
                onChange={(e) => setChallanForm({ ...challanForm, taxAmount: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Interest (₹)
              </label>
              <Input
                type="number"
                min="0"
                value={challanForm.interestAmount || ''}
                onChange={(e) => setChallanForm({ ...challanForm, interestAmount: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Penalty (₹)
              </label>
              <Input
                type="number"
                min="0"
                value={challanForm.penaltyAmount || ''}
                onChange={(e) => setChallanForm({ ...challanForm, penaltyAmount: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsChallanModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreatingChallan}>
              Record Challan
            </Button>
          </div>
        </form>
      </Modal>

      {/* RETURN MODAL */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Create Quarterly TDS Return"
      >
        <form onSubmit={handleCreateReturn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
              Select Client *
            </label>
            <select
              value={returnForm.clientId}
              onChange={(e) => setReturnForm({ ...returnForm, clientId: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border text-xs focus:outline-none"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              required
            >
              <option value="">-- Choose Client --</option>
              {clients.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Form Type *
              </label>
              <select
                value={returnForm.formType}
                onChange={(e) => setReturnForm({ ...returnForm, formType: e.target.value as TdsFormType })}
                className="w-full h-10 px-3 rounded-xl border text-xs focus:outline-none"
                style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="26Q">26Q (Non-Salary Vendors)</option>
                <option value="24Q">24Q (Salary)</option>
                <option value="27Q">27Q (Non-Resident Payments)</option>
                <option value="27EQ">27EQ (TCS Collection)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Quarter *
              </label>
              <select
                value={returnForm.quarter}
                onChange={(e) => setReturnForm({ ...returnForm, quarter: e.target.value as TdsQuarter })}
                className="w-full h-10 px-3 rounded-xl border text-xs focus:outline-none"
                style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="Q1">Q1 (Apr - Jun)</option>
                <option value="Q2">Q2 (Jul - Sep)</option>
                <option value="Q3">Q3 (Oct - Dec)</option>
                <option value="Q4">Q4 (Jan - Mar)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Financial Year (YYYY-YY) *
              </label>
              <Input
                type="text"
                placeholder="2025-26"
                value={returnForm.financialYear}
                onChange={(e) => setReturnForm({ ...returnForm, financialYear: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                PRN / Ack Token (Optional)
              </label>
              <Input
                type="text"
                placeholder="15-digit PRN"
                value={returnForm.prn}
                onChange={(e) => setReturnForm({ ...returnForm, prn: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreatingReturn}>
              Create Return Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* TRANSACTION MODAL */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title="Log Deductee Transaction"
      >
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
              Select Client (Deductor) *
            </label>
            <select
              value={transactionForm.clientId}
              onChange={(e) => setTransactionForm({ ...transactionForm, clientId: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border text-xs focus:outline-none"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              required
            >
              <option value="">-- Choose Client --</option>
              {clients.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Deductee PAN (10 chars) *
              </label>
              <Input
                type="text"
                maxLength={10}
                placeholder="ABCDE1234F"
                value={transactionForm.deducteePan}
                onChange={(e) => setTransactionForm({ ...transactionForm, deducteePan: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Deductee Legal Name *
              </label>
              <Input
                type="text"
                placeholder="Supplier Pvt Ltd"
                value={transactionForm.deducteeName}
                onChange={(e) => setTransactionForm({ ...transactionForm, deducteeName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                TDS Section *
              </label>
              <Input
                type="text"
                placeholder="194C"
                value={transactionForm.section}
                onChange={(e) => setTransactionForm({ ...transactionForm, section: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Amount Paid (₹) *
              </label>
              <Input
                type="number"
                min="0"
                value={transactionForm.amountPaid || ''}
                onChange={(e) => setTransactionForm({ ...transactionForm, amountPaid: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Rate % *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={transactionForm.rate}
                onChange={(e) => setTransactionForm({ ...transactionForm, rate: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
              Date of Payment *
            </label>
            <Input
              type="date"
              value={transactionForm.dateOfPayment}
              onChange={(e) => setTransactionForm({ ...transactionForm, dateOfPayment: e.target.value })}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsTransactionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreatingTransaction}>
              Log Transaction
            </Button>
          </div>
        </form>
      </Modal>

      {/* NOTICE MODAL */}
      <Modal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        title="Log Demand Notice (154/200A)"
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
              Select Client *
            </label>
            <select
              value={noticeForm.clientId}
              onChange={(e) => setNoticeForm({ ...noticeForm, clientId: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border text-xs focus:outline-none"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              required
            >
              <option value="">-- Choose Client --</option>
              {clients.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Notice Type *
              </label>
              <select
                value={noticeForm.noticeType}
                onChange={(e) => setNoticeForm({ ...noticeForm, noticeType: e.target.value as TdsNoticeType })}
                className="w-full h-10 px-3 rounded-xl border text-xs focus:outline-none"
                style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="SHORT_DEDUCTION">Short Deduction</option>
                <option value="SHORT_PAYMENT">Short Payment</option>
                <option value="LATE_FILING">Late Filing Fee (234E)</option>
                <option value="LATE_PAYMENT">Late Payment Interest (201(1A))</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                Demand Amount (₹) *
              </label>
              <Input
                type="number"
                min="0"
                value={noticeForm.demandAmount || ''}
                onChange={(e) => setNoticeForm({ ...noticeForm, demandAmount: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>
              Intimation Date *
            </label>
            <Input
              type="date"
              value={noticeForm.noticeDate}
              onChange={(e) => setNoticeForm({ ...noticeForm, noticeDate: e.target.value })}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsNoticeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreatingNotice}>
              Log Demand Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
