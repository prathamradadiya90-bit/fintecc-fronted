'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Receipt,
  FileText,
  FileCode2,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useGetInvoicesQuery } from '@/lib/store/api/invoicesApi';
import { useQueueInvoiceSyncMutation } from '@/lib/store/api/tallyApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge';
import { InvoiceFormModal } from '@/features/invoices/components/InvoiceFormModal';
import { DeleteInvoiceModal } from '@/features/invoices/components/DeleteInvoiceModal';
import { InvoiceViewModal } from '@/features/invoices/components/InvoiceViewModal';
import type { Invoice, InvoiceStatus } from '@/lib/types/invoice-management.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function InvoicesPage() {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // RTK Query
  const { data: response, isLoading, isFetching } = useGetInvoicesQuery({
    page: currentPage,
    limit: 15,
  });

  const [queueInvoiceSync, { isLoading: isSyncing }] = useQueueInvoiceSyncMutation();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const invoices = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, limit: 15, totalPages: 1 };

  // Filtered invoices by search and status locally if needed
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        !searchTerm.trim() ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        selectedStatus === 'ALL' || inv.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, selectedStatus]);

  // Metric stats
  const stats = useMemo(() => {
    const totalCount = meta.total || invoices.length;
    const totalValue = invoices.reduce((acc, inv) => acc + (Number(inv.totalAmount) || 0), 0);
    const paidValue = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((acc, inv) => acc + (Number(inv.totalAmount) || 0), 0);
    const pendingCount = invoices.filter(
      (inv) => inv.status === 'PENDING' || inv.status === 'PENDING_REVIEW' || inv.status === 'OVERDUE'
    ).length;

    return { totalCount, totalValue, paidValue, pendingCount };
  }, [invoices, meta.total]);

  // Handlers
  const handleQuickSync = async (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    try {
      setSyncingId(invoice.id);
      await queueInvoiceSync(invoice.id).unwrap();
      showToast(`Invoice ${invoice.invoiceNumber} queued for Tally sync!`, 'success');
    } catch (err: any) {
      console.error('Tally quick sync error:', err);
      showToast(err?.data?.message || 'Failed to queue Tally sync', 'error');
    } finally {
      setSyncingId(null);
    }
  };

  const handleQuickDownload = async (
    e: React.MouseEvent,
    invoice: Invoice,
    format: 'pdf' | 'tally-xml'
  ) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_BASE}/invoices/${invoice.id}/${format}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Download failed`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoice.invoiceNumber || invoice.id}.${format === 'tally-xml' ? 'xml' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(`Downloaded ${format.toUpperCase()}`, 'success');
    } catch (err) {
      console.error('Download error:', err);
      showToast(`Failed to download ${format.toUpperCase()}`, 'error');
    }
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-[#00C2B3]">
            {inv.invoiceNumber}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {inv.date ? new Date(inv.date).toLocaleDateString('en-IN') : '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client / Company',
      render: (inv) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {inv.client?.companyName || inv.client?.name || '—'}
          </span>
          {inv.client?.gstin && (
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              GSTIN: {inv.client.gstin}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv) => (
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (inv) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
            ₹{Number(inv.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            Tax: ₹{Number(inv.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv) => <InvoiceStatusBadge status={inv.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (inv) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* View Details */}
          <button
            onClick={() => {
              setSelectedInvoice(inv);
              setIsViewModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Quick PDF */}
          <button
            onClick={(e) => handleQuickDownload(e, inv, 'pdf')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Download PDF"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Quick Tally Sync */}
          <button
            onClick={(e) => handleQuickSync(e, inv)}
            disabled={syncingId === inv.id}
            className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors disabled:opacity-50"
            title="Direct Sync to Tally"
          >
            <RefreshCw className={`w-4 h-4 ${syncingId === inv.id ? 'animate-spin' : ''}`} />
          </button>

          {/* Edit */}
          <button
            onClick={() => {
              setSelectedInvoice(inv);
              setIsFormModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Invoice"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              setSelectedInvoice(inv);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Invoice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
            Invoice Management
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Create, track, and export firm invoices with instant 1-click Tally Prime sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setSelectedInvoice(null);
              setIsFormModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="rounded-2xl p-4 shadow-sm space-y-1.5"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Total Invoices
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {stats.totalCount}
          </p>
        </div>

        <div
          className="rounded-2xl p-4 shadow-sm space-y-1.5"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Total Billed
            </span>
            <div className="p-2 rounded-xl bg-[#00C2B3]/10 text-[#00C2B3]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#00C2B3]">
            ₹{stats.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div
          className="rounded-2xl p-4 shadow-sm space-y-1.5"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Paid Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{stats.paidValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div
          className="rounded-2xl p-4 shadow-sm space-y-1.5"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Pending Invoices
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pendingCount}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search invoice # or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-48 h-10 px-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-subtle)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="PENDING_REVIEW">Under Review</option>
            <option value="SENT">Sent</option>
            <option value="DRAFT">Draft</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <Table
          data={filteredInvoices}
          columns={columns}
          keyExtractor={(inv) => inv.id}
          isLoading={isLoading}
          emptyMessage={
            searchTerm || selectedStatus !== 'ALL'
              ? 'No invoices match your filters.'
              : 'No invoices created yet. Click "Create Invoice" to start.'
          }
          onRowClick={(inv) => {
            setSelectedInvoice(inv);
            setIsViewModalOpen(true);
          }}
        />

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center pt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              pageSize={meta.limit}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <InvoiceFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoiceToEdit={selectedInvoice}
      />

      <DeleteInvoiceModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />

      <InvoiceViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onEdit={(inv) => {
          setSelectedInvoice(inv);
          setIsFormModalOpen(true);
        }}
      />
    </div>
  );
}
