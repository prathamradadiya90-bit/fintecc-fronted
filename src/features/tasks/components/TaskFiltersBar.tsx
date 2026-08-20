'use client';

import React from 'react';
import { Search, Filter, X, AlertCircle, CheckCircle2, Clock, Users, Briefcase } from 'lucide-react';
import { COMPLIANCE_TYPES } from '@/lib/types/task.types';
import type { TaskFilterState } from '../hooks/useTaskFilters';
import type { User } from '@/lib/types/auth.types';
import type { Client } from '@/lib/types/client.types';

interface TaskFiltersBarProps {
  filters: TaskFilterState;
  staffList?: User[];
  clientsList?: Client[];
  activeFilterCount: number;
  onFilterChange: <K extends keyof TaskFilterState>(key: K, value: TaskFilterState[K]) => void;
  onResetFilters: () => void;
}

export const TaskFiltersBar: React.FC<TaskFiltersBarProps> = ({
  filters,
  staffList = [],
  clientsList = [],
  activeFilterCount,
  onFilterChange,
  onResetFilters,
}) => {
  return (
    <div
      className="p-3.5 rounded-2xl border space-y-3 transition-all"
      style={{
        background: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Top row: Search bar & Quick Toggles */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search tasks by title..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00C2B3] transition-all"
            style={{
              background: 'var(--color-bg-input)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Overdue Toggle */}
          <button
            type="button"
            onClick={() => onFilterChange('isOverdue', !filters.isOverdue)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              filters.isOverdue
                ? 'bg-red-500 text-white border-red-500 shadow-xs'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Overdue</span>
          </button>

          {/* Review Filter */}
          <button
            type="button"
            onClick={() =>
              onFilterChange('status', filters.status === 'REVIEW' ? '' : 'REVIEW')
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              filters.status === 'REVIEW'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Needs Review</span>
          </button>

          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Second row: Dropdown filters */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
        {/* Compliance / Work Type Filter */}
        <div>
          <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
            Work Type
          </label>
          <select
            value={filters.complianceType}
            onChange={(e) => onFilterChange('complianceType', e.target.value)}
            className="w-full text-xs rounded-xl px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-[#00C2B3] cursor-pointer"
            style={{
              background: 'var(--color-bg-input)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">All Work Types</option>
            {COMPLIANCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full text-xs rounded-xl px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-[#00C2B3] cursor-pointer"
            style={{
              background: 'var(--color-bg-input)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="w-full text-xs rounded-xl px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-[#00C2B3] cursor-pointer"
            style={{
              background: 'var(--color-bg-input)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div>
          <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
            Assignee
          </label>
          <select
            value={filters.assigneeId}
            onChange={(e) => onFilterChange('assigneeId', e.target.value)}
            className="w-full text-xs rounded-xl px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-[#00C2B3] cursor-pointer"
            style={{
              background: 'var(--color-bg-input)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">All Assignees</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name} ({staff.role})
              </option>
            ))}
          </select>
        </div>

        {/* Client Filter */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
            Client
          </label>
          <select
            value={filters.clientId}
            onChange={(e) => onFilterChange('clientId', e.target.value)}
            className="w-full text-xs rounded-xl px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-[#00C2B3] cursor-pointer"
            style={{
              background: 'var(--color-bg-input)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">All Clients</option>
            {clientsList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
