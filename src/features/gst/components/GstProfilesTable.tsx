'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, Edit3, Building, User, Plus, FileSpreadsheet } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { GstProfile } from '@/lib/types/gst.types';

interface GstProfilesTableProps {
  profiles: GstProfile[];
  isLoading?: boolean;
  onEdit: (profile: GstProfile) => void;
  onVerify: (profile: GstProfile) => void;
  onCreateProfile?: () => void;
}

export const GstProfilesTable: React.FC<GstProfilesTableProps> = ({
  profiles,
  isLoading = false,
  onEdit,
  onVerify,
  onCreateProfile,
}) => {
  const [search, setSearch] = useState('');
  const [regFilter, setRegFilter] = useState<string>('ALL');

  const filteredProfiles = profiles.filter((profile) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      profile.gstin.toLowerCase().includes(query) ||
      profile.legalName.toLowerCase().includes(query) ||
      (profile.tradeName && profile.tradeName.toLowerCase().includes(query)) ||
      (profile.client?.name && profile.client.name.toLowerCase().includes(query));

    const matchesReg =
      regFilter === 'ALL' || profile.registrationType === regFilter;

    return matchesSearch && matchesReg;
  });

  const columns: Column<GstProfile>[] = [
    {
      key: 'gstin',
      header: 'GSTIN',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-mono font-semibold tracking-wider text-xs sm:text-sm" style={{ color: 'var(--color-text-heading)' }}>
            {item.gstin}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            State: {item.stateCode}
          </span>
        </div>
      ),
    },
    {
      key: 'legalName',
      header: 'Legal / Trade Name',
      render: (item) => (
        <div className="flex flex-col max-w-[200px]">
          <span className="font-medium text-xs sm:text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
            {item.legalName}
          </span>
          {item.tradeName && (
            <span className="text-[11px] truncate flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
              <Building className="w-3 h-3 text-emerald-500 shrink-0" />
              {item.tradeName}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client Entity',
      render: (item) => (
        <div className="flex items-center gap-2 max-w-[160px]">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <User className="w-3 h-3" />
          </div>
          <div className="flex flex-col truncate">
            <span className="font-medium text-xs truncate" style={{ color: 'var(--color-text-primary)' }}>
              {item.client?.name || 'Unlinked'}
            </span>
            {item.client?.companyName && (
              <span className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                {item.client.companyName}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'registrationType',
      header: 'Type & Filing',
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
              item.registrationType === 'REGULAR'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
            }`}
          >
            {item.registrationType}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
            {item.filingFrequency}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href={`/dashboard/gst/returns?profileId=${item.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            <FileSpreadsheet className="w-3 h-3" />
            File
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVerify(item)}
            leftIcon={<ShieldCheck className="w-3 h-3 text-emerald-500" />}
            className="h-6.5 text-[11px] px-2"
          >
            Verify
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            leftIcon={<Edit3 className="w-3 h-3 text-slate-500" />}
            className="h-6.5 text-[11px] px-2"
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  if (!isLoading && profiles.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-3">
        <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <Building className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
          No GSTIN Profiles Added Yet
        </h4>
        <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Add your client&apos;s GSTIN to prepare GSTR-1 and GSTR-3B returns, auto-reconcile ITC in IMS, and track statutory deadlines.
        </p>
        {onCreateProfile && (
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateProfile}
            leftIcon={<Plus className="w-4 h-4" />}
            className="mt-2 text-xs"
          >
            Add First Client GSTIN
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search GSTIN, Legal Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
            className="h-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Type:
          </span>
          <select
            value={regFilter}
            onChange={(e) => setRegFilter(e.target.value)}
            className="px-2.5 py-1 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500"
            style={{
              background: 'var(--color-bg-input)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="ALL">All Types</option>
            <option value="REGULAR">Regular</option>
            <option value="COMPOSITION">Composition</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        data={filteredProfiles}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No GST profiles found matching your search."
      />
    </div>
  );
};
