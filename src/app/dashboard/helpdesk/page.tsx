'use client';

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  LifeBuoy,
  Plus,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Users,
  Filter,
} from 'lucide-react';
import { useGetTicketsQuery } from '@/lib/store/api/helpdeskApi';
import { useGetStaffQuery } from '@/lib/store/api/authApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, Column } from '@/components/ui/Table';
import { CreateTicketModal } from '@/components/helpdesk/CreateTicketModal';
import { TicketDetailSlideOver } from '@/components/helpdesk/TicketDetailSlideOver';
import type { RootState } from '@/lib/store/store';
import type { Ticket, TicketPriority, TicketStatus } from '@/lib/types/helpdesk.types';

const STATUS_BADGES: Record<TicketStatus, { bg: string; text: string; border: string; label: string }> = {
  OPEN: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', label: 'Open' },
  IN_PROGRESS: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', label: 'In Progress' },
  RESOLVED: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20', label: 'Resolved' },
  CLOSED: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20', label: 'Closed' },
};

const PRIORITY_BADGES: Record<TicketPriority, { bg: string; text: string; border: string; label: string }> = {
  LOW: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20', label: 'Low' },
  MEDIUM: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', label: 'Medium' },
  HIGH: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', label: 'High' },
  URGENT: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20', label: 'Urgent' },
};

export default function HelpdeskPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isClient = user?.role === 'CLIENT';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedAssignedTo, setSelectedAssignedTo] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data: ticketsResponse, isLoading, refetch } = useGetTicketsQuery({
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    priority: selectedPriority !== 'ALL' ? selectedPriority : undefined,
    assignedToId: selectedAssignedTo || undefined,
    limit: 100,
  });

  const { data: staffResponse } = useGetStaffQuery(undefined, {
    skip: isClient,
  });

  const rawTickets = ticketsResponse?.data || [];
  const staffList = staffResponse?.data || [];

  const filteredTickets = useMemo(() => {
    return rawTickets.filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.client?.name && t.client.name.toLowerCase().includes(q)) ||
        (t.client?.companyName && t.client.companyName.toLowerCase().includes(q));

      return matchSearch;
    });
  }, [rawTickets, searchTerm]);

  // Quick stats
  const stats = useMemo(() => {
    const total = rawTickets.length;
    const open = rawTickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = rawTickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = rawTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    return { total, open, inProgress, resolved };
  }, [rawTickets]);

  const columns: Column<Ticket>[] = [
    {
      key: 'subject',
      header: 'Ticket Details',
      render: (t) => (
        <div className="flex flex-col max-w-sm">
          <span className="font-semibold text-xs truncate" style={{ color: 'var(--color-text-primary)' }}>
            {t.subject}
          </span>
          <span className="text-[11px] text-slate-400 line-clamp-1">
            {t.description}
          </span>
          <span className="font-mono text-[10px] text-slate-400 mt-0.5">
            ID: #{t.id.slice(0, 8)}
          </span>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      render: (t) => (
        <div className="flex flex-col">
          <span className="font-medium text-xs" style={{ color: 'var(--color-text-primary)' }}>
            {t.client?.name || 'Account Client'}
          </span>
          {t.client?.companyName && (
            <span className="text-[10px] text-slate-400">
              {t.client.companyName}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (t) => {
        const config = PRIORITY_BADGES[t.priority] || {
          bg: 'bg-slate-500/10',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-500/20',
          label: t.priority,
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.bg} ${config.text} ${config.border}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => {
        const config = STATUS_BADGES[t.status] || {
          bg: 'bg-slate-500/10',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-500/20',
          label: t.status,
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.bg} ${config.text} ${config.border}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'assignedTo',
      header: 'Assigned Staff',
      render: (t) => (
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {t.assignedTo?.name || '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (t) => (
        <div className="flex flex-col text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="font-medium">
            {new Date(t.createdAt).toLocaleDateString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400">
            {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              Helpdesk & Support Queries
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-500/20">
              <LifeBuoy className="w-3 h-3" /> Real-time Ticketing
            </span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {isClient
              ? 'Submit queries, track compliance clarification requests, and communicate with your dedicated accounting team.'
              : 'Manage firm-wide client support queries, assign tasks to staff, and record resolution timelines.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Open Ticket
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-2xl border shadow-sm flex items-center gap-3.5"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Tickets</span>
            <span className="text-xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
              {stats.total}
            </span>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border shadow-sm flex items-center gap-3.5"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Open Queries</span>
            <span className="text-xl font-extrabold text-emerald-600">
              {stats.open}
            </span>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border shadow-sm flex items-center gap-3.5"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">In Progress</span>
            <span className="text-xl font-extrabold text-blue-600">
              {stats.inProgress}
            </span>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border shadow-sm flex items-center gap-3.5"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Resolved</span>
            <span className="text-xl font-extrabold text-purple-600">
              {stats.resolved}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by subject, description, or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            style={{
              background: 'var(--color-bg-subtle)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-10 px-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            style={{
              background: 'var(--color-bg-subtle)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Staff Filter (if staff user) */}
          {!isClient && (
            <select
              value={selectedAssignedTo}
              onChange={(e) => setSelectedAssignedTo(e.target.value)}
              className="h-10 px-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              style={{
                background: 'var(--color-bg-subtle)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="">All Assignees</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Ticket Table */}
      <Table
        data={filteredTickets}
        columns={columns}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
        onRowClick={(t) => setSelectedTicketId(t.id)}
        emptyMessage="No tickets found matching your query."
      />

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Ticket Detail & Replies SlideOver */}
      <TicketDetailSlideOver
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </div>
  );
}
