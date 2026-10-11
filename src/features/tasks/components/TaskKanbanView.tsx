'use client';

import React from 'react';
import {
  Clock,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import type { Task, TaskStatus } from '@/lib/types/task.types';

interface TaskKanbanViewProps {
  tasks: Task[];
  onOpenEdit: (task: Task) => void;
  onSubmitReview: (task: Task) => void;
  onReviewTask: (task: Task) => void;
  onLogTime: (task: Task) => void;
  onOpenComments: (task: Task) => void;
  onVerifyGstPortal: (task: Task) => void;
  userRole?: string;
  isStaffRole?: boolean;
}

const COLUMNS: Array<{ id: TaskStatus; title: string; color: string; bg: string }> = [
  {
    id: 'NOT_STARTED',
    title: 'To Do / Backlog',
    color: '#5A6E85',
    bg: 'bg-slate-50/50 dark:bg-slate-900/30',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    color: '#9E6B42',
    bg: 'bg-[rgba(158,107,66,0.03)] dark:bg-[rgba(158,107,66,0.05)]',
  },
  {
    id: 'REVIEW',
    title: 'Maker-Checker Review',
    color: '#4A6FA5',
    bg: 'bg-[rgba(74,111,165,0.04)] dark:bg-[rgba(74,111,165,0.06)]',
  },
  {
    id: 'DONE',
    title: 'Completed & Verified',
    color: '#3D7A64',
    bg: 'bg-[rgba(61,122,100,0.03)] dark:bg-[rgba(61,122,100,0.05)]',
  },
];

export function TaskKanbanView({
  tasks,
  onOpenEdit,
  onSubmitReview,
  onReviewTask,
  onLogTime,
  onOpenComments,
  onVerifyGstPortal,
  userRole,
  isStaffRole,
}: TaskKanbanViewProps) {
  const isManagerOrAdmin = !isStaffRole;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className={`rounded-2xl border p-3 flex flex-col min-h-[500px] ${col.bg}`}
            style={{ borderColor: 'var(--color-border)' }}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E2A38] dark:text-slate-200">
                  {col.title}
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-200/60 dark:bg-slate-800 text-[#5A6E85]">
                {colTasks.length}
              </span>
            </div>

            {/* Column Tasks */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[750px] pr-1 custom-scrollbar">
              {colTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8E9FAA]">
                  No tasks in this lane
                </div>
              ) : (
                colTasks.map((task) => {
                  const isOverdue =
                    task.status !== 'DONE' &&
                    task.dueDate &&
                    new Date(task.dueDate) < new Date();

                  const isGstTask =
                    task.complianceType === 'GST' ||
                    task.title?.toLowerCase().includes('gst') ||
                    task.title?.toLowerCase().includes('gstr');

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border bg-[var(--color-bg-card)] border-[var(--color-border)] shadow-2xs hover:shadow-sm hover:border-[#4A6FA5]/40 transition-all space-y-2.5 group"
                    >
                      {/* Priority & Statutory Type */}
                      <div className="flex items-center justify-between">
                        <PriorityBadge priority={task.priority} />
                        {task.complianceType && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#5A6E85] font-medium truncate max-w-[120px]">
                            {task.complianceType}
                          </span>
                        )}
                      </div>

                      {/* Title & Client */}
                      <div
                        onClick={() => onOpenEdit(task)}
                        className="cursor-pointer"
                      >
                        <h4 className="text-xs font-bold text-[#1E2A38] dark:text-slate-100 line-clamp-2 group-hover:text-[#4A6FA5] transition-colors">
                          {task.title}
                        </h4>
                        <div className="text-[11px] text-[#5A6E85] mt-0.5 truncate">
                          Client: {task.client?.name || 'Unassigned'}
                        </div>
                      </div>

                      {/* Due Date & Overdue Badge */}
                      <div className="flex items-center justify-between text-[11px]">
                        {task.dueDate ? (
                          <div
                            className={`flex items-center gap-1 font-medium ${
                              isOverdue
                                ? 'text-[#9E4A4A]'
                                : 'text-[#5A6E85]'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(task.dueDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                            {isOverdue && (
                              <span className="text-[10px] font-bold px-1 rounded bg-[rgba(158,74,74,0.08)]">
                                Overdue
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No date</span>
                        )}

                        {/* Time logged */}
                        {task.timeTaken ? (
                          <span className="text-[10px] text-[#4A6FA5] font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.timeTaken}m
                          </span>
                        ) : null}
                      </div>

                      {/* Filing Verified indicator */}
                      {task.filingVerified && (
                        <div className="flex items-center gap-1 text-[10px] text-[#3D7A64] font-semibold bg-[rgba(61,122,100,0.08)] p-1 rounded">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">GST Portal Verified ({task.arn || 'Filed'})</span>
                        </div>
                      )}

                      {/* Actions Footer */}
                      <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                        {/* Assignee / Working users */}
                        <div className="flex items-center gap-1 text-slate-400">
                          <div className="w-5 h-5 rounded-full bg-[#4A6FA5]/20 text-[#4A6FA5] flex items-center justify-center text-[10px] font-bold" title={task.assignee?.name || 'Assignee'}>
                            {task.assignee?.name ? task.assignee.name[0].toUpperCase() : 'U'}
                          </div>
                          <span className="text-[10px] text-[#5A6E85] truncate max-w-[80px]">
                            {task.assignee?.name || 'Unassigned'}
                          </span>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-1">
                          {/* Comments button */}
                          <button
                            type="button"
                            onClick={() => onOpenComments(task)}
                            className="p-1 rounded-md text-slate-400 hover:text-[#4A6FA5] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Comments"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Time Log button */}
                          <button
                            type="button"
                            onClick={() => onLogTime(task)}
                            className="p-1 rounded-md text-slate-400 hover:text-[#4A6FA5] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Log Time"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {/* GST Portal check */}
                          {isGstTask && (
                            <button
                              type="button"
                              onClick={() => onVerifyGstPortal(task)}
                              className="p-1 rounded-md text-slate-400 hover:text-[#3D7A64] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Check GST Portal"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Maker-Checker Submit vs Review */}
                          {task.status === 'REVIEW' ? (
                            <button
                              type="button"
                              onClick={() => onReviewTask(task)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4A6FA5] text-white hover:bg-[#3D5C8A] transition-colors"
                            >
                              Review
                            </button>
                          ) : task.status !== 'DONE' ? (
                            <button
                              type="button"
                              onClick={() => onSubmitReview(task)}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#4A6FA5]/10 text-[#4A6FA5] hover:bg-[#4A6FA5]/20 transition-colors"
                            >
                              Submit
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
