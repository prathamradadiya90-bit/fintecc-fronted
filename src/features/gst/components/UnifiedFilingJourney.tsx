'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Send,
  CheckCircle2,
  Download,
  UploadCloud,
  CheckCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
  Copy,
  FileCheck2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useComputeReturnMutation,
  useSubmitForApprovalMutation,
  useClientApproveMutation,
  useFileReturnMutation,
  usePrepareGstr1Mutation,
  useValidateGstr1Mutation,
  usePrepareGstr3bMutation,
  useValidateGstr3bMutation,
} from '@/lib/store/api/gstApi';
import { PreFilingAuditModal } from './PreFilingAuditModal';
import { MarkFiledModal } from './MarkFiledModal';
import type { GstReturn } from '@/lib/types/gst.types';

interface UnifiedFilingJourneyProps {
  gstReturn: GstReturn;
  onRefresh?: () => void;
}

export const UnifiedFilingJourney: React.FC<UnifiedFilingJourneyProps> = ({
  gstReturn,
  onRefresh,
}) => {
  const [isMarkFiledOpen, setIsMarkFiledOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [copiedArn, setCopiedArn] = useState(false);
  const [payloadValidated, setPayloadValidated] = useState<boolean | null>(null);

  // APIs
  const [computeReturnApi, { isLoading: isComputing }] = useComputeReturnMutation();
  const [submitForApprovalApi, { isLoading: isSubmitting }] = useSubmitForApprovalMutation();
  const [clientApproveApi, { isLoading: isApproving }] = useClientApproveMutation();
  const [fileReturnApi, { isLoading: isFiling }] = useFileReturnMutation();

  const [prepareGstr1Api, { isLoading: isPreparingG1 }] = usePrepareGstr1Mutation();
  const [validateGstr1Api, { isLoading: isValidatingG1 }] = useValidateGstr1Mutation();
  const [prepareGstr3bApi, { isLoading: isPreparing3B }] = usePrepareGstr3bMutation();
  const [validateGstr3bApi, { isLoading: isValidating3B }] = useValidateGstr3bMutation();

  const isPreparingOrValidating = isPreparingG1 || isValidatingG1 || isPreparing3B || isValidating3B;

  const clientId = gstReturn.gstProfile?.clientId || (gstReturn as any).clientId || gstReturn.gstProfileId || '';
  const isGstr1 = gstReturn.returnType?.replace('-', '').toUpperCase() === 'GSTR1';
  const isComputed = gstReturn.taxPayable !== undefined && gstReturn.taxPayable !== null;
  const isApproved = gstReturn.status === 'CLIENT_APPROVED' || gstReturn.status === 'FILED';
  const isFiled = gstReturn.status === 'FILED';

  const formatApiError = (err: any, fallback: string) => {
    if (err?.data?.errors && Array.isArray(err.data.errors) && err.data.errors.length > 0) {
      return err.data.errors.map((e: any) => `${e.field ? `${e.field}: ` : ''}${e.message}`).join('\n');
    }
    const msg = err?.data?.message || err?.message;
    if (msg && !msg.toLowerCase().includes('validation error')) {
      return msg;
    }
    return fallback;
  };

  const handleCompute = async () => {
    try {
      await computeReturnApi(gstReturn.id).unwrap();
      onRefresh?.();
    } catch (err: any) {
      alert(formatApiError(err, 'Failed to compute return liabilities'));
    }
  };

  const handleValidatePayload = async () => {
    if (!clientId) {
      alert('Client identifier not found for this GST return.');
      return;
    }
    try {
      if (isGstr1) {
        await prepareGstr1Api({ clientId, period: gstReturn.period }).unwrap();
        const valRes = await validateGstr1Api({ clientId, period: gstReturn.period }).unwrap();
        setPayloadValidated(valRes?.data?.isValid ?? true);
      } else {
        await prepareGstr3bApi({ clientId, period: gstReturn.period }).unwrap();
        const valRes = await validateGstr3bApi({ clientId, period: gstReturn.period }).unwrap();
        setPayloadValidated(valRes?.data?.isValid ?? true);
      }
      onRefresh?.();
    } catch (err: any) {
      alert(formatApiError(err, 'Failed to validate GSTN return payload'));
    }
  };

  const handleSubmitForReview = async () => {
    try {
      await submitForApprovalApi(gstReturn.id).unwrap();
      onRefresh?.();
    } catch (err: any) {
      alert(formatApiError(err, 'Failed to submit return for review'));
    }
  };

  const handleClientApprove = async () => {
    try {
      await clientApproveApi(gstReturn.id).unwrap();
      onRefresh?.();
    } catch (err: any) {
      alert(formatApiError(err, 'Failed to approve return'));
    }
  };

  const handleFileViaGsp = async () => {
    try {
      await fileReturnApi(gstReturn.id).unwrap();
      onRefresh?.();
    } catch (err: any) {
      alert(formatApiError(err, 'Failed to file return via GSP API'));
    }
  };

  const handleDownloadJson = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiBaseUrl}/gst/returns/${gstReturn.id}/export-json`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
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
    } catch {
      alert('Failed to download JSON filing package');
    }
  };

  const handleCopyArn = () => {
    if (gstReturn.arn) {
      navigator.clipboard.writeText(gstReturn.arn);
      setCopiedArn(true);
      setTimeout(() => setCopiedArn(false), 2000);
    }
  };

  // Determine Current Step and Next Recommended Action
  let currentStep = 1;
  let nextActionLabel = 'Compute Liabilities';
  let nextActionDesc = 'Calculate tax payable and input tax credits from ledger transactions.';
  let nextActionFn = handleCompute;
  let isNextActionLoading = isComputing;

  if (isFiled) {
    currentStep = 5;
    nextActionLabel = 'Return Successfully Filed';
    nextActionDesc = `Filing completed with ARN ${gstReturn.arn}`;
  } else if (gstReturn.status === 'CLIENT_APPROVED') {
    currentStep = 4;
    nextActionLabel = 'Transmit & File to GSTN (Generate ARN)';
    nextActionDesc = 'Return is client-approved and ready for direct filing to GSTN.';
    nextActionFn = handleFileViaGsp;
    isNextActionLoading = isFiling;
  } else if (gstReturn.status === 'READY_FOR_REVIEW') {
    currentStep = 3;
    nextActionLabel = 'Approve as Client';
    nextActionDesc = 'Review and record statutory client approval to enable portal transmission.';
    nextActionFn = handleClientApprove;
    isNextActionLoading = isApproving;
  } else if (payloadValidated || isComputed) {
    currentStep = 3;
    nextActionLabel = 'Submit for Review';
    nextActionDesc = 'Tax figures and payload are ready. Submit to client for review.';
    nextActionFn = handleSubmitForReview;
    isNextActionLoading = isSubmitting;
  } else if (isComputed) {
    currentStep = 2;
    nextActionLabel = 'Validate GSTN Payload';
    nextActionDesc = 'Format data into GSTN schema and run syntax checks.';
    nextActionFn = handleValidatePayload;
    isNextActionLoading = isPreparingOrValidating;
  }

  return (
    <div className="space-y-4">
      {/* ─── MASTER JOURNEY CARD ────────────────────────────────────────── */}
      <div
        className="p-5 rounded-2xl border space-y-5 shadow-sm"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Top Header: Title & Secondary Utilities */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                Filing Journey & GSTN Transmission
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Step-by-step statutory filing with automatic error prevention
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAuditModalOpen(true)}
              leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-blue-500" />}
              className="text-xs h-8"
            >
              30-Rule Diagnostics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadJson}
              leftIcon={<Download className="w-3.5 h-3.5 text-slate-500" />}
              className="text-xs h-8"
            >
              Offline JSON
            </Button>
            {!isFiled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMarkFiledOpen(true)}
                leftIcon={<CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
                className="text-xs h-8"
              >
                Mark Filed
              </Button>
            )}
          </div>
        </div>

        {/* ─── NEXT RECOMMENDED ACTION CALLOUT BANNER ────────────────────── */}
        {!isFiled ? (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Recommended Next Action (Step {currentStep} of 4)
                </span>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>
                  {nextActionLabel}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">{nextActionDesc}</p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={nextActionFn}
              isLoading={isNextActionLoading}
              className="shrink-0 font-bold px-6 py-2.5 text-xs shadow-md shadow-emerald-600/20"
              leftIcon={
                currentStep === 4 ? (
                  <UploadCloud className="w-4 h-4" />
                ) : currentStep === 3 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Calculator className="w-4 h-4" />
                )
              }
            >
              {nextActionLabel}
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-600 text-white">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  Return Successfully Transmitted & Filed to GSTN
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Acknowledgement Reference Number (ARN):{' '}
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {gstReturn.arn}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyArn}
                leftIcon={<Copy className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                {copiedArn ? 'Copied ARN!' : 'Copy ARN'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadJson}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Download Receipt
              </Button>
            </div>
          </div>
        )}

        {/* ─── 4 STEP INTERACTIVE CARDS ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          {/* Step 1: Compute */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 transition-all ${
              isComputed || isFiled
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : currentStep === 1
                ? 'border-emerald-500 bg-[var(--color-bg-card)] ring-2 ring-emerald-500/20'
                : 'border-[var(--color-border)] opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text-heading)]">1. Compute Tax</span>
              {isComputed || isFiled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                  Step 1
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Calculate outward supply taxes and claimable ITC.
            </p>
            {isComputed && (
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Payable: ₹{Number(gstReturn.taxPayable || 0).toLocaleString('en-IN')}
              </p>
            )}
            {!isFiled && (
              <Button
                variant={isComputed ? 'outline' : 'primary'}
                size="sm"
                onClick={handleCompute}
                isLoading={isComputing}
                className="w-full text-xs h-7 mt-1"
              >
                {isComputed ? 'Re-Compute' : 'Compute'}
              </Button>
            )}
          </div>

          {/* Step 2: Validate Payload */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 transition-all ${
              payloadValidated || isFiled
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : currentStep === 2
                ? 'border-emerald-500 bg-[var(--color-bg-card)] ring-2 ring-emerald-500/20'
                : 'border-[var(--color-border)] opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text-heading)]">2. Validate Schema</span>
              {payloadValidated || isFiled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                  Step 2
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Check HSN math and validate payload against GSTN schema.
            </p>
            {payloadValidated && (
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Schema Validated
              </p>
            )}
            {!isFiled && (
              <Button
                variant={payloadValidated ? 'outline' : 'primary'}
                size="sm"
                onClick={handleValidatePayload}
                isLoading={isPreparingOrValidating}
                className="w-full text-xs h-7 mt-1"
              >
                {payloadValidated ? 'Re-Validate' : 'Validate'}
              </Button>
            )}
          </div>

          {/* Step 3: Client Approval */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 transition-all ${
              isApproved || isFiled
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : currentStep === 3
                ? 'border-emerald-500 bg-[var(--color-bg-card)] ring-2 ring-emerald-500/20'
                : 'border-[var(--color-border)] opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text-heading)]">3. Client Approval</span>
              {isApproved || isFiled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                  Step 3
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Statutory verification by taxpayer before portal upload.
            </p>
            {isApproved && (
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Client Approved
              </p>
            )}
            {!isFiled && (
              <div>
                {gstReturn.status === 'READY_FOR_REVIEW' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleClientApprove}
                    isLoading={isApproving}
                    className="w-full text-xs h-7 mt-1 font-bold"
                  >
                    Client Approve
                  </Button>
                ) : gstReturn.status === 'CLIENT_APPROVED' ? (
                  <span className="text-[11px] text-emerald-600 font-semibold block text-center mt-2">
                    Ready to Transmit
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSubmitForReview}
                    isLoading={isSubmitting}
                    className="w-full text-xs h-7 mt-1"
                  >
                    Submit Review
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Step 4: Transmit & File */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 transition-all ${
              isFiled
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : currentStep === 4
                ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                : 'border-[var(--color-border)] opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text-heading)]">4. File to GSTN</span>
              {isFiled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                  Step 4
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Direct GSP transmission to generate official ARN.
            </p>
            {isFiled ? (
              <p className="text-[10px] font-mono font-bold text-emerald-600 truncate">
                ARN: {gstReturn.arn}
              </p>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleFileViaGsp}
                isLoading={isFiling}
                disabled={gstReturn.status !== 'CLIENT_APPROVED'}
                className="w-full text-xs h-7 mt-1 font-bold shadow-sm"
              >
                File to GSTN
              </Button>
            )}
          </div>
        </div>
      </div>

      <PreFilingAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        clientId={clientId}
        period={gstReturn.period}
      />

      <MarkFiledModal
        isOpen={isMarkFiledOpen}
        onClose={() => setIsMarkFiledOpen(false)}
        returnId={gstReturn.id}
      />
    </div>
  );
};
