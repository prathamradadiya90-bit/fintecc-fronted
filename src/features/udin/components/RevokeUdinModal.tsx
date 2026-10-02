'use client';

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRevokeUdinMutation } from '@/lib/store/api/udinApi';
import { useToast } from '@/components/ui/Toast';
import type { UdinRecord } from '@/lib/types/udin.types';

interface RevokeUdinModalProps {
  isOpen: boolean;
  onClose: () => void;
  udin: UdinRecord | null;
}

export function RevokeUdinModal({ isOpen, onClose, udin }: RevokeUdinModalProps) {
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [revokeUdin, { isLoading }] = useRevokeUdinMutation();

  if (!isOpen || !udin) return null;

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please provide an official reason for revocation (ICAI mandate)', 'error');
      return;
    }

    try {
      await revokeUdin({ id: udin.id, reason: reason.trim() }).unwrap();
      showToast(`UDIN ${udin.udinNumber} has been marked as REVOKED`, 'success');
      onClose();
      setReason('');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to revoke UDIN', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md rounded-2xl border shadow-xl overflow-hidden transition-all"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-base font-bold text-rose-600 dark:text-rose-400">
              Revoke UDIN Registration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleRevoke} className="p-6 space-y-4">
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Are you sure you want to revoke UDIN{' '}
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {udin.udinNumber}
            </span>
            ? This action marks the certification as revoked in your audit register.
          </p>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Reason for Revocation <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Typographical error in figures, client superseded report, or document cancelled."
              required
              className="w-full p-2.5 rounded-xl border text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500"
              style={{
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Revocation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
