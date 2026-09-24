'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileCheck2, 
  RefreshCw, 
  Search, 
  Filter, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  IndianRupee,
  Layers
} from 'lucide-react';
import { useGetNoticesQuery } from '@/lib/store/api/noticesApi';
import { NoticeKanbanBoard } from '@/components/notices/NoticeKanbanBoard';

export default function NoticeManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'GST' | 'ITR'>('ALL');

  const { data: response, isLoading, refetch, isFetching } = useGetNoticesQuery();
  const allNotices = useMemo(() => response?.data || [], [response]);

  // Compute metrics
  const metrics = useMemo(() => {
    let total = allNotices.length;
    let openCount = 0;
    let inProgressCount = 0;
    let closedCount = 0;
    let totalDemand = 0;

    allNotices.forEach((n) => {
      const st = (n.status || 'OPEN').toUpperCase();
      if (['OPEN', 'RECEIVED', 'NEW'].includes(st)) {
        openCount++;
      } else if (['IN_PROGRESS', 'PENDING_REPLY', 'DRAFTING', 'UNDER_REVIEW', 'SCRUTINY'].includes(st)) {
        inProgressCount++;
      } else if (['CLOSED', 'RESOLVED', 'RESPONDED', 'APPEALED'].includes(st)) {
        closedCount++;
      }

      if (n.amountDemanded) {
        totalDemand += Number(n.amountDemanded) || 0;
      }
    });

    return { total, openCount, inProgressCount, closedCount, totalDemand };
  }, [allNotices]);

  // Filtered notices
  const filteredNotices = useMemo(() => {
    return allNotices.filter((notice) => {
      const matchesType = typeFilter === 'ALL' || notice.type === typeFilter;
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        notice.noticeNumber?.toLowerCase().includes(search) ||
        notice.client?.name?.toLowerCase().includes(search) ||
        notice.sectionCode?.toLowerCase().includes(search) ||
        notice.noticeType?.toLowerCase().includes(search);

      return matchesType && matchesSearch;
    });
  }, [allNotices, typeFilter, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Notice Management Kanban
            </h1>
          </div>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Combined tracker for GST &amp; Income Tax Department notices with visual workflow stages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 border rounded-xl shadow-xs transition flex items-center gap-2 text-xs font-semibold"
            style={{
              background: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            title="Refresh notices"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-2xl border shadow-xs flex items-center gap-3"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Notices</p>
            <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{metrics.total}</h3>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border shadow-xs flex items-center gap-3"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Action Required / Open</p>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">{metrics.openCount}</h3>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border shadow-xs flex items-center gap-3"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>In Progress</p>
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">{metrics.inProgressCount}</h3>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border shadow-xs flex items-center gap-3"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Disputed Demand</p>
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">
              ₹{metrics.totalDemand.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-4 rounded-2xl border shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search client, notice #, section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            style={{
              background: 'var(--color-bg-input)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        {/* Type Tabs */}
        <div
          className="flex items-center p-1 rounded-xl w-full sm:w-auto border"
          style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
        >
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            All Notices ({allNotices.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('GST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === 'GST'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            GST ({allNotices.filter((n) => n.type === 'GST').length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('ITR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === 'ITR'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            ITR ({allNotices.filter((n) => n.type === 'ITR').length})
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <NoticeKanbanBoard
        notices={filteredNotices}
        isLoading={isLoading}
      />
    </div>
  );
}
