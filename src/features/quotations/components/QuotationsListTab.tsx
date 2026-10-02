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
  FileCheck2,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
} from 'lucide-react';
import {
  useGetQuotationsQuery,
  useDeleteQuotationMutation,
  useConvertToInvoiceMutation,
  useConvertToTaskMutation,
} from '@/lib/store/api/quotationsApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { QuotationStatusBadge } from './QuotationStatusBadge';
import { QuotationFormModal } from './QuotationFormModal';
import { QuotationViewModal } from './QuotationViewModal';
import type { Quotation, QuotationStatus } from '@/lib/types/quotation.types';

export function QuotationsListTab() {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // RTK Query
  const { data: response, isLoading, isFetching } = useGetQuotationsQuery({
    page: currentPage,
    limit: 15,
  });

  const [deleteQuotation, { isLoading: isDeleting }] = useDeleteQuotationMutation();
  const [convertToInvoice, { isLoading: isConvertingInvoice }] = useConvertToInvoiceMutation();
  const [convertToTask, { isLoading: isConvertingTask }] = useConvertToTaskMutation();

  const quotations = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, limit: 15, totalPages: 1 };

  // Filter local search and status
  const filteredQuotations = useMemo(() => {
    return quotations.filter((quo) => {
      const matchSearch =
        !searchTerm.trim() ||
        quo.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quo.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quo.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        selectedStatus === 'ALL' || quo.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [quotations, searchTerm, selectedStatus]);

  // Summary Metrics
  const stats = useMemo(() => {
    const totalCount = meta.total || quotations.length;
    const totalValue = quotations.reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0);
    const acceptedValue = quotations
      .filter((q) => q.status === 'ACCEPTED')
      .reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0);
    const pendingCount = quotations.filter(
      (q) => q.status === 'SENT' || q.status === 'DRAFT'
    ).length;

    return { totalCount, totalValue, acceptedValue, pendingCount };
  }, [quotations, meta.total]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await deleteQuotation(id).unwrap();
      showToast('Quotation deleted successfully', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete quotation', 'error');
    }
  };

  const handleQuickConvertInvoice = async (e: React.MouseEvent, quo: Quotation) => {
    e.stopPropagation();
    try {
      await convertToInvoice(quo.id).unwrap();
      showToast(`Quotation ${quo.quotationNumber} converted to Tax Invoice!`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to convert to invoice', 'error');
    }
  };

  const handleQuickConvertTask = async (e: React.MouseEvent, quo: Quotation) => {
    e.stopPropagation();
    try {
      await convertToTask({ id: quo.id }).unwrap();
      showToast(`Quotation ${quo.quotationNumber} scope converted to Work Task!`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to convert to task', 'error');
    }
  };

  const columns: Column<Quotation>[] = [
    {
      key: 'quotationNumber',
      header: 'Quotation #',
      render: (quo) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-[#4A6FA5] hover:underline cursor-pointer">
              {quo.quotationNumber}
            </span>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {quo.date ? new Date(quo.date).toLocaleDateString('en-IN') : '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client / Organization',
      render: (quo) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {quo.client?.companyName || quo.client?.name || '—'}
          </span>
          {quo.client?.gstin && (
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              GSTIN: {quo.client.gstin}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'validUntil',
      header: 'Valid Until',
      render: (quo) => (
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {quo.validUntil ? new Date(quo.validUntil).toLocaleDateString('en-IN') : '30 Days'}
        </span>
      ),
    },
    {
      key: 'scope',
      header: 'Scope / Deliverables',
      render: (quo) => (
        <span className="text-xs truncate max-w-xs block" style={{ color: 'var(--color-text-secondary)' }}>
          {quo.scopeOfWork || (quo.lineItems?.[0]?.description ? `${quo.lineItems[0].description}...` : '—')}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      render: (quo) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
            ₹{Number(quo.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            Tax: ₹{Number(quo.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (quo) => <QuotationStatusBadge status={quo.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (quo) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedQuotation(quo);
              setIsViewModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {!quo.linkedInvoiceId && (
            <button
              onClick={(e) => handleQuickConvertInvoice(e, quo)}
              className="p-1.5 rounded-lg text-[#4A6FA5] hover:bg-[#4A6FA5]/10 transition-colors"
              title="Convert to Tax Invoice"
            >
              <Receipt className="w-4 h-4" />
            </button>
          )}

          {!quo.linkedTaskId && (
            <button
              onClick={(e) => handleQuickConvertTask(e, quo)}
              className="p-1.5 rounded-lg text-[#3D7A64] hover:bg-[#3D7A64]/10 transition-colors"
              title="Convert to Work Task"
            >
              <ClipboardList className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              setSelectedQuotation(quo);
              setIsFormModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Quotation"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => handleDelete(e, quo.id)}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-2xl border flex items-center gap-3.5 transition-all"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-2.5 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5]">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Total Quotations
            </p>
            <p className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              {stats.totalCount}
            </p>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border flex items-center gap-3.5 transition-all"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-2.5 rounded-xl bg-[#3D7A64]/10 text-[#3D7A64]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Accepted Value
            </p>
            <p className="text-xl font-bold text-[#3D7A64]">
              ₹{stats.acceptedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border flex items-center gap-3.5 transition-all"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-2.5 rounded-xl bg-[#9E6B42]/10 text-[#9E6B42]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Pending Decision
            </p>
            <p className="text-xl font-bold text-[#9E6B42]">
              {stats.pendingCount}
            </p>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border flex items-center gap-3.5 transition-all"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-2.5 rounded-xl bg-[rgba(74,111,165,0.08)] text-[#4A6FA5]">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Total Quoted Value
            </p>
            <p className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              ₹{stats.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* Action / Search Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quotation or client..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 rounded-xl border text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4A6FA5]"
              style={{
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Declined</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <Button
            onClick={() => {
              setSelectedQuotation(null);
              setIsFormModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white"
          >
            Create Quotation
          </Button>
        </div>
      </div>

      {/* Quotations Table */}
      <div
        className="rounded-2xl border overflow-hidden shadow-xs"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <Table
          data={filteredQuotations}
          columns={columns}
          keyExtractor={(quo) => quo.id}
          isLoading={isLoading || isFetching}
          onRowClick={(quo) => {
            setSelectedQuotation(quo);
            setIsViewModalOpen(true);
          }}
          emptyMessage="No quotations or fee proposals found. Click 'Create Quotation' to get started."
        />

        {meta.totalPages > 1 && (
          <div className="p-4 border-t flex justify-end" style={{ borderColor: 'var(--color-border)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <QuotationFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedQuotation(null);
        }}
        quotationToEdit={selectedQuotation}
      />

      <QuotationViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedQuotation(null);
        }}
        quotation={selectedQuotation}
        onEdit={(quo) => {
          setSelectedQuotation(quo);
          setIsFormModalOpen(true);
        }}
      />
    </div>
  );
}
