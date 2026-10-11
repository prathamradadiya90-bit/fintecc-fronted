'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLogTimeMutation } from '@/lib/store/api/tasksApi';
import { useToast } from '@/components/ui/Toast';
import { Clock, Plus, History } from 'lucide-react';
import type { Task } from '@/lib/types/task.types';

interface LogTimeModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LogTimeModal({ task, isOpen, onClose }: LogTimeModalProps) {
  const { showToast } = useToast();
  const [minutes, setMinutes] = useState('30');
  const [description, setDescription] = useState('');
  const [logTime, { isLoading }] = useLogTimeMutation();

  if (!task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = parseInt(minutes, 10);
    if (isNaN(minVal) || minVal <= 0) {
      showToast('Please enter a valid duration in minutes', 'error');
      return;
    }

    try {
      await logTime({
        id: task.id,
        data: {
          minutes: minVal,
          description: description.trim() || 'Work logged on task',
        },
      }).unwrap();

      showToast(`Logged ${minVal} minutes successfully`, 'success');
      setDescription('');
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Failed to log time', 'error');
    }
  };

  const totalLogged = task.timeTaken || 0;
  const timeLogs = task.timeLogs || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Billable Time" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Details & Total logged */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-[#5A6E85]">
          <div className="font-semibold text-[#1E2A38] dark:text-slate-200 text-sm mb-1">
            {task.title}
          </div>
          <div className="flex items-center justify-between mt-1 text-xs">
            <span>Total Logged: <strong className="text-[#4A6FA5]">{totalLogged} min ({(totalLogged / 60).toFixed(1)} hrs)</strong></span>
            {task.timeAllocated && (
              <span>Allocated: {task.timeAllocated} min</span>
            )}
          </div>
        </div>

        {/* Minutes input */}
        <div>
          <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-300 mb-1">
            Duration (Minutes)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              step="5"
              required
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
            />
            {/* Quick minute buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {['15', '30', '60', '120'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutes(m)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    minutes === m
                      ? 'bg-[#4A6FA5] text-white border-[#4A6FA5]'
                      : 'bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[#5A6E85] hover:text-[#1E2A38]'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-300 mb-1">
            Work Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Reconciliation of purchase ledger entries"
            className="w-full text-xs p-2.5 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
          />
        </div>

        {/* Previous logs preview */}
        {timeLogs.length > 0 && (
          <div className="pt-2 border-t border-[var(--color-border)]">
            <div className="text-xs font-semibold text-[#1E2A38] dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#5A6E85]" />
              Recent Time Entries ({timeLogs.length})
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {timeLogs.slice(-4).reverse().map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-[11px] flex items-center justify-between border border-slate-200/60 dark:border-slate-800"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{log.userName}: </span>
                    <span className="text-[#5A6E85]">{log.description}</span>
                  </div>
                  <span className="font-bold text-[#4A6FA5] shrink-0 ml-2">{log.minutes}m</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading} className="text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Clock className="w-3.5 h-3.5" />}
            className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
          >
            Save Time Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
}
