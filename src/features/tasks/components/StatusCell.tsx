'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Clock, PlayCircle, Eye, AlertTriangle, Loader2 } from 'lucide-react';
import type { TaskStatus } from '@/lib/types/task.types';

interface StatusCellProps {
  status: TaskStatus | string;
  userRole?: string;
  isUpdating?: boolean;
  onStatusChange: (newStatus: TaskStatus) => Promise<void> | void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  NOT_STARTED: {
    label: 'Not Started',
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    icon: Clock,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    icon: PlayCircle,
  },
  REVIEW: {
    label: 'Review',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    icon: Eye,
  },
  DONE: {
    label: 'Done',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    icon: AlertTriangle,
  },
};

export const StatusCell: React.FC<StatusCellProps> = ({
  status,
  userRole,
  isUpdating = false,
  onStatusChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentVal, setCurrentVal] = useState(status);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setCurrentVal(status);
  }, [status]);

  useEffect(() => {
    if (isEditing) {
      selectRef.current?.focus();
    }
  }, [isEditing]);

  const isJuniorStaff = userRole === 'EMPLOYEE' || userRole === 'ACCOUNTANT';

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    setIsEditing(false);
    if (newStatus !== status) {
      setCurrentVal(newStatus);
      await onStatusChange(newStatus);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const normalized = (currentVal || 'NOT_STARTED').toUpperCase();
  const config = STATUS_CONFIG[normalized] || STATUS_CONFIG.NOT_STARTED;
  const Icon = config.icon;

  if (isUpdating) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 animate-pulse">
        <Loader2 className="w-3 h-3 animate-spin text-[#00C2B3]" />
        Saving...
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
        <select
          ref={selectRef}
          value={currentVal}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="text-xs font-semibold rounded-lg px-2.5 py-1 border shadow-md focus:outline-none focus:ring-2 focus:ring-[#00C2B3] cursor-pointer"
          style={{
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          {!isJuniorStaff && <option value="DONE">Done</option>}
          <option value="PENDING_APPROVAL">Pending Approval</option>
        </select>
      </div>
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      title="Double-click to change status"
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border cursor-pointer select-none transition-all hover:scale-105 hover:shadow-xs group ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
      <span className="opacity-0 group-hover:opacity-60 text-[9px] ml-0.5 transition-opacity">✎</span>
    </div>
  );
};
