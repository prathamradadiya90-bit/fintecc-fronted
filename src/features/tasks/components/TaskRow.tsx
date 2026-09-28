'use client';

import React from 'react';
import { Calendar, User as UserIcon, Repeat, MoreVertical, Trash2, Edit3, AlertCircle } from 'lucide-react';
import { StatusCell } from './StatusCell';
import { PriorityBadge } from './PriorityBadge';
import type { Task, TaskStatus } from '@/lib/types/task.types';

interface TaskRowProps {
  task: Task;
  isSelected: boolean;
  userRole?: string;
  isUpdatingStatus?: boolean;
  clientName?: string;
  assigneeName?: string;
  onSelect: (taskId: string, selected: boolean) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void> | void;
  onEdit: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  isSelected,
  userRole,
  isUpdatingStatus = false,
  clientName,
  assigneeName,
  onSelect,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const isFirmOwnerOrPartner = userRole === 'FIRM_OWNER' || userRole === 'PARTNER';

  // Determine if task is overdue
  const isOverdue = React.useMemo(() => {
    if (!task.dueDate || task.status === 'DONE') return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    return due.getTime() < now.getTime();
  }, [task.dueDate, task.status]);

  // Format Due Date
  const formattedDueDate = React.useMemo(() => {
    if (!task.dueDate) return { dateStr: 'No Due Date', isOverdue: false };
    try {
      const date = new Date(task.dueDate);
      const isInvalid = isNaN(date.getTime());
      if (isInvalid) return { dateStr: 'Invalid Date', isOverdue: false };

      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      };
      return {
        dateStr: date.toLocaleDateString('en-IN', options),
        isOverdue,
      };
    } catch {
      return { dateStr: '—', isOverdue: false };
    }
  }, [task.dueDate, isOverdue]);

  const displayClientName = task.client?.name || clientName || '—';
  const displayAssigneeName = task.assignee?.name || assigneeName || (task.assigneeId ? 'Assigned' : 'Unassigned');

  // Work type pill style
  const getWorkTypeColor = (type?: string | null) => {
    if (!type) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    if (type.includes('GST')) return 'bg-[rgba(61,122,100,0.08)] text-[#3D7A64] border-[rgba(61,122,100,0.2)]';
    if (type.includes('ROC')) return 'bg-[rgba(158,107,66,0.08)] text-[#9E6B42] border-[rgba(158,107,66,0.2)]';
    return 'bg-[#A8C5DA]/20 text-[#4A6FA5] border-[#A8C5DA]/40';
  };

  return (
    <tr
      className={`group transition-colors border-b select-none ${
        isSelected ? 'bg-[#4A6FA5]/10' : ''
      }`}
      style={{
        borderColor: 'var(--color-border-subtle)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'var(--color-bg-card-hover)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Selection Checkbox */}
      <td className="w-10 px-3 py-3 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(task.id, e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 accent-[#4A6FA5] cursor-pointer"
        />
      </td>

      {/* Client Name */}
      <td className="px-4 py-3 max-w-[180px]">
        <div className="flex flex-col">
          <span
            className="text-xs font-semibold truncate hover:text-[#4A6FA5] cursor-pointer transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
            onClick={() => onEdit(task)}
            title={displayClientName}
          >
            {displayClientName}
          </span>
          {(task.client?.pan || task.client?.gstin) && (
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] truncate">
              {task.client.pan || task.client.gstin}
            </span>
          )}
        </div>
      </td>

      {/* Task Title */}
      <td className="px-4 py-3 min-w-[200px] max-w-[280px]">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-medium truncate cursor-pointer hover:underline"
              style={{ color: 'var(--color-text-primary)' }}
              onClick={() => onEdit(task)}
              title={task.title}
            >
              {task.title}
            </span>
            {task.isRecurring && (
              <span title={`Recurring: ${task.recurrencePattern || 'Pattern'}`}>
                <Repeat className="w-3 h-3 text-[#4A6FA5] shrink-0" />
              </span>
            )}
          </div>
          {task.description && (
            <span className="text-[11px] text-[var(--color-text-secondary)] truncate">
              {task.description}
            </span>
          )}
        </div>
      </td>

      {/* Work / Compliance Type */}
      <td className="px-4 py-3 whitespace-nowrap">
        {task.complianceType ? (
          <span
            className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${getWorkTypeColor(
              task.complianceType
            )}`}
            title={task.complianceType}
          >
            {task.complianceType.length > 24
              ? `${task.complianceType.substring(0, 22)}...`
              : task.complianceType}
          </span>
        ) : (
          <span className="text-[11px] text-[var(--color-text-muted)]">General</span>
        )}
      </td>

      {/* Assignee */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
            {displayAssigneeName.charAt(0).toUpperCase()}
          </div>
          <span
            className="text-xs truncate max-w-[110px]"
            style={{
              color:
                displayAssigneeName === 'Unassigned'
                  ? 'var(--color-text-muted)'
                  : 'var(--color-text-primary)',
            }}
          >
            {displayAssigneeName}
          </span>
        </div>
      </td>

      {/* Due Date */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Calendar
            className="w-3.5 h-3.5"
            style={{
              color: formattedDueDate.isOverdue ? '#9E4A4A' : 'var(--color-text-muted)',
            }}
          />
          <span
            className="text-xs"
            style={{
              color: formattedDueDate.isOverdue ? '#9E4A4A' : 'var(--color-text-secondary)',
              fontWeight: formattedDueDate.isOverdue ? 600 : 400,
            }}
          >
            {formattedDueDate.dateStr}
          </span>
          {formattedDueDate.isOverdue && (
            <span 
              className="text-[9px] font-bold px-1 py-0.2 rounded border"
              style={{
                background: 'rgba(158, 74, 74, 0.08)',
                color: '#9E4A4A',
                borderColor: 'rgba(158, 74, 74, 0.25)',
              }}
            >
              OVERDUE
            </span>
          )}
        </div>
      </td>

      {/* Status (Inline editable with double click) */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusCell
          status={task.status}
          userRole={userRole}
          isUpdating={isUpdatingStatus}
          onStatusChange={(newStatus) => onStatusChange(task.id, newStatus)}
        />
      </td>

      {/* Priority */}
      <td className="px-4 py-3 whitespace-nowrap">
        <PriorityBadge priority={task.priority} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {isFirmOwnerOrPartner && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-[rgba(158,74,74,0.08)] transition-colors"
              style={{ color: '#9E4A4A' }}
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
