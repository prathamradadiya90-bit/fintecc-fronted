'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReceiptText, Plus, Search, Calendar, Landmark, ArrowRight, ShieldCheck } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGetItrClientsQuery } from '@/lib/store/api/itrApi';
import { ItrStatusBadge } from '@/features/itr/components/ItrStatusBadge';
import { PrepareReturnModal } from '@/features/itr/components/PrepareReturnModal';
import type { ItrReturn, ItrClient } from '@/lib/types/itr.types';

export default function ItrReturnsPage() {
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [formFilter, setFormFilter] = useState<string>('ALL');
  const [ayFilter, setAyFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isPrepareModalOpen, setIsPrepareModalOpen] = useState(false);

  const { data: clientsData, isLoading: isLoadingClients } = useGetItrClientsQuery();
  const clients = clientsData?.data || [];

  // Construct client return records for overview & navigation
  // If backend creates a return, it opens /dashboard/itr/returns/[id]
  const mockReturnsList: ItrReturn[] = clients.flatMap((client) => {
    return [
      {
        id: client.id,
        firmId: client.firmId,
        clientId: client.id,
        pan: client.pan,
        assessmentYear: '2026-27',
        financialYear: '2025-26',
        itrForm: 'ITR1',
        form: 'ITR1',
        status: (client.consentStatus === 'GRANTED' ? 'VALIDATED' : 'PREPARED') as any,
        acknowledgementNumber: client.consentStatus === 'GRANTED' ? `ACK_${client.pan.slice(0, 5)}2627` : undefined,
        createdAt: client.createdAt,
        updatedAt: client.createdAt,
        client,
      },
    ];
  });

  const filteredReturns = mockReturnsList.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesForm = formFilter === 'ALL' || r.itrForm === formFilter || r.form === formFilter;
    const matchesAy = ayFilter === 'ALL' || r.assessmentYear === ayFilter;

    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      r.assessmentYear.toLowerCase().includes(query) ||
      (r.pan && r.pan.toLowerCase().includes(query)) ||
      (r.client?.name && r.client.name.toLowerCase().includes(query)) ||
      (r.acknowledgementNumber && r.acknowledgementNumber.toLowerCase().includes(query));

    return matchesStatus && matchesForm && matchesAy && matchesSearch;
  });

  const columns: Column<ItrReturn>[] = [
    {
      key: 'form',
      header: 'ITR Form',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            {item.itrForm || item.form || 'ITR-1'}
          </span>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Taxpayer & PAN',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-xs" style={{ color: 'var(--color-text-heading)' }}>
            {item.pan || item.client?.pan || 'PAN N/A'}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
            {item.client?.name || 'Taxpayer Master'}
          </span>
        </div>
      ),
    },
    {
      key: 'assessmentYear',
      header: 'Assessment Year',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          <Calendar className="w-3.5 h-3.5 text-[#00C2B3]" />
          <span>AY {item.assessmentYear}</span>
          {item.financialYear && (
            <span className="text-[10px] text-slate-400 font-normal">
              (FY {item.financialYear})
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Filing Status',
      render: (item) => <ItrStatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'acknowledgementNumber',
      header: 'Acknowledgement Number',
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {item.acknowledgementNumber || '—'}
          </span>
          {item.acknowledgementNumber && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              ITD Receipt Ready
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
          onClick={() => router.push(`/dashboard/itr/returns/${item.id}`)}
          rightIcon={<ArrowRight className="w-3 h-3" />}
        >
          Open Filing
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
            <ReceiptText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ITR-1 to ITR-7 Returns & Filings Directory
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Prepare direct tax returns, validate schema rules, submit filings online, and download ITR-V acknowledgements.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsPrepareModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Prepare Return Draft
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
              placeholder="Search PAN, Taxpayer, Ack Number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* AY Filter */}
            <select
              value={ayFilter}
              onChange={(e) => setAyFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="ALL">All AYs</option>
              <option value="2027-28">AY 2027-28</option>
              <option value="2026-27">AY 2026-27</option>
              <option value="2025-26">AY 2025-26</option>
            </select>

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
              <option value="PREPARED">Prepared / Draft</option>
              <option value="VALIDATED">Validated</option>
              <option value="FILED">Filed</option>
              <option value="E_VERIFIED">e-Verified</option>
            </select>

            {/* Form Filter */}
            <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="ALL">All Forms</option>
              <option value="ITR1">ITR-1 (Sahaj)</option>
              <option value="ITR2">ITR-2</option>
              <option value="ITR3">ITR-3</option>
              <option value="ITR4">ITR-4 (Sugam)</option>
              <option value="ITR5">ITR-5</option>
              <option value="ITR6">ITR-6</option>
              <option value="ITR7">ITR-7</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <Table
          data={filteredReturns}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={isLoadingClients}
          onRowClick={(item) => router.push(`/dashboard/itr/returns/${item.id}`)}
          emptyMessage="No ITR returns found. Click 'Prepare Return Draft' to initiate an ITR filing."
        />
      </div>

      <PrepareReturnModal
        isOpen={isPrepareModalOpen}
        onClose={() => setIsPrepareModalOpen(false)}
      />
    </div>
  );
}
