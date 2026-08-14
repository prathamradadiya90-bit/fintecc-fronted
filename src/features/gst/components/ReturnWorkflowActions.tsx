import React, { useState } from 'react';
import {
  Calculator,
  Send,
  CheckCircle2,
  Download,
  UploadCloud,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useComputeReturnMutation,
  useSubmitForApprovalMutation,
  useClientApproveMutation,
  useFileReturnMutation,
} from '@/lib/store/api/gstApi';
import { MarkFiledModal } from './MarkFiledModal';
import type { GstReturn } from '@/lib/types/gst.types';

interface ReturnWorkflowActionsProps {
  gstReturn: GstReturn;
  onRefresh?: () => void;
}

export const ReturnWorkflowActions: React.FC<ReturnWorkflowActionsProps> = ({
  gstReturn,
  onRefresh,
}) => {
  const [isMarkFiledOpen, setIsMarkFiledOpen] = useState(false);

  const [computeReturnApi, { isLoading: isComputing }] = useComputeReturnMutation();
  const [submitForApprovalApi, { isLoading: isSubmitting }] = useSubmitForApprovalMutation();
  const [clientApproveApi, { isLoading: isApproving }] = useClientApproveMutation();
  const [fileReturnApi, { isLoading: isFiling }] = useFileReturnMutation();

  const handleCompute = async () => {
    try {
      await computeReturnApi(gstReturn.id).unwrap();
      onRefresh?.();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to compute return liabilities');
    }
  };

  const handleSubmitForReview = async () => {
    try {
      await submitForApprovalApi(gstReturn.id).unwrap();
      onRefresh?.();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to submit return for review');
    }
  };

  const handleClientApprove = async () => {
    try {
      await clientApproveApi(gstReturn.id).unwrap();
      onRefresh?.();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to approve return');
    }
  };

  const handleFileViaGsp = async () => {
    try {
      await fileReturnApi(gstReturn.id).unwrap();
      onRefresh?.();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to file return via GSP API');
    }
  };

  const handleDownloadJson = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiBaseUrl}/gst/returns/${gstReturn.id}/export-json`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to export JSON file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GST_${gstReturn.returnType}_${gstReturn.period}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download JSON filing package');
    }
  };

  return (
    <div
      className="p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3"
      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
          Filing Workflow Actions:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* 1. Compute Tax (Available for DRAFT / READY_FOR_REVIEW) */}
        {gstReturn.status !== 'FILED' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompute}
            isLoading={isComputing}
            leftIcon={<Calculator className="w-3.5 h-3.5 text-indigo-600" />}
          >
            Compute Liabilities
          </Button>
        )}

        {/* 2. Submit for Review (if DRAFT) */}
        {gstReturn.status === 'DRAFT' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSubmitForReview}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-3.5 h-3.5 text-blue-600" />}
          >
            Submit for Review
          </Button>
        )}

        {/* 3. Client Approve (if READY_FOR_REVIEW) */}
        {gstReturn.status === 'READY_FOR_REVIEW' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleClientApprove}
            isLoading={isApproving}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Client Approve
          </Button>
        )}

        {/* 4. GSP API Direct File (if CLIENT_APPROVED) */}
        {gstReturn.status === 'CLIENT_APPROVED' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleFileViaGsp}
            isLoading={isFiling}
            leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
          >
            File via GSP API
          </Button>
        )}

        {/* 5. Mark Filed manually (if CLIENT_APPROVED) */}
        {gstReturn.status === 'CLIENT_APPROVED' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMarkFiledOpen(true)}
            leftIcon={<CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Mark Filed (Manual)
          </Button>
        )}

        {/* 6. Export JSON (Always available) */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadJson}
          leftIcon={<Download className="w-3.5 h-3.5 text-slate-600" />}
        >
          Export JSON
        </Button>
      </div>

      <MarkFiledModal
        isOpen={isMarkFiledOpen}
        onClose={() => setIsMarkFiledOpen(false)}
        returnId={gstReturn.id}
      />
    </div>
  );
};
