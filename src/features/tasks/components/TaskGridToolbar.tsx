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
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center border"
              style={{
                background: 'rgba(74, 111, 165, 0.12)',
                borderColor: 'rgba(74, 111, 165, 0.25)',
                color: '#4A6FA5',
              }}
            >
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
            style={{
              background: isSocketConnected ? 'rgba(61, 122, 100, 0.08)' : 'var(--color-bg-subtle)',
              borderColor: isSocketConnected ? 'rgba(61, 122, 100, 0.2)' : 'var(--color-border)',
              color: isSocketConnected ? '#3D7A64' : 'var(--color-text-muted)',
            }}
            title={isSocketConnected ? 'Real-time WebSocket active' : 'Connecting to real-time sync...'}
          >
            {isSocketConnected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D7A64] animate-ping" />
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
            className="p-2 rounded-xl border hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] transition-colors cursor-pointer"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-card)',
            }}
            title="Refresh tasks"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#4A6FA5]' : ''}`} />
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
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-[#4A6FA5]" />
              Import Excel
            </Button>
          )}

          {/* New Task Button */}
          <Button
            onClick={onOpenCreateModal}
            className="text-xs h-9 px-3.5 text-white shadow-sm"
            style={{ background: '#4A6FA5' }}
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
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            viewMode === 'all'
              ? 'bg-[#4A6FA5]/10 text-[#4A6FA5]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]'
          }`}
        >
          All Firm Tasks
          {viewMode === 'all' && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#4A6FA5] text-white text-[10px]">
              {totalTasks}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('my')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            viewMode === 'my'
              ? 'bg-[#4A6FA5]/10 text-[#4A6FA5]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]'
          }`}
        >
          My Tasks
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('overdue')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            viewMode === 'overdue'
              ? 'bg-[rgba(158,74,74,0.08)] text-[#9E4A4A]'
              : 'text-[var(--color-text-secondary)] hover:text-[#9E4A4A] hover:bg-[rgba(158,74,74,0.05)]'
          }`}
        >
          Overdue
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('review')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            viewMode === 'review'
              ? 'bg-[rgba(158,107,66,0.08)] text-[#9E6B42]'
              : 'text-[var(--color-text-secondary)] hover:text-[#9E6B42] hover:bg-[rgba(158,107,66,0.05)]'
          }`}
        >
          Needs Review
        </button>
      </div>
    </div>
  );
};
