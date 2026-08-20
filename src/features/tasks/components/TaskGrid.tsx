'use client';

import React, { useState, useMemo } from 'react';
import { TaskRow } from './TaskRow';
import { BulkActionsBar } from './BulkActionsBar';
import { Pagination } from '@/components/ui/Pagination';
import { ClipboardList, Plus, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Task, TaskStatus, TaskPriority } from '@/lib/types/task.types';
import type { User } from '@/lib/types/auth.types';
import type { Client } from '@/lib/types/client.types';

interface TaskGridProps {
  tasks: Task[];
  total: number;
  currentPage: number;
  pageSize: number;
  isLoading?: boolean;
  userRole?: string;
  staffList?: User[];
  clientsList?: Client[];
  onPageChange: (page: number) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void> | void;
  onBulkUpdateStatus: (taskIds: string[], status: TaskStatus) => Promise<void>;
  onBulkUpdateAssignee: (taskIds: string[], assigneeId: string) => Promise<void>;
  onBulkUpdatePriority: (taskIds: string[], priority: TaskPriority) => Promise<void>;
  onBulkDelete?: (taskIds: string[]) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onOpenCreateModal: () => void;
  onOpenImportModal: () => void;
}

export const TaskGrid: React.FC<TaskGridProps> = ({
  tasks,
  total,
  currentPage,
  pageSize,
  isLoading = false,
  userRole,
  staffList = [],
  clientsList = [],
  onPageChange,
  onStatusChange,
  onBulkUpdateStatus,
  onBulkUpdateAssignee,
  onBulkUpdatePriority,
  onBulkDelete,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
  onOpenImportModal,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Lookup maps for fast client and staff display
  const clientsMap = useMemo(() => {
    const map = new Map<string, string>();
    clientsList.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [clientsList]);

  const staffMap = useMemo(() => {
    const map = new Map<string, string>();
    staffList.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [staffList]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const isAllSelected = tasks.length > 0 && tasks.every((t) => selectedIds.has(t.id));
  const isIndeterminate = tasks.some((t) => selectedIds.has(t.id)) && !isAllSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const next = new Set(selectedIds);
      tasks.forEach((t) => next.add(t.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      tasks.forEach((t) => next.delete(t.id));
      setSelectedIds(next);
    }
  };

  const handleSelectRow = (taskId: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(taskId);
    } else {
      next.delete(taskId);
    }
    setSelectedIds(next);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleInlineStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await onStatusChange(taskId, newStatus);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleBulkStatus = async (status: TaskStatus) => {
    try {
      setIsBulkSubmitting(true);
      await onBulkUpdateStatus(Array.from(selectedIds), status);
      handleClearSelection();
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleBulkAssignee = async (assigneeId: string) => {
    try {
      setIsBulkSubmitting(true);
      await onBulkUpdateAssignee(Array.from(selectedIds), assigneeId);
      handleClearSelection();
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleBulkPriority = async (priority: TaskPriority) => {
    try {
      setIsBulkSubmitting(true);
      await onBulkUpdatePriority(Array.from(selectedIds), priority);
      handleClearSelection();
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleBulkDeleteAction = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} selected tasks?`)) {
      try {
        setIsBulkSubmitting(true);
        await onBulkDelete?.(Array.from(selectedIds));
        handleClearSelection();
      } finally {
        setIsBulkSubmitting(false);
      }
    }
  };

  return (
    <div className="relative">
      {/* Table Container */}
      <div
        className="w-full overflow-x-auto rounded-2xl border shadow-sm"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <table className="w-full text-left border-collapse">
          {/* Table Headers */}
          <thead>
            <tr
              className="border-b"
              style={{
                background: 'var(--color-bg-subtle)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Checkbox */}
              <th className="w-10 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#00C2B3] focus:ring-[#00C2B3] cursor-pointer"
                />
              </th>

              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Client Name
              </th>

              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Task Title
              </th>

              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Work Type
              </th>

              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Assignee
              </th>

              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Due Date
              </th>

              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Status
              </th>

              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Priority
              </th>

              <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <tr
                  key={`skeleton-${index}`}
                  className="border-b"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                >
                  <td className="px-3 py-3 text-center">
                    <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse mx-auto" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-24 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800 animate-pulse ml-auto" />
                  </td>
                </tr>
              ))
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-[#00C2B3] flex items-center justify-center">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                      <h3
                        className="text-sm font-bold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        No tasks found
                      </h3>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        Create your first task or import your firm&apos;s existing master Excel sheet to get started.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        onClick={onOpenCreateModal}
                        className="bg-[#00C2B3] hover:bg-[#00A89B] text-white text-xs h-9"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Create Task
                      </Button>
                      <Button
                        variant="outline"
                        onClick={onOpenImportModal}
                        className="text-xs h-9 border-[var(--color-border)]"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-teal-600" />
                        Import Excel
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isSelected={selectedIds.has(task.id)}
                  userRole={userRole}
                  isUpdatingStatus={updatingTaskId === task.id}
                  clientName={task.client?.name || clientsMap.get(task.clientId)}
                  assigneeName={task.assignee?.name || (task.assigneeId ? staffMap.get(task.assigneeId) : undefined)}
                  onSelect={handleSelectRow}
                  onStatusChange={handleInlineStatusChange}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        )}
      </div>

      {/* Floating Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        userRole={userRole}
        staffList={staffList}
        isSubmitting={isBulkSubmitting}
        onClearSelection={handleClearSelection}
        onBulkUpdateStatus={handleBulkStatus}
        onBulkUpdateAssignee={handleBulkAssignee}
        onBulkUpdatePriority={handleBulkPriority}
        onBulkDelete={handleBulkDeleteAction}
      />
    </div>
  );
};
