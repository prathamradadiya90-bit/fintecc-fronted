'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useVerifyGstPortalMutation } from '@/lib/store/api/tasksApi';
import { useToast } from '@/components/ui/Toast';
import { CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';
import type { Task, VerifyGstPortalData } from '@/lib/types/task.types';

interface VerifyGstPortalModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VerifyGstPortalModal({ task, isOpen, onClose }: VerifyGstPortalModalProps) {
  const { showToast } = useToast();
  const [verifyGstPortal, { isLoading }] = useVerifyGstPortalMutation();
  const [result, setResult] = useState<VerifyGstPortalData | null>(null);

  if (!task) return null;

  const handleVerify = async () => {
    try {
      const res = await verifyGstPortal(task.id).unwrap();
      setResult(res.data);
      if (res.data?.isFiled) {
        showToast('GST Return confirmed as FILED on the portal!', 'success');
      } else {
        showToast(res.data?.message || 'Return is not yet recorded as filed on the portal', 'info');
      }
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Portal check failed', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live GST Portal Filing Check" maxWidth="md">
      <div className="space-y-4">
        {/* Task Details */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-[#5A6E85]">
          <div className="font-semibold text-[#1E2A38] dark:text-slate-200 text-sm mb-1">
            {task.title}
          </div>
          <div>Client: {task.client?.name || 'Unassigned'}</div>
          {task.client?.gstin && <div>Client GSTIN: <code className="text-[#4A6FA5] font-mono">{task.client.gstin}</code></div>}
          {task.arn && <div>Recorded ARN: <code className="font-mono text-slate-700 dark:text-slate-300">{task.arn}</code></div>}
        </div>

        {/* Verification Status Card */}
        {result ? (
          <div
            className={`p-4 rounded-xl border ${
              result.isFiled
                ? 'bg-[rgba(61,122,100,0.08)] border-[#3D7A64]/30'
                : 'bg-[rgba(158,107,66,0.08)] border-[#9E6B42]/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.isFiled ? (
                <CheckCircle2 className="w-5 h-5 text-[#3D7A64]" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[#9E6B42]" />
              )}
              <span className={`text-sm font-bold ${result.isFiled ? 'text-[#3D7A64]' : 'text-[#9E6B42]'}`}>
                {result.isFiled ? 'Filing Verified on Portal' : 'Filing Not Confirmed'}
              </span>
            </div>

            <p className="text-xs text-[#5A6E85] mb-3 leading-relaxed">
              {result.message}
            </p>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5A6E85]">GSTIN:</span>
                <span className="font-mono font-medium text-[#1E2A38] dark:text-slate-200">{result.gstin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6E85]">Return Type:</span>
                <span className="font-medium text-[#1E2A38] dark:text-slate-200">{result.returnType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6E85]">Tax Period:</span>
                <span className="font-medium text-[#1E2A38] dark:text-slate-200">{result.period}</span>
              </div>
              {result.arn && (
                <div className="flex justify-between">
                  <span className="text-[#5A6E85]">Confirmed ARN:</span>
                  <span className="font-mono font-bold text-[#3D7A64]">{result.arn}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-[#4A6FA5] mx-auto opacity-80" />
            <p className="text-xs text-[#5A6E85] max-w-xs mx-auto">
              Query the GST portal database to verify return filing status and ARN before closing this task.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleVerify}
            isLoading={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
          >
            {result ? 'Re-check Status' : 'Check GST Portal'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
