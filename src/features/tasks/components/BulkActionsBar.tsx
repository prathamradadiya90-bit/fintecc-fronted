'use client';

import React, { useState } from 'react';
import { CheckSquare, Trash2, UserCheck, CheckCircle2, Flag, X, Loader2 } from 'lucide-react';
import type { TaskStatus, TaskPriority } from '@/lib/types/task.types';
import type { User } from '@/lib/types/auth.types';

interface BulkActionsBarProps {
  selectedCount: number;
  userRole?: string;
  staffList?: User[];
  isSubmitting?: boolean;
  onClearSelection: () => void;
  onBulkUpdateStatus: (status: TaskStatus) => Promise<void> | void;
  onBulkUpdateAssignee: (assigneeId: string) => Promise<void> | void;
  onBulkUpdatePriority: (priority: TaskPriority) => Promise<void> | void;
  onBulkDelete?: () => Promise<void> | void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  userRole,
  staffList = [],
  isSubmitting = false,
  onClearSelection,
  onBulkUpdateStatus,
  onBulkUpdateAssignee,
  onBulkUpdatePriority,
  onBulkDelete,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');

  if (selectedCount === 0) return null;

  const isFirmOwnerOrPartner = userRole === 'FIRM_OWNER' || userRole === 'PARTNER';
  const isJuniorStaff = userRole === 'EMPLOYEE' || userRole === 'ACCOUNTANT';

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as TaskStatus;
    if (val) {
      await onBulkUpdateStatus(val);
      setSelectedStatus('');
    }
  };

  const handleAssigneeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      await onBulkUpdateAssignee(val);
      setSelectedAssignee('');
    }
  };

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as TaskPriority;
    if (val) {
      await onBulkUpdatePriority(val);
      setSelectedPriority('');
    }
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: 'var(--color-border)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Count Badge */}
      <div className="flex items-center gap-2 pr-3 border-r border-[var(--color-border)]">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00C2B3] text-white text-xs font-bold">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Selected
        </span>
      </div>

      {isSubmitting ? (
        <div className="flex items-center gap-2 text-xs font-medium text-[#00C2B3] px-4 py-1">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Applying changes...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1">
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="text-xs rounded-xl px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-[#00C2B3] cursor-pointer"
              style={{
                background: 'var(--color-bg-input)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="">Set Status...</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              {!isJuniorStaff && <option value="DONE">Done</option>}
              <option value="PENDING_APPROVAL">Pending Approval</option>
            </select>
          </div>

          {/* Assignee Dropdown */}
          <div className="flex items-center gap-1">
            <select
              value={selectedAssignee}
              onChange={handleAssigneeChange}
              className="text-xs rounded-xl px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-[#00C2B3] cursor-pointer"
              style={{
                background: 'var(--color-bg-input)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="">Assign To...</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.role})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center gap-1">
            <select
              value={selectedPriority}
              onChange={handlePriorityChange}
              className="text-xs rounded-xl px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-[#00C2B3] cursor-pointer"
              style={{
                background: 'var(--color-bg-input)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="">Set Priority...</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Delete (Owner/Partner only) */}
          {isFirmOwnerOrPartner && onBulkDelete && (
            <button
              type="button"
              onClick={onBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}

      {/* Clear Selection */}
      <button
        type="button"
        onClick={onClearSelection}
        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"
        title="Deselect all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
