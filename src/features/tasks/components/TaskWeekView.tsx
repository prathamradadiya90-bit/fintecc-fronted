'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { useGetWeekViewQuery } from '@/lib/store/api/tasksApi';
import type { Task } from '@/lib/types/task.types';

interface TaskWeekViewProps {
  onOpenEdit: (task: Task) => void;
  onSubmitReview: (task: Task) => void;
  onReviewTask: (task: Task) => void;
  onLogTime: (task: Task) => void;
}

export function TaskWeekView({
  onOpenEdit,
  onSubmitReview,
  onReviewTask,
  onLogTime,
}: TaskWeekViewProps) {
  // Current Monday anchor
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(d.setDate(diff));
  });

  const weekStart = new Date(currentDate);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const { data: weekData, isLoading } = useGetWeekViewQuery({
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
  });

  const tasks = weekData?.data || [];

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleToday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentDate(new Date(d.setDate(diff)));
  };

  // Generate 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-4">
      {/* Week Navigator */}
      <div
        className="p-3 rounded-2xl border flex items-center justify-between shadow-xs"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#4A6FA5]" />
          <span className="text-xs font-bold text-[#1E2A38] dark:text-slate-200">
            {weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} –{' '}
            {weekEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[var(--color-border)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[#5A6E85] transition-colors"
          >
            Today
          </button>
          <button
            onClick={handlePrevWeek}
            className="p-1 rounded-lg border border-[var(--color-border)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[#5A6E85] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1 rounded-lg border border-[var(--color-border)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[#5A6E85] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7 Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-start">
        {days.map((day) => {
          const isToday = new Date().toDateString() === day.toDateString();
          const dayTasks = tasks.filter((t) => {
            if (!t.dueDate) return false;
            return new Date(t.dueDate).toDateString() === day.toDateString();
          });

          return (
            <div
              key={day.toISOString()}
              className={`rounded-2xl border p-2.5 min-h-[420px] flex flex-col ${
                isToday
                  ? 'bg-[#4A6FA5]/5 border-[#4A6FA5]/40 shadow-xs'
                  : 'bg-[var(--color-bg-card)] border-[var(--color-border)]'
              }`}
            >
              {/* Day Header */}
              <div className="pb-2 mb-2 border-b border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A6E85]">
                    {day.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      isToday ? 'text-[#4A6FA5]' : 'text-[#1E2A38] dark:text-slate-200'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>

                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#5A6E85]">
                  {dayTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[600px] pr-0.5 custom-scrollbar">
                {isLoading ? (
                  <div className="py-6 text-center text-[10px] text-slate-400">Loading...</div>
                ) : dayTasks.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-[#8E9FAA]">No deadlines</div>
                ) : (
                  dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onOpenEdit(t)}
                      className="p-2.5 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] hover:border-[#4A6FA5]/50 transition-all cursor-pointer space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <PriorityBadge priority={t.priority} />
                        <span
                          className={`text-[9px] px-1 py-0.5 rounded font-bold ${
                            t.status === 'DONE'
                              ? 'bg-[rgba(61,122,100,0.1)] text-[#3D7A64]'
                              : t.status === 'REVIEW'
                              ? 'bg-[#4A6FA5]/10 text-[#4A6FA5]'
                              : 'bg-slate-100 dark:bg-slate-800 text-[#5A6E85]'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-[#1E2A38] dark:text-slate-100 line-clamp-2 group-hover:text-[#4A6FA5]">
                        {t.title}
                      </div>

                      <div className="text-[10px] text-[#5A6E85] truncate">
                        {t.client?.name || 'Unassigned'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
