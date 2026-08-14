'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, Plus, Search, Calendar, User } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGetReturnsQuery } from '@/lib/store/api/gstApi';
import { ReturnStatusBadge } from '@/features/gst/components/ReturnStatusBadge';
import { CreateReturnModal } from '@/features/gst/components/CreateReturnModal';
import type { GstReturn } from '@/lib/types/gst.types';

export default function GstReturnsPage() {
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: returnsData, isLoading } = useGetReturnsQuery();
  const returns = returnsData?.data || [];

  const filteredReturns = returns.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || r.returnType === typeFilter;
    
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      r.period.toLowerCase().includes(query) ||
      r.returnType.toLowerCase().includes(query) ||
      (r.arn && r.arn.toLowerCase().includes(query)) ||
      (r.gstProfile?.gstin && r.gstProfile.gstin.toLowerCase().includes(query)) ||
      (r.gstProfile?.legalName && r.gstProfile.legalName.toLowerCase().includes(query));

    return matchesStatus && matchesType && matchesSearch;
  });

  const columns: Column<GstReturn>[] = [
    {
      key: 'returnType',
      header: 'Return Type',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            {item.returnType}
          </span>
        </div>
      ),
    },
    {
      key: 'gstProfile',
      header: 'GSTIN & Entity',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-xs" style={{ color: 'var(--color-text-heading)' }}>
            {item.gstProfile?.gstin || 'GSTIN N/A'}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
            {item.gstProfile?.legalName || 'Unlinked Profile'}
          </span>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Period',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          <Calendar className="w-3.5 h-3.5 text-[#00C2B3]" />
          <span>{item.period}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Filing Status',
      render: (item) => <ReturnStatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'taxPayable',
      header: 'Tax / ITC',
      render: (item) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Tax: ₹{Number(item.taxPayable || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            ITC: ₹{Number(item.itcClaimed || 0).toLocaleString('en-IN')}
          </span>
        </div>
      ),
    },
    {
      key: 'arn',
      header: 'ARN / Filing Method',
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {item.arn || '—'}
          </span>
          {item.filedVia && (
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              Via {item.filedVia}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
            <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            GSTR-1 & GSTR-3B Returns Directory
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Compute tax liability, reconcile ITC, submit for client approval, and file returns.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Return Draft
        </Button>
      </div>

      {/* Main Table Card */}
      <div
        className="p-5 rounded-2xl border space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search Period, GSTIN, Legal Name, ARN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="READY_FOR_REVIEW">Ready for Review</option>
              <option value="CLIENT_APPROVED">Client Approved</option>
              <option value="FILED">Filed</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="ALL">All Types</option>
              <option value="GSTR1">GSTR-1</option>
              <option value="GSTR3B">GSTR-3B</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <Table
          data={filteredReturns}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          onRowClick={(item) => router.push(`/dashboard/gst/returns/${item.id}`)}
          emptyMessage="No GST returns found. Click 'Create Return Draft' to create a new return."
        />
      </div>

      <CreateReturnModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
