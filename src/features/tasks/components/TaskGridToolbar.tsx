'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, FileSpreadsheet, Download, RefreshCw, Wifi, WifiOff, LayoutGrid } from 'lucide-react';
import type { TaskFilterState } from '../hooks/useTaskFilters';

interface TaskGridToolbarProps {
  viewMode: TaskFilterState['viewMode'];
  userRole?: string;
  totalTasks: number;
  isSocketConnected?: boolean;
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
  onViewModeChange,
  onOpenCreateModal,
  onOpenImportModal,
  onExportCSV,
  onRefresh,
  isRefreshing = false,
}) => {
  const isFirmOwnerOrPartner = userRole === 'FIRM_OWNER' || userRole === 'PARTNER';

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-[#00C2B3] flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-heading)' }}>
                Work Board
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Centralized firm-wide compliance and task management grid
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Socket Live Sync Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isSocketConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
            title={isSocketConnected ? 'Real-time WebSocket active' : 'Connecting to real-time sync...'}
          >
            {isSocketConnected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Sync</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Offline Sync</span>
              </>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-card)',
            }}
            title="Refresh tasks"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00C2B3]' : ''}`} />
          </button>

          {/* Export CSV */}
          <Button
            variant="outline"
            onClick={onExportCSV}
            className="text-xs h-9 px-3 border-[var(--color-border)]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>

          {/* Import Excel (Owner / Partner) */}
          {isFirmOwnerOrPartner && (
            <Button
              variant="outline"
              onClick={onOpenImportModal}
              className="text-xs h-9 px-3 border-[var(--color-border)]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              Import Excel
            </Button>
          )}

          {/* New Task Button */}
          <Button
            onClick={onOpenCreateModal}
            className="text-xs h-9 px-3.5 bg-[#00C2B3] hover:bg-[#00A89B] text-white shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Task
          </Button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border)] pb-1">
        <button
          type="button"
          onClick={() => onViewModeChange('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            viewMode === 'all'
              ? 'bg-[#00C2B3]/10 text-[#00C2B3]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]'
          }`}
        >
          All Firm Tasks
          {viewMode === 'all' && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#00C2B3] text-white text-[10px]">
              {totalTasks}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('my')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            viewMode === 'my'
              ? 'bg-[#00C2B3]/10 text-[#00C2B3]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]'
          }`}
        >
          My Tasks
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('overdue')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            viewMode === 'overdue'
              ? 'bg-red-500/10 text-red-500'
              : 'text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
          }`}
        >
          Overdue
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('review')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            viewMode === 'review'
              ? 'bg-purple-500/10 text-purple-600'
              : 'text-[var(--color-text-secondary)] hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20'
          }`}
        >
          Needs Review
        </button>
      </div>
    </div>
  );
};
