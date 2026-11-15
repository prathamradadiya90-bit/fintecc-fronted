'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileSpreadsheet, Plus, Search, Calendar, X, ArrowRight } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGetReturnsQuery, useGetProfilesQuery } from '@/lib/store/api/gstApi';
import { ReturnStatusBadge } from '@/features/gst/components/ReturnStatusBadge';
import { CreateReturnModal } from '@/features/gst/components/CreateReturnModal';
import { CreateProfileModal } from '@/features/gst/components/CreateProfileModal';
import type { GstReturn } from '@/lib/types/gst.types';

function GstReturnsMainContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') || undefined;
  const profileIdParam = searchParams.get('profileId') || '';

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profileIdParam);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);

  const { data: returnsData, isLoading } = useGetReturnsQuery(
    clientId ? { clientId, limit: 100 } : { limit: 100 }
  );
  const { data: profilesData } = useGetProfilesQuery(
    clientId ? { clientId } : undefined
  );

  const returns = returnsData?.data || [];
  const profiles = profilesData?.data || [];

  const activeProfile = profiles.find((p) => p.id === selectedProfileId);

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      const matchesProfile = !selectedProfileId || r.gstProfileId === selectedProfileId;
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

      return matchesProfile && matchesStatus && matchesType && matchesSearch;
    });
  }, [returns, selectedProfileId, statusFilter, typeFilter, search]);

  const columns: Column<GstReturn>[] = [
    {
      key: 'returnType',
      header: 'Return Type',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
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
    {
      key: 'action',
      header: 'Action',
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/gst/returns/${item.id}`)}
          className="text-xs h-7 px-2.5"
          rightIcon={<ArrowRight className="w-3 h-3" />}
        >
          Open
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
              <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              GSTR-1 & GSTR-3B Returns Directory
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {filteredReturns.length} {filteredReturns.length === 1 ? 'return' : 'returns'}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Compute tax liability, reconcile ITC, submit for client approval, and file returns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {profiles.length === 0 && (
            <Button
              variant="outline"
              onClick={() => setIsCreateProfileOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-500" />}
              className="text-xs h-8 px-3"
            >
              + Onboard Client GSTIN
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs h-8 px-3"
          >
            Create Return Draft
          </Button>
        </div>
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
              className="text-xs h-8"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Filter by Profile if profiles exist */}
            {profiles.length > 0 && (
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                style={{
                  background: 'var(--color-bg-input)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="">All GSTIN Profiles</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.gstin} ({p.legalName || p.tradeName})
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="ALL">All Return Types</option>
              <option value="GSTR1">GSTR-1</option>
              <option value="GSTR3B">GSTR-3B</option>
            </select>
          </div>
        </div>

        {/* Profile Filter Pill Active Reminder */}
        {activeProfile && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
              Showing returns for {activeProfile.gstin} ({activeProfile.legalName})
            </span>
            <button
              type="button"
              onClick={() => setSelectedProfileId('')}
              className="ml-auto text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" /> Clear Filter
            </button>
          </div>
        )}

        {/* Table */}
        <Table
          data={filteredReturns}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          onRowClick={(item) => router.push(`/dashboard/gst/returns/${item.id}`)}
          emptyMessage="No GST returns found. Click 'Create Return Draft' to begin preparing a return."
        />
      </div>

      <CreateReturnModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultProfileId={selectedProfileId}
        defaultClientId={clientId}
      />

      <CreateProfileModal
        isOpen={isCreateProfileOpen}
        onClose={() => setIsCreateProfileOpen(false)}
        defaultClientId={clientId}
        onSuccess={(newProfile) => {
          if (newProfile?.id) {
            setSelectedProfileId(newProfile.id);
          }
        }}
      />
    </div>
  );
}

export default function GstReturnsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-sm text-[var(--color-text-secondary)] animate-pulse">
        Loading GST Returns Directory...
      </div>
    }>
      <GstReturnsMainContent />
    </Suspense>
  );
}
