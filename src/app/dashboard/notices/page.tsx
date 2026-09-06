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
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Notice Management Kanban
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Combined tracker for GST & Income Tax Department notices with visual workflow stages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition flex items-center gap-2 text-xs font-semibold"
            title="Refresh notices"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Notices</p>
            <h3 className="text-xl font-bold text-slate-900">{metrics.total}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Action Required / Open</p>
            <h3 className="text-xl font-bold text-amber-600">{metrics.openCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">In Progress</p>
            <h3 className="text-xl font-bold text-blue-600">{metrics.inProgressCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Disputed Demand</p>
            <h3 className="text-xl font-bold text-rose-600">
              ₹{metrics.totalDemand.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search client, notice #, section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Type Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              typeFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Notices ({allNotices.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('GST')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              typeFilter === 'GST'
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GST ({allNotices.filter((n) => n.type === 'GST').length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('ITR')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              typeFilter === 'ITR'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
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
