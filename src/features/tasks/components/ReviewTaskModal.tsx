'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useReviewTaskMutation } from '@/lib/store/api/tasksApi';
import { useToast } from '@/components/ui/Toast';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { Task } from '@/lib/types/task.types';

interface ReviewTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewTaskModal({ task, isOpen, onClose }: ReviewTaskModalProps) {
  const { showToast } = useToast();
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [notes, setNotes] = useState('');
  const [reviewTask, { isLoading }] = useReviewTaskMutation();

  if (!task) return null;

  const isGstTask =
    task.complianceType === 'GST' ||
    task.title?.toLowerCase().includes('gst') ||
    task.title?.toLowerCase().includes('gstr');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      showToast('Mandatory review notes must be provided', 'error');
      return;
    }

    try {
      await reviewTask({
        id: task.id,
        data: {
          action,
          notes: notes.trim(),
        },
      }).unwrap();

      showToast(
        action === 'APPROVE'
          ? 'Task approved & completed!'
          : 'Task rejected and returned to preparer for revisions',
        'success'
      );
      onClose();
      setNotes('');
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Review action failed', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={action === 'APPROVE' ? 'Approve Task (Maker-Checker)' : 'Request Changes (Reject Review)'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Summary */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-[#5A6E85]">
          <div className="font-semibold text-[#1E2A38] dark:text-slate-200 text-sm mb-1">
            {task.title}
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span>Client: {task.client?.name || 'Unassigned'}</span>
            <span>Assignee: {task.assignee?.name || 'Unassigned'}</span>
          </div>
          {task.reviewHistory && task.reviewHistory.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Last Note: </span>
              {task.reviewHistory[task.reviewHistory.length - 1]?.notes}
            </div>
          )}
        </div>

        {/* GST Notice for Live Portal Verification */}
        {isGstTask && action === 'APPROVE' && (
          <div className="p-3 rounded-xl bg-[rgba(158,107,66,0.08)] border border-[rgba(158,107,66,0.2)] text-xs text-[#9E6B42] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Live GST Portal Verification Active:</span> The backend will
              automatically verify filing status & ARN against GST portal records before marking this task as DONE.
            </div>
          </div>
        )}

        {/* Action Toggle */}
        <div>
          <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-300 mb-1.5">
            Review Decision
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAction('APPROVE')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                action === 'APPROVE'
                  ? 'bg-[rgba(61,122,100,0.12)] border-[#3D7A64] text-[#3D7A64]'
                  : 'bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[#5A6E85] hover:text-[#1E2A38]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve & Complete
            </button>

            <button
              type="button"
              onClick={() => setAction('REJECT')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                action === 'REJECT'
                  ? 'bg-[rgba(158,74,74,0.12)] border-[#9E4A4A] text-[#9E4A4A]'
                  : 'bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[#5A6E85] hover:text-[#1E2A38]'
              }`}
            >
              <XCircle className="w-4 h-4" />
              Request Revisions
            </button>
          </div>
        </div>

        {/* Mandatory Review Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-300 mb-1">
            Review Notes & Feedback <span className="text-[#9E4A4A]">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              action === 'APPROVE'
                ? 'e.g. Verified calculations and GST portal return acknowledgement. Approved.'
                : 'e.g. Please rectify ITC claimed in Table 4(A)(5) against 2B statement difference...'
            }
            className="w-full text-xs p-3 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading} className="text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isLoading}
            className={`text-xs text-white ${
              action === 'APPROVE'
                ? 'bg-[#3D7A64] hover:bg-[#326452]'
                : 'bg-[#9E4A4A] hover:bg-[#853C3C]'
            }`}
          >
            {action === 'APPROVE' ? 'Confirm Approval' : 'Return for Revisions'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
