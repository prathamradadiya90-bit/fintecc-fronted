'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  ShieldAlert,
  Search,
  Filter,
  ShieldCheck,
  User,
  Clock,
  FileText,
  Activity,
  Calendar,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useGetAuditLogsQuery } from '@/lib/store/api/auditApi';
import { useGetStaffQuery } from '@/lib/store/api/authApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Column } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import type { RootState } from '@/lib/store/store';
import type { AuditLogItem } from '@/lib/types/audit.types';

const ACTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CREATE: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  UPDATE: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  DELETE: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
  UPLOAD: { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/20' },
  UPLOAD_BULK: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20' },
  DOWNLOAD_PDF: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
  DOWNLOAD_TALLY_XML: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
  DOWNLOAD_CSV: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20' },
};

export default function AuditLogsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [selectedUserId, setSelectedUserId] = useState('');

  // Guard: Only FIRM_OWNER can view audit logs
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'FIRM_OWNER') {
      showToast('Access Denied: Only Firm Owners can view audit security logs.', 'error');
      router.push('/dashboard');
    }
  }, [user, isAuthenticated, router, showToast]);

  const { data: response, isLoading, refetch } = useGetAuditLogsQuery(
    {
      action: selectedAction !== 'ALL' ? selectedAction : undefined,
      entityType: selectedEntity !== 'ALL' ? selectedEntity : undefined,
      userId: selectedUserId || undefined,
      limit: 100,
    },
    { skip: !isAuthenticated || !user || user.role !== 'FIRM_OWNER' }
  );

  const { data: staffData } = useGetStaffQuery(undefined, {
    skip: !isAuthenticated || !user || user.role !== 'FIRM_OWNER',
  });

  if (!isAuthenticated || !user || user.role !== 'FIRM_OWNER') {
    return null;
  }

  const logs = response?.data || [];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        log.action.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        (log.user?.name && log.user.name.toLowerCase().includes(q)) ||
        (log.user?.email && log.user.email.toLowerCase().includes(q)) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(q));

      return matchSearch;
    });
  }, [logs, searchTerm]);

  const columns: Column<AuditLogItem>[] = [
    {
      key: 'user',
      header: 'Actor / User',
      render: (log) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#00C2B3]/10 text-[#00C2B3] flex items-center justify-center font-bold text-xs shrink-0">
            {log.user?.name ? log.user.name.substring(0, 2).toUpperCase() : 'SYS'}
          </div>
          <div>
            <p className="font-semibold text-xs" style={{ color: 'var(--color-text-primary)' }}>
              {log.user?.name || 'System Actor'}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {log.user?.role || 'SYSTEM'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (log) => {
        const config = ACTION_COLORS[log.action] || {
          bg: 'bg-slate-500/10',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-500/20',
        };
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.bg} ${config.text} ${config.border}`}>
            {log.action}
          </span>
        );
      },
    },
    {
      key: 'entityType',
      header: 'Entity / Target',
      render: (log) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs" style={{ color: 'var(--color-text-primary)' }}>
            {log.entityType}
          </span>
          {log.entityId && (
            <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              ID: {log.entityId.substring(0, 8)}...
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Details & Metadata',
      render: (log) => {
        if (!log.details) return <span className="text-xs text-slate-400">—</span>;
        const { dpdpCompliance, ...rest } = log.details;
        const keys = Object.keys(rest);
        if (keys.length === 0) return <span className="text-xs text-slate-400">—</span>;

        return (
          <div className="max-w-xs truncate text-[11px] font-mono text-slate-600 dark:text-slate-400">
            {JSON.stringify(rest)}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (log) => (
        <div className="flex flex-col text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="font-medium">
            {new Date(log.createdAt).toLocaleDateString('en-IN')}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Security & Compliance Audit Trail
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" /> DPDP Act 2023 Compliant
            </span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Immutable security log recording all document, invoice, client, and tax workflow operations.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh Logs
        </Button>
      </div>

      {/* Filter Bar */}
      <div
        className="rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by action, user, or metadata..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-10 px-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-subtle)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="UPLOAD">UPLOAD</option>
            <option value="DOWNLOAD_PDF">DOWNLOAD_PDF</option>
            <option value="DOWNLOAD_TALLY_XML">DOWNLOAD_TALLY_XML</option>
          </select>

          {/* Entity Type Filter */}
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="h-10 px-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-subtle)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="ALL">All Entities</option>
            <option value="Invoice">Invoice</option>
            <option value="Client">Client</option>
            <option value="Task">Task</option>
            <option value="Settings">Settings</option>
          </select>

          {/* Staff Actor Filter */}
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="h-10 px-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-subtle)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">All Actors / Staff</option>
            {(staffData?.data || []).map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        data={filteredLogs}
        columns={columns}
        keyExtractor={(log) => log.id}
        isLoading={isLoading}
        emptyMessage="No audit logs matching your current filters."
      />
    </div>
  );
}
