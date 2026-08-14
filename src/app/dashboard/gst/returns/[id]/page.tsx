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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetReturnByIdQuery } from '@/lib/store/api/gstApi';
import { ReturnStatusBadge } from '@/features/gst/components/ReturnStatusBadge';
import { FilingProgressStepper } from '@/features/gst/components/FilingProgressStepper';
import { ReturnWorkflowActions } from '@/features/gst/components/ReturnWorkflowActions';
import { GspFilingPanel } from '@/features/gst/components/GspFilingPanel';
import { ItcReconciliationCard } from '@/features/gst/components/ItcReconciliationCard';

export default function ReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const returnId = params.id as string;

  const [activeTab, setActiveTab] = useState<'gsp' | 'itc' | 'breakup'>('gsp');

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
          className="flex items-center gap-1.5 text-xs font-semibold text-[#00C2B3] hover:underline"
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
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#00C2B3]">
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
                  <Building2 className="w-3.5 h-3.5 text-[#00C2B3]" />
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
            <p className="text-xs font-mono font-bold mt-1 text-[#00C2B3] truncate">
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
      <div className="flex items-center gap-2 border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab('gsp')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'gsp'
              ? 'border-[#00C2B3] text-[#00C2B3]'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" /> GSP Sandbox Direct Filing
        </button>

        <button
          onClick={() => setActiveTab('itc')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'itc'
              ? 'border-[#00C2B3] text-[#00C2B3]'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <GitCompare className="w-4 h-4" /> ITC Auto Reconciliation
        </button>

        <button
          onClick={() => setActiveTab('breakup')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'breakup'
              ? 'border-[#00C2B3] text-[#00C2B3]'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" /> Tax Liability Breakup
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

        {activeTab === 'breakup' && (
          <div
            className="p-5 rounded-2xl border space-y-4"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)' }}>
              Summary Tax Liability Breakdown
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                    <th className="p-3 font-semibold">Tax Head</th>
                    <th className="p-3 font-semibold">Taxable Amount (₹)</th>
                    <th className="p-3 font-semibold">CGST (₹)</th>
                    <th className="p-3 font-semibold">SGST (₹)</th>
                    <th className="p-3 font-semibold">IGST (₹)</th>
                    <th className="p-3 font-semibold">Total Tax (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="p-3 font-medium">Outward Taxable Supplies</td>
                    <td className="p-3 font-mono">₹1,00,000.00</td>
                    <td className="p-3 font-mono">₹9,000.00</td>
                    <td className="p-3 font-mono">₹9,000.00</td>
                    <td className="p-3 font-mono">₹0.00</td>
                    <td className="p-3 font-mono font-bold text-teal-600">₹18,000.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="p-3 font-medium">Eligible Input Tax Credit (ITC)</td>
                    <td className="p-3 font-mono">₹60,000.00</td>
                    <td className="p-3 font-mono text-emerald-600">₹5,400.00</td>
                    <td className="p-3 font-mono text-emerald-600">₹5,400.00</td>
                    <td className="p-3 font-mono text-emerald-600">₹0.00</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">₹10,800.00</td>
                  </tr>
                  <tr className="font-bold" style={{ background: 'var(--color-bg-subtle)' }}>
                    <td className="p-3">Net Cash Payable</td>
                    <td className="p-3 font-mono">₹40,000.00</td>
                    <td className="p-3 font-mono">₹3,600.00</td>
                    <td className="p-3 font-mono">₹3,600.00</td>
                    <td className="p-3 font-mono">₹0.00</td>
                    <td className="p-3 font-mono text-teal-600">₹7,200.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
