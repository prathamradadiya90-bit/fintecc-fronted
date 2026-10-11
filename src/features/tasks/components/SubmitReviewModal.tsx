'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useSubmitForReviewMutation } from '@/lib/store/api/tasksApi';
import { useToast } from '@/components/ui/Toast';
import { ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import type { Task } from '@/lib/types/task.types';

interface SubmitReviewModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  staffList?: Array<{ id: string; name: string; email: string; role?: string }>;
}

export function SubmitReviewModal({
  task,
  isOpen,
  onClose,
  staffList = [],
}: SubmitReviewModalProps) {
  const { showToast } = useToast();
  const [reviewerId, setReviewerId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitForReview, { isLoading }] = useSubmitForReviewMutation();

  if (!task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitForReview({
        id: task.id,
        data: {
          reviewerId: reviewerId || undefined,
          notes: notes.trim() || 'Submitted for Maker-Checker review',
        },
      }).unwrap();

      showToast('Task successfully submitted for review!', 'success');
      onClose();
      setNotes('');
      setReviewerId('');
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Failed to submit for review', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Task for Review" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-[#5A6E85]">
          <div className="font-semibold text-[#1E2A38] dark:text-slate-200 text-sm mb-1">
            {task.title}
          </div>
          <div>Client: {task.client?.name || 'Unassigned'}</div>
          {task.complianceType && <div>Statutory Type: {task.complianceType}</div>}
        </div>

        {/* Reviewer Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-300 mb-1">
            Assign Reviewer (Optional Partner / Senior CA)
          </label>
          <div className="relative">
            <select
              value={reviewerId}
              onChange={(e) => setReviewerId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
            >
              <option value="">Default Firm Partner / Reviewer</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role || 'Staff'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submission Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-300 mb-1">
            Submission Notes & Verification Checklist
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Invoices matched with GSTR-2B, challan tax payments verified against bank debit..."
            className="w-full text-xs p-3 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading} className="text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
            className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
          >
            Submit for Review
          </Button>
        </div>
      </form>
    </Modal>
  );
}
