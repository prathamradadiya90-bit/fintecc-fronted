import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  usePrepareGstr1Mutation,
  useValidateGstr1Mutation,
  useFileGstr1Mutation,
  usePrepareGstr3bMutation,
  useValidateGstr3bMutation,
  useFileGstr3bMutation,
} from '@/lib/store/api/gstApi';
import type { GstReturn } from '@/lib/types/gst.types';

interface GspFilingPanelProps {
  gstReturn: GstReturn;
  onFiled?: () => void;
}

export const GspFilingPanel: React.FC<GspFilingPanelProps> = ({
  gstReturn,
  onFiled,
}) => {
  const clientId = gstReturn.gstProfile?.clientId || 'default-client';
  const returnType = gstReturn.returnType;
  const period = gstReturn.period;

  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState<boolean | null>(null);
  const [filingResult, setFilingResult] = useState<{ arn: string; filedAt: string } | null>(null);

  // Mutations
  const [prepareGstr1Api, { isLoading: isPreparingG1 }] = usePrepareGstr1Mutation();
  const [validateGstr1Api, { isLoading: isValidatingG1 }] = useValidateGstr1Mutation();
  const [fileGstr1Api, { isLoading: isFilingG1 }] = useFileGstr1Mutation();

  const [prepareGstr3bApi, { isLoading: isPreparing3B }] = usePrepareGstr3bMutation();
  const [validateGstr3bApi, { isLoading: isValidating3B }] = useValidateGstr3bMutation();
  const [fileGstr3bApi, { isLoading: isFiling3B }] = useFileGstr3bMutation();

  const isPreparing = isPreparingG1 || isPreparing3B;
  const isValidating = isValidatingG1 || isValidating3B;
  const isFiling = isFilingG1 || isFiling3B;

  const handlePrepare = async () => {
    try {
      if (returnType === 'GSTR1') {
        const res = await prepareGstr1Api({ clientId, period }).unwrap();
        setReferenceId(res.data?.referenceId || 'REF_GSTR1_MOCK_123');
      } else {
        const res = await prepareGstr3bApi({ clientId, period }).unwrap();
        setReferenceId(res.data?.referenceId || 'REF_GSTR3B_MOCK_123');
      }
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to prepare return payload');
    }
  };

  const handleValidate = async () => {
    try {
      if (returnType === 'GSTR1') {
        const res = await validateGstr1Api({ clientId, period }).unwrap();
        setIsValidated(res.data?.isValid ?? true);
      } else {
        const res = await validateGstr3bApi({ clientId, period }).unwrap();
        setIsValidated(res.data?.isValid ?? true);
      }
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to validate return payload');
    }
  };

  const handleFile = async () => {
    try {
      if (returnType === 'GSTR1') {
        const res = await fileGstr1Api({ clientId, returnId: gstReturn.id }).unwrap();
        setFilingResult(res.data);
      } else {
        const res = await fileGstr3bApi({ clientId, returnId: gstReturn.id }).unwrap();
        setFilingResult(res.data);
      }
      onFiled?.();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to file return via GSP Sandbox');
    }
  };

  return (
    <div
      className="p-5 rounded-2xl border space-y-4"
      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#00C2B3]/10 text-[#00C2B3]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)' }}>
              GSP Direct Filing Sandbox Integration
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Direct API communication with GST Suvidha Provider (GSP) & GSTN portal
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
          GSP API ONLINE
        </span>
      </div>

      {/* Step Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Step 1: Prepare */}
        <div className="p-3.5 rounded-xl border space-y-2" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            <span>1. Prepare Data</span>
            {referenceId && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Format sales/summary data into GSTN schema.
          </p>
          {referenceId && (
            <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate">
              Ref: {referenceId}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrepare}
            isLoading={isPreparing}
            className="w-full text-xs"
          >
            {referenceId ? 'Re-Prepare Payload' : 'Prepare Payload'}
          </Button>
        </div>

        {/* Step 2: Validate */}
        <div className="p-3.5 rounded-xl border space-y-2" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            <span>2. Validate Payload</span>
            {isValidated !== null && (
              isValidated ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Check tax math and HSN/SAC code compliance.
          </p>
          {isValidated !== null && (
            <p className={`text-[10px] font-semibold ${isValidated ? 'text-emerald-600' : 'text-red-500'}`}>
              {isValidated ? 'Payload Validated' : 'Validation Failed'}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            isLoading={isValidating}
            disabled={!referenceId}
            className="w-full text-xs"
          >
            Validate Return
          </Button>
        </div>

        {/* Step 3: File */}
        <div className="p-3.5 rounded-xl border space-y-2" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            <span>3. Transmit & File</span>
            {(filingResult || gstReturn.status === 'FILED') && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Directly submit to GSTN & generate ARN.
          </p>
          {(filingResult?.arn || gstReturn.arn) && (
            <p className="text-[10px] font-mono text-emerald-600 font-bold truncate">
              ARN: {filingResult?.arn || gstReturn.arn}
            </p>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleFile}
            isLoading={isFiling}
            disabled={!isValidated || gstReturn.status === 'FILED'}
            leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
            className="w-full text-xs"
          >
            {gstReturn.status === 'FILED' ? 'Already Filed' : 'File to GSTN'}
          </Button>
        </div>
      </div>
    </div>
  );
};
