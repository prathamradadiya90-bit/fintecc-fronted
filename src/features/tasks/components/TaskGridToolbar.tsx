'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import type { TaskFilterState } from '../hooks/useTaskFilters';

interface TaskGridToolbarProps {
  viewMode: TaskFilterState['viewMode'];
  userRole?: string;
  totalTasks: number;
  isSocketConnected?: boolean;
  isSyncActive?: boolean;
  onViewModeChange: (mode: TaskFilterState['viewMode']) => void;
  onOpenCreateModal: () => void;
  onOpenImportModal: () => void;
  onExportCSV: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const TaskGridToolbar: React.FC<TaskGridToolbarProps> = ({
  viewMode,
  userRole,
  totalTasks,
  isSocketConnected = false,
  isSyncActive = false,
  onViewModeChange,
  onOpenCreateModal,
  onOpenImportModal,
  onExportCSV,
  onRefresh,
  isRefreshing = false,
}) => {
  const isFirmOwnerOrPartner = userRole === 'FIRM_OWNER' || userRole === 'PARTNER';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-2.5">
      {/* Scope Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
        <button
          type="button"
          onClick={() => onViewModeChange('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            viewMode === 'all'
              ? 'bg-[#4A6FA5] text-white shadow-xs'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]'
          }`}
        >
          All Tasks
          <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${viewMode === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
            {totalTasks}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('my')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            viewMode === 'my'
              ? 'bg-[#4A6FA5] text-white shadow-xs'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]'
          }`}
        >
          My Tasks
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('review')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            viewMode === 'review'
              ? 'bg-[#9E6B42] text-white shadow-xs'
              : 'text-[var(--color-text-secondary)] hover:text-[#9E6B42] hover:bg-[rgba(158,107,66,0.05)]'
          }`}
        >
          Needs Review
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('overdue')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            viewMode === 'overdue'
              ? 'bg-[#9E4A4A] text-white shadow-xs'
              : 'text-[var(--color-text-secondary)] hover:text-[#9E4A4A] hover:bg-[rgba(158,74,74,0.05)]'
          }`}
        >
          Overdue
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {/* Socket Live Sync Indicator */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
          style={{
            background: isSocketConnected
              ? 'rgba(61, 122, 100, 0.08)'
              : isSyncActive
              ? 'rgba(74, 111, 165, 0.08)'
              : 'var(--color-bg-subtle)',
            borderColor: isSocketConnected
              ? 'rgba(61, 122, 100, 0.2)'
              : isSyncActive
              ? 'rgba(74, 111, 165, 0.2)'
              : 'var(--color-border)',
            color: isSocketConnected
              ? '#3D7A64'
              : isSyncActive
              ? '#4A6FA5'
              : 'var(--color-text-muted)',
          }}
          title={
            isSocketConnected
              ? 'Real-time WebSocket active'
              : isSyncActive
              ? 'Cloud Auto-Sync active (Periodic & on focus)'
              : 'Offline'
          }
        >
          {isSocketConnected ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#3D7A64] animate-ping" />
              <span>Live Sync</span>
            </>
          ) : isSyncActive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4A6FA5]" />
              <span>Cloud Sync</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg border hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] transition-colors cursor-pointer"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
          title="Refresh tasks"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#4A6FA5]' : ''}`} />
        </button>

        {/* Export CSV */}
        <Button
          variant="outline"
          onClick={onExportCSV}
          className="text-xs h-8 px-2.5 border-[var(--color-border)]"
        >
          <Download className="w-3.5 h-3.5 mr-1" />
          Export
        </Button>

        {/* Import Excel (Owner / Partner) */}
        {isFirmOwnerOrPartner && (
          <Button
            variant="outline"
            onClick={onOpenImportModal}
            className="text-xs h-8 px-2.5 border-[var(--color-border)]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-[#4A6FA5]" />
            Import
          </Button>
        )}

        {/* New Task Button */}
        <Button
          onClick={onOpenCreateModal}
          className="text-xs h-8 px-3 text-white shadow-xs font-semibold"
          style={{ background: '#4A6FA5' }}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          New Task
        </Button>
      </div>
    </div>
  );
};
