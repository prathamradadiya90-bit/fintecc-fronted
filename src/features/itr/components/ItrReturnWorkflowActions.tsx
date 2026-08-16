import React, { useState } from 'react';
import {
  ShieldCheck,
  Send,
  CheckCircle2,
  Download,
  Database,
  Loader2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useValidateReturnMutation,
  useSubmitReturnMutation,
  useEVerifyReturnMutation,
  usePrefillDataMutation,
  useLazyGetAcknowledgementQuery,
} from '@/lib/store/api/itrApi';
import type { ItrReturn, ItrPrefillData } from '@/lib/types/itr.types';

interface ItrReturnWorkflowActionsProps {
  itrReturn: ItrReturn;
  onPrefillFetched?: (data: ItrPrefillData) => void;
  onValidationSuccess?: (result: { isValid: boolean; message: string }) => void;
}

export const ItrReturnWorkflowActions: React.FC<ItrReturnWorkflowActionsProps> = ({
  itrReturn,
  onPrefillFetched,
  onValidationSuccess,
}) => {
  const [validateReturnApi, { isLoading: isValidating }] = useValidateReturnMutation();
  const [submitReturnApi, { isLoading: isSubmitting }] = useSubmitReturnMutation();
  const [eVerifyReturnApi, { isLoading: isEVerifying }] = useEVerifyReturnMutation();
  const [prefillDataApi, { isLoading: isFetchingPrefill }] = usePrefillDataMutation();
  const [fetchAckQuery, { isFetching: isFetchingAck }] = useLazyGetAcknowledgementQuery();

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const clearMessages = () => {
    setActionError(null);
    setActionSuccess(null);
  };

  // 1. Fetch Prefill Data (26AS / AIS / TIS)
  const handleFetchPrefill = async () => {
    clearMessages();
    try {
      const res = await prefillDataApi({
        clientId: itrReturn.clientId,
        assessmentYear: itrReturn.assessmentYear,
      }).unwrap();
      setActionSuccess('Prefill 26AS/AIS data fetched successfully!');
      if (onPrefillFetched && res?.data) {
        onPrefillFetched(res.data);
      }
    } catch (err: any) {
      setActionError(err?.data?.message || 'Failed to fetch prefill data from ITD portal');
    }
  };

  // 2. Validate Return
  const handleValidate = async () => {
    clearMessages();
    try {
      const res = await validateReturnApi(itrReturn.id).unwrap();
      setActionSuccess(res?.data?.message || 'ITR return validated successfully with zero errors!');
      if (onValidationSuccess && res?.data) {
        onValidationSuccess(res.data);
      }
    } catch (err: any) {
      setActionError(err?.data?.message || 'Validation failed. Please check form data.');
    }
  };

  // 3. Submit Return to ITD Portal
  const handleSubmit = async () => {
    clearMessages();
    const confirmed = window.confirm(
      'Are you sure you want to submit this ITR return to the Income Tax Department portal?'
    );
    if (!confirmed) return;

    try {
      const res = await submitReturnApi(itrReturn.id).unwrap();
      setActionSuccess(
        `ITR filed successfully! Ack Number: ${res?.data?.acknowledgementNumber || 'Generated'}`
      );
    } catch (err: any) {
      setActionError(err?.data?.message || 'Failed to submit ITR return');
    }
  };

  // 4. e-Verify Return
  const handleEVerify = async () => {
    clearMessages();
    try {
      const res = await eVerifyReturnApi(itrReturn.id).unwrap();
      setActionSuccess('ITR return successfully e-Verified on the ITD portal!');
    } catch (err: any) {
      setActionError(err?.data?.message || 'Failed to e-Verify return');
    }
  };

  // 5. Download Acknowledgement Receipt
  const handleDownloadAck = async () => {
    clearMessages();
    try {
      const res = await fetchAckQuery(itrReturn.id).unwrap();
      if (res?.data?.receiptUrl) {
        window.open(res.data.receiptUrl, '_blank');
      } else {
        setActionSuccess('Acknowledgement verified. Document receipt ready.');
      }
    } catch (err: any) {
      setActionError(err?.data?.message || 'Failed to retrieve acknowledgement receipt');
    }
  };

  const status = itrReturn.status;
  const isPrepared = status === 'PREPARED' || status === 'DRAFT';
  const isValidated = status === 'VALIDATED';
  const isFiled = status === 'FILED';
  const isEVerified = status === 'E_VERIFIED';

  return (
    <div
      className="p-5 rounded-2xl border space-y-4"
      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)' }}>
            ITR Filing Actions & Portal Operations
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Execute step-by-step ITD sandbox / e-filing operations for this return
          </p>
        </div>
      </div>

      {/* Messages */}
      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs flex items-center gap-2 text-red-800 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {/* Step: Fetch Prefill */}
        <Button
          variant="outline"
          onClick={handleFetchPrefill}
          disabled={isFetchingPrefill}
          leftIcon={
            isFetchingPrefill ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#00C2B3]" />
            ) : (
              <Database className="w-4 h-4 text-[#00C2B3]" />
            )
          }
        >
          {isFetchingPrefill ? 'Fetching 26AS...' : 'Fetch Prefill Data'}
        </Button>

        {/* Step: Validate */}
        <Button
          variant={isPrepared ? 'primary' : 'outline'}
          onClick={handleValidate}
          disabled={isValidating || isFiled || isEVerified}
          leftIcon={
            isValidating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )
          }
        >
          {isValidating ? 'Validating...' : isValidated ? 'Re-Validate Schema' : 'Validate Return'}
        </Button>

        {/* Step: Submit Return */}
        <Button
          variant={isValidated ? 'primary' : 'outline'}
          onClick={handleSubmit}
          disabled={!isValidated || isSubmitting || isFiled || isEVerified}
          leftIcon={
            isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )
          }
        >
          {isSubmitting ? 'Submitting to ITD...' : 'Submit to ITD Portal'}
        </Button>

        {/* Step: e-Verify */}
        <Button
          variant={isFiled ? 'primary' : 'outline'}
          onClick={handleEVerify}
          disabled={!isFiled || isEVerifying || isEVerified}
          leftIcon={
            isEVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )
          }
        >
          {isEVerifying ? 'e-Verifying...' : isEVerified ? 'e-Verified' : 'e-Verify Return'}
        </Button>

        {/* Step: Download Acknowledgement */}
        {(isFiled || isEVerified || itrReturn.acknowledgementNumber) && (
          <Button
            variant="outline"
            onClick={handleDownloadAck}
            disabled={isFetchingAck}
            leftIcon={
              isFetchingAck ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-teal-600" />
              )
            }
          >
            {isFetchingAck ? 'Loading Ack...' : 'ITR-V Acknowledgement'}
          </Button>
        )}
      </div>
    </div>
  );
};
