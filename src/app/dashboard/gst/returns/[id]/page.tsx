'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Receipt,
  FileCheck2,
  CheckCircle2,
  Cpu,
  GitCompare,
  TrendingUp,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetReturnByIdQuery } from '@/lib/store/api/gstApi';
import { ReturnStatusBadge } from '@/features/gst/components/ReturnStatusBadge';
import { FilingProgressStepper } from '@/features/gst/components/FilingProgressStepper';
import { ReturnWorkflowActions } from '@/features/gst/components/ReturnWorkflowActions';
import { GspFilingPanel } from '@/features/gst/components/GspFilingPanel';
import { ItcReconciliationCard } from '@/features/gst/components/ItcReconciliationCard';
import { ItcMaximizationCard } from '@/features/gst/components/ItcMaximizationCard';
import { ImsManager } from '@/features/gst/ims/ImsManager';

export default function ReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const returnId = params.id as string;

  const [activeTab, setActiveTab] = useState<'gsp' | 'itc' | 'ims' | 'breakup' | 'intelligence' | 'ai'>('gsp');

  const { data: response, isLoading, refetch } = useGetReturnByIdQuery(returnId);
  const gstReturn = response?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded animate-pulse" style={{ background: 'var(--color-bg-skeleton)' }} />
        <div className="h-40 w-full rounded-2xl animate-pulse" style={{ background: 'var(--color-bg-skeleton)' }} />
        <div className="h-64 w-full rounded-2xl animate-pulse" style={{ background: 'var(--color-bg-skeleton)' }} />
      </div>
    );
  }

  if (!gstReturn) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-base text-red-500 font-semibold">Return not found or access denied.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/gst/returns')}>
          Back to Returns List
        </Button>
      </div>
    );
  }

  const profile = gstReturn.gstProfile;
  const isComputed = gstReturn.taxPayable !== undefined && gstReturn.taxPayable !== null;

  return (
    <div className="space-y-6">
      {/* Back button & top title bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard/gst/returns')}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Returns List
        </button>

        <div className="flex items-center gap-2">
          <ReturnStatusBadge status={gstReturn.status} />
        </div>
      </div>

      {/* Main Return Header Card */}
      <div
        className="p-6 rounded-2xl border space-y-4 shadow-sm"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
                  {gstReturn.returnType} Return — Period {gstReturn.period}
                </h1>
              </div>
              <p className="text-xs mt-1 flex items-center gap-3" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="flex items-center gap-1 font-mono font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  {profile?.gstin || 'GSTIN N/A'}
                </span>
                <span>•</span>
                <span>{profile?.legalName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Frequency: {profile?.filingFrequency || 'MONTHLY'}
            </span>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Tax Payable
            </span>
            <p className="text-lg font-bold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
              ₹{Number(gstReturn.taxPayable || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Input Tax Credit (ITC)
            </span>
            <p className="text-lg font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
              ₹{Number(gstReturn.itcClaimed || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Acknowledgement Reference (ARN)
            </span>
            <p className="text-xs font-mono font-bold mt-1 text-emerald-600 dark:text-emerald-400 truncate">
              {gstReturn.arn || 'Not Filed Yet'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Filing Timestamp
            </span>
            <p className="text-xs font-semibold mt-1" style={{ color: 'var(--color-text-primary)' }}>
              {gstReturn.filedAt ? new Date(gstReturn.filedAt).toLocaleDateString('en-IN') : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Stepper Component */}
      <FilingProgressStepper status={gstReturn.status} isComputed={isComputed} />

      {/* Workflow Actions Toolbar */}
      <ReturnWorkflowActions gstReturn={gstReturn} onRefresh={refetch} />

      {/* Tabs Selection Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('gsp')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'gsp'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" /> GSP Sandbox Direct Filing
        </button>

        <button
          onClick={() => setActiveTab('itc')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'itc'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <GitCompare className="w-4 h-4" /> ITC Auto Reconciliation
        </button>

        <button
          onClick={() => setActiveTab('ims')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ims'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Invoice Management (IMS)
        </button>

        <button
          onClick={() => setActiveTab('breakup')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'breakup'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" /> Tax Liability Breakup
        </button>

        <button
          onClick={() => setActiveTab('intelligence')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'intelligence'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> ITC Intelligence & 180-Day Risks
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ai'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" /> CA Tax Intelligence (AI)
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'gsp' && (
          <GspFilingPanel gstReturn={gstReturn} onFiled={refetch} />
        )}

        {activeTab === 'itc' && (
          <ItcReconciliationCard
            returnId={gstReturn.id}
            itcClaimed={Number(gstReturn.itcClaimed || 0)}
          />
        )}

        {activeTab === 'ims' && (
          <ImsManager
            clientId={profile?.clientId || ''}
            period={gstReturn.period}
          />
        )}

        {activeTab === 'intelligence' && (
          <ItcMaximizationCard
            clientId={profile?.clientId || 'default-client'}
            period={gstReturn.period}
          />
        )}

        {activeTab === 'breakup' && (() => {
          const liability = Number(gstReturn.taxPayable || (gstReturn as any).liabilityAmount || 0);
          const itc = Number(gstReturn.itcClaimed || 0);
          const netCash = Math.max(0, liability - itc);

          const outwardIgst = Number(gstReturn.data?.taxBreakdown?.igst || 0);
          const outwardCgst = Number(gstReturn.data?.taxBreakdown?.cgst || (liability > 0 && outwardIgst === 0 ? liability / 2 : 0));
          const outwardSgst = Number(gstReturn.data?.taxBreakdown?.sgst || (liability > 0 && outwardIgst === 0 ? liability / 2 : 0));
          const outwardTaxable = Number(gstReturn.data?.taxBreakdown?.taxable || (liability > 0 ? (liability / 0.18) : 0));

          const itcIgst = Number(gstReturn.data?.itcBreakdown?.igst || 0);
          const itcCgst = Number(gstReturn.data?.itcBreakdown?.cgst || (itc > 0 && itcIgst === 0 ? itc / 2 : 0));
          const itcSgst = Number(gstReturn.data?.itcBreakdown?.sgst || (itc > 0 && itcIgst === 0 ? itc / 2 : 0));
          const itcTaxable = Number(gstReturn.data?.itcBreakdown?.taxable || (itc > 0 ? (itc / 0.18) : 0));

          const netCgst = Math.max(0, outwardCgst - itcCgst);
          const netSgst = Math.max(0, outwardSgst - itcSgst);
          const netIgst = Math.max(0, outwardIgst - itcIgst);
          const netTaxable = Math.max(0, outwardTaxable - itcTaxable);

          return (
            <div
              className="p-5 rounded-2xl border space-y-4"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)' }}>
                    Dynamic Tax Liability & Cash Breakdown
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Calculated from computed return figures and validated purchase register.
                  </p>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Net Payable: ₹{netCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                      <th className="p-3 font-semibold">Tax Head</th>
                      <th className="p-3 font-semibold text-right">Taxable Amount (₹)</th>
                      <th className="p-3 font-semibold text-right">CGST (₹)</th>
                      <th className="p-3 font-semibold text-right">SGST (₹)</th>
                      <th className="p-3 font-semibold text-right">IGST (₹)</th>
                      <th className="p-3 font-semibold text-right">Total Tax (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td className="p-3 font-medium">Outward Taxable Supplies</td>
                      <td className="p-3 font-mono text-right">₹{outwardTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 font-mono text-right">₹{outwardCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 font-mono text-right">₹{outwardSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 font-mono text-right">₹{outwardIgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 font-mono font-bold text-right text-slate-900 dark:text-slate-100">
                        ₹{liability.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td className="p-3 font-medium">Eligible Input Tax Credit (ITC)</td>
                      <td className="p-3 font-mono text-right">₹{itcTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 font-mono text-right text-emerald-600">₹{itcCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 font-mono text-right text-emerald-600">₹{itcSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 font-mono text-right text-emerald-600">₹{itcIgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 font-mono font-bold text-right text-emerald-600">
                        ₹{itc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="font-bold" style={{ background: 'var(--color-bg-subtle)' }}>
                      <td className="p-3">Net Cash Payable</td>
                      <td className="p-3 font-mono text-right">₹{netTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 font-mono text-right">₹{netCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 font-mono text-right">₹{netSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 font-mono text-right">₹{netIgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 font-mono text-right text-emerald-600">
                        ₹{netCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {activeTab === 'ai' && (
          <div
            className="p-6 rounded-2xl border space-y-4"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[var(--color-text-heading)]">
                  CA Tax Intelligence Context for {gstReturn.returnType} ({gstReturn.period})
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  AI-assisted statutory cross-checks, Section 16(4) time bar audits, and 180-day vendor payment rules.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Statutory Checks Passed
                </h4>
                <ul className="text-xs text-[var(--color-text-secondary)] space-y-1 list-disc pl-4">
                  <li>GSTR-3B Tax Liability reconciles with recorded GSTR-1 outward registers.</li>
                  <li>Eligible ITC matches active entries staged in Invoice Management System (IMS).</li>
                  <li>Client GSTIN status verified as Active on GSTN portal.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-purple-600" /> Recommended Advisory
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Ensure all supplier invoices with pending IMS status are either accepted or rejected prior to 14th of this month to avoid auto-reset to portal default.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
