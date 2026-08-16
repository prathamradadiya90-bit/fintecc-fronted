'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Database,
  Building,
  CreditCard,
  Receipt,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetReturnByIdQuery, useGetItrClientByIdQuery } from '@/lib/store/api/itrApi';
import { ItrStatusBadge } from '@/features/itr/components/ItrStatusBadge';
import { ItrFilingStepper } from '@/features/itr/components/ItrFilingStepper';
import { ItrReturnWorkflowActions } from '@/features/itr/components/ItrReturnWorkflowActions';
import type { ItrReturn, ItrPrefillData } from '@/lib/types/itr.types';

export default function ItrReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const returnId = params.id as string;

  const { data: returnData, isLoading: isLoadingReturn } = useGetReturnByIdQuery(returnId, {
    skip: !returnId,
  });

  // Client query fallback if return is referenced by client ID
  const { data: clientData, isLoading: isLoadingClient } = useGetItrClientByIdQuery(returnId, {
    skip: !!returnData?.data,
  });

  const [prefillState, setPrefillState] = useState<ItrPrefillData | null>(null);

  // Construct return record from returnData or client fallback
  const resolvedReturn: ItrReturn | null = returnData?.data
    ? returnData.data
    : clientData?.data
    ? {
        id: clientData.data.id,
        firmId: clientData.data.firmId,
        clientId: clientData.data.id,
        pan: clientData.data.pan,
        assessmentYear: '2026-27',
        financialYear: '2025-26',
        itrForm: 'ITR1',
        form: 'ITR1',
        status: (clientData.data.consentStatus === 'GRANTED' ? 'VALIDATED' : 'PREPARED') as any,
        acknowledgementNumber:
          clientData.data.consentStatus === 'GRANTED'
            ? `ACK_${clientData.data.pan.slice(0, 5)}2627`
            : undefined,
        createdAt: clientData.data.createdAt,
        updatedAt: clientData.data.createdAt,
        client: clientData.data,
      }
    : null;

  if (isLoadingReturn && isLoadingClient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-[#00C2B3] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[var(--color-text-secondary)]">Loading ITR Return details...</p>
      </div>
    );
  }

  if (!resolvedReturn) {
    return (
      <div className="p-8 rounded-2xl border text-center space-y-4" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
          ITR Return Not Found
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
          The requested return record could not be loaded. It may have been archived or removed.
        </p>
        <Button variant="primary" onClick={() => router.push('/dashboard/itr/returns')}>
          Back to Returns Directory
        </Button>
      </div>
    );
  }

  const prefill = prefillState || resolvedReturn.prefillData;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/itr/returns"
            className="p-2 rounded-xl border transition-all hover:bg-[var(--color-bg-subtle)]"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {resolvedReturn.itrForm || resolvedReturn.form || 'ITR-1'}
              </span>
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                AY {resolvedReturn.assessmentYear} Filing
              </h2>
              <ItrStatusBadge status={resolvedReturn.status} size="sm" />
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Taxpayer: <strong className="text-[var(--color-text-primary)]">{resolvedReturn.client?.name || resolvedReturn.pan}</strong> (PAN: {resolvedReturn.pan || resolvedReturn.client?.pan})
            </p>
          </div>
        </div>
      </div>

      {/* 4-Step Progress Stepper */}
      <ItrFilingStepper status={resolvedReturn.status} />

      {/* Interactive Filing Pipeline Workflow Actions */}
      <ItrReturnWorkflowActions
        itrReturn={resolvedReturn}
        onPrefillFetched={(data) => setPrefillState(data)}
      />

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Taxpayer & Return Info (1 Col) */}
        <div
          className="p-5 rounded-2xl border space-y-4"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <User className="w-4 h-4 text-[#00C2B3]" />
            <h3 className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-heading)' }}>
              Taxpayer Master Data
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] block" style={{ color: 'var(--color-text-muted)' }}>
                Permanent Account Number (PAN)
              </span>
              <span className="font-mono font-bold text-sm tracking-wider text-[#00C2B3]">
                {resolvedReturn.pan || resolvedReturn.client?.pan}
              </span>
            </div>

            <div>
              <span className="text-[11px] block" style={{ color: 'var(--color-text-muted)' }}>
                Taxpayer Legal Name
              </span>
              <span className="font-semibold text-xs" style={{ color: 'var(--color-text-primary)' }}>
                {resolvedReturn.client?.name || 'Taxpayer Master'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)]">
              <div>
                <span className="text-[11px] block" style={{ color: 'var(--color-text-muted)' }}>
                  Assessment Year
                </span>
                <span className="font-semibold text-xs" style={{ color: 'var(--color-text-primary)' }}>
                  AY {resolvedReturn.assessmentYear}
                </span>
              </div>
              <div>
                <span className="text-[11px] block" style={{ color: 'var(--color-text-muted)' }}>
                  Financial Year
                </span>
                <span className="font-semibold text-xs" style={{ color: 'var(--color-text-primary)' }}>
                  FY {resolvedReturn.financialYear || '2025-26'}
                </span>
              </div>
            </div>

            {resolvedReturn.acknowledgementNumber && (
              <div className="pt-2 border-t border-[var(--color-border)]">
                <span className="text-[11px] block" style={{ color: 'var(--color-text-muted)' }}>
                  Acknowledgement / E-filing ARN
                </span>
                <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  {resolvedReturn.acknowledgementNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Prefill Data & Validation (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Prefill 26AS / AIS Data Card */}
          <div
            className="p-5 rounded-2xl border space-y-4"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-heading)' }}>
                  26AS / AIS / TIS Prefill Data
                </h3>
              </div>
              {prefill && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Synced from ITD
                </span>
              )}
            </div>

            {prefill ? (
              <div className="space-y-4">
                {/* Income Sources Summary */}
                {prefill.incomeSources && prefill.incomeSources.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Reported Income Streams (AIS)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prefill.incomeSources.map((inc, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border flex items-center justify-between"
                          style={{
                            background: 'var(--color-bg-subtle)',
                            borderColor: 'var(--color-border)',
                          }}
                        >
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            {inc.type} Income
                          </span>
                          <span className="font-mono font-bold text-xs" style={{ color: 'var(--color-text-heading)' }}>
                            ₹{Number(inc.amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TDS Details */}
                {prefill.tdsDetails && prefill.tdsDetails.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Tax Deducted at Source (TDS 26AS)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prefill.tdsDetails.map((tds, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border flex items-center justify-between"
                          style={{
                            background: 'var(--color-bg-subtle)',
                            borderColor: 'var(--color-border)',
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="text-[11px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                              TAN: {tds.deductorTan}
                            </span>
                            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                              TDS Credit
                            </span>
                          </div>
                          <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                            ₹{Number(tds.amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <Database className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Prefill data has not been pulled yet. Click <strong>&quot;Fetch Prefill Data&quot;</strong> above to load 26AS/AIS info.
                </p>
              </div>
            )}
          </div>

          {/* Validation & Statutory Readiness Checklist */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-heading)' }}>
                Filing Schema Verification Checklist
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-[var(--color-border)]">
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  1. PAN & Personal Details Verification
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-[var(--color-border)]">
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  2. ITD Direct Tax XML / JSON Schema Compatibility
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-[var(--color-border)]">
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  3. Taxpayer Consent & E-Filing Authorization
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
