'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Building2,
  Copy,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';
import {
  useGetUdinRecordsQuery,
  useDeleteUdinMutation,
} from '@/lib/store/api/udinApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { UdinStatusBadge } from '@/features/udin/components/UdinStatusBadge';
import { CreateUdinModal } from '@/features/udin/components/CreateUdinModal';
import { RevokeUdinModal } from '@/features/udin/components/RevokeUdinModal';
import { UdinViewModal } from '@/features/udin/components/UdinViewModal';
import type { UdinRecord, UdinStatus } from '@/lib/types/udin.types';

export default function UdinRegisterPage() {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [selectedUdin, setSelectedUdin] = useState<UdinRecord | null>(null);

  // RTK Query
  const { data: response, isLoading, isFetching } = useGetUdinRecordsQuery({
    page: currentPage,
    limit: 15,
  });

  const [deleteUdin, { isLoading: isDeleting }] = useDeleteUdinMutation();

  const records = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, limit: 15, totalPages: 1 };

  // Filter local search and status
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        item.udinNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [records, searchTerm, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = meta.total || records.length;
    const activeCount = records.filter((r) => r.status === 'ACTIVE').length;
    const revokedCount = records.filter((r) => r.status === 'REVOKED').length;
    const currentFyCount = records.filter((r) => r.financialYear === '2024-25').length;

    return { totalCount, activeCount, revokedCount, currentFyCount };
  }, [records, meta.total]);

  const handleCopyUdin = (e: React.MouseEvent, udinNumber: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(udinNumber);
    showToast(`UDIN ${udinNumber} copied to clipboard`, 'info');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this UDIN record?')) return;
    try {
      await deleteUdin(id).unwrap();
      showToast('UDIN record removed from register', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete record', 'error');
    }
  };

  const columns: Column<UdinRecord>[] = [
    {
      key: 'udinNumber',
      header: 'UDIN Number',
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#4A6FA5] hover:underline cursor-pointer">
            {r.udinNumber}
          </span>
          <button
            onClick={(e) => handleCopyUdin(e, r.udinNumber)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            title="Copy UDIN"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client / Entity',
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {r.client?.companyName || r.client?.name || 'Independent / Client N/A'}
          </span>
          {r.client?.pan && (
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              PAN: {r.client.pan}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'documentType',
      header: 'Document Type',
      render: (r) => (
        <div className="flex flex-col max-w-xs">
          <span className="text-xs truncate font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {r.documentType}
          </span>
          {r.documentDescription && (
            <span className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
              {r.documentDescription}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'dateOfGeneration',
      header: 'Date & FY',
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>
            {r.dateOfGeneration ? new Date(r.dateOfGeneration).toLocaleDateString('en-IN') : '—'}
          </span>
          <span className="text-[10px] font-semibold text-[#4A6FA5]">
            FY {r.financialYear || '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'figures',
      header: 'Disclosed Figures',
      render: (r) => {
        const figures = r.figures || {};
        if (!figures.turnover && !figures.netProfit) {
          return <span className="text-xs text-slate-400">—</span>;
        }
        return (
          <div className="flex flex-col text-[11px]">
            {figures.turnover !== undefined && (
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Turnover: <b className="font-semibold text-xs">₹{Number(figures.turnover).toLocaleString('en-IN')}</b>
              </span>
            )}
            {figures.netProfit !== undefined && (
              <span style={{ color: 'var(--color-text-muted)' }}>
                Net Profit: ₹{Number(figures.netProfit).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <UdinStatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedUdin(r);
              setIsViewOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {r.status === 'ACTIVE' && (
            <button
              onClick={() => {
                setSelectedUdin(r);
                setIsRevokeOpen(true);
              }}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Revoke UDIN"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => handleDelete(e, r.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
            <ShieldCheck className="w-6 h-6 text-[#4A6FA5]" />
            UDIN Register
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Official ICAI Unique Document Identification Number compliance register and revocation tracker.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white"
          >
            Register UDIN
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-2xl border flex items-center gap-3.5 transition-all shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-2.5 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5]">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Total UDINs Registered
            </p>
            <p className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              {stats.totalCount}
            </p>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border flex items-center gap-3.5 transition-all shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-2.5 rounded-xl bg-[rgba(61,122,100,0.08)] text-[#3D7A64]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Active Certificates
            </p>
            <p className="text-xl font-bold text-[#3D7A64]">
              {stats.activeCount}
            </p>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border flex items-center gap-3.5 transition-all shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-2.5 rounded-xl bg-[rgba(158,74,74,0.08)] text-[#9E4A4A]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Revoked Certificates
            </p>
            <p className="text-xl font-bold text-[#9E4A4A]">
              {stats.revokedCount}
            </p>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border flex items-center gap-3.5 transition-all shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-2.5 rounded-xl bg-[rgba(74,111,165,0.08)] text-[#4A6FA5]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Current FY 2024-25
            </p>
            <p className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              {stats.currentFyCount}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by UDIN, client, document..."
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
              <option value="ACTIVE">Active Only</option>
              <option value="REVOKED">Revoked Only</option>
            </select>
          </div>
        </div>

        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Showing {filteredRecords.length} of {meta.total} registered UDINs
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden shadow-xs"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <Table
          data={filteredRecords}
          columns={columns}
          keyExtractor={(r) => r.id}
          isLoading={isLoading || isFetching}
          onRowClick={(r) => {
            setSelectedUdin(r);
            setIsViewOpen(true);
          }}
          emptyMessage="No UDIN records found in the register. Click 'Register UDIN' to add your first certificate."
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
      <CreateUdinModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <UdinViewModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedUdin(null);
        }}
        udin={selectedUdin}
        onRevoke={(u) => {
          setSelectedUdin(u);
          setIsRevokeOpen(true);
        }}
      />

      <RevokeUdinModal
        isOpen={isRevokeOpen}
        onClose={() => {
          setIsRevokeOpen(false);
          setSelectedUdin(null);
        }}
        udin={selectedUdin}
      />
    </div>
  );
}
