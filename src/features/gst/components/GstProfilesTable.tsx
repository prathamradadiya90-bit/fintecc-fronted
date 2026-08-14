import React, { useState } from 'react';
import { Search, ShieldCheck, Edit3, Building, User } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { GstProfile } from '@/lib/types/gst.types';

interface GstProfilesTableProps {
  profiles: GstProfile[];
  isLoading?: boolean;
  onEdit: (profile: GstProfile) => void;
  onVerify: (profile: GstProfile) => void;
}

export const GstProfilesTable: React.FC<GstProfilesTableProps> = ({
  profiles,
  isLoading = false,
  onEdit,
  onVerify,
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
          <span className="font-mono font-semibold tracking-wider" style={{ color: 'var(--color-text-heading)' }}>
            {item.gstin}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            State Code: {item.stateCode}
          </span>
        </div>
      ),
    },
    {
      key: 'legalName',
      header: 'Legal / Trade Name',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {item.legalName}
          </span>
          {item.tradeName && (
            <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
              <Building className="w-3 h-3 text-[#00C2B3]" />
              Trade: {item.tradeName}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Associated Client',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold bg-[#00C2B3]/10 text-[#00C2B3]">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
              {item.client?.name || 'Unlinked'}
            </span>
            {item.client?.companyName && (
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                {item.client.companyName}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'registrationType',
      header: 'Reg. Type & Frequency',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
              item.registrationType === 'REGULAR'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
            }`}
          >
            {item.registrationType}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
            Frequency: <strong style={{ color: 'var(--color-text-primary)' }}>{item.filingFrequency}</strong>
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVerify(item)}
            leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-teal-600" />}
          >
            Verify
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search GSTIN, Legal Name, Client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Type:
          </span>
          <select
            value={regFilter}
            onChange={(e) => setRegFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-input)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="ALL">All Types</option>
            <option value="REGULAR">REGULAR</option>
            <option value="COMPOSITION">COMPOSITION</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        data={filteredProfiles}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No GST profiles found matching your search criteria."
      />
    </div>
  );
};
