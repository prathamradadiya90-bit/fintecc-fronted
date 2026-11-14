'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  ShieldCheck,
  ArrowRight,
  Building2,
  Receipt,
  FileSpreadsheet,
  Clock,
  Calendar,
  Calculator,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetProfilesQuery, useGetReturnsQuery } from '@/lib/store/api/gstApi';
import { GstOverviewStats } from '@/features/gst/components/GstOverviewStats';
import { ExportSalesButton } from '@/features/gst/components/ExportSalesButton';
import { GstProfilesTable } from '@/features/gst/components/GstProfilesTable';
import { CreateProfileModal } from '@/features/gst/components/CreateProfileModal';
import { EditProfileModal } from '@/features/gst/components/EditProfileModal';
import { VerifyGstinModal } from '@/features/gst/components/VerifyGstinModal';
import type { GstProfile } from '@/lib/types/gst.types';

function GstOverviewMainContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') || undefined;

  const { data: profilesData, isLoading: isLoadingProfiles } = useGetProfilesQuery(
    clientId ? { clientId, limit: 10 } : { limit: 10 }
  );
  const { data: returnsData, isLoading: isLoadingReturns } = useGetReturnsQuery(
    clientId ? { clientId, limit: 50 } : { limit: 50 }
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<GstProfile | null>(null);
  const [verifyingProfile, setVerifyingProfile] = useState<GstProfile | null>(null);
  const [isStandaloneVerifyOpen, setIsStandaloneVerifyOpen] = useState(false);

  const profiles = profilesData?.data || [];
  const totalProfiles = profilesData?.meta?.total || profiles.length;

  const returns = returnsData?.data || [];
  const totalReturns = returnsData?.meta?.total || returns.length;
  const filedReturns = returns.filter((r) => r.status === 'FILED').length;
  const pendingReturns = returns.filter((r) => r.status !== 'FILED').length;

  // Real statutory GST deadlines for the current month
  const now = new Date();
  const curMonth = now.toLocaleString('en-US', { month: 'short' });
  const curDay = now.getDate();

  const deadlines = [
    {
      code: 'GSTR-1',
      title: 'GSTR-1 Monthly Return',
      desc: 'Outward supplies for regular taxpayers (> ₹5 Cr turnover)',
      dueDay: 11,
      dueDate: `11 ${curMonth}`,
    },
    {
      code: 'IFF',
      title: 'IFF (Invoice Furnishing)',
      desc: 'B2B invoice upload for QRMP scheme taxpayers',
      dueDay: 13,
      dueDate: `13 ${curMonth}`,
    },
    {
      code: 'GSTR-3B',
      title: 'GSTR-3B Summary Return',
      desc: 'Tax liability payment & input tax credit claim',
      dueDay: 20,
      dueDate: `20 ${curMonth}`,
      highlight: true,
    },
    {
      code: 'PMT-06',
      title: 'PMT-06 Tax Challan',
      desc: 'Monthly tax deposit for QRMP scheme (M1/M2)',
      dueDay: 25,
      dueDate: `25 ${curMonth}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 3-Step Simple GST Workflow Guide */}
      <div className="rounded-2xl border p-4 sm:p-5" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              CA Practice Workflow
            </span>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Complete GST in 3 Simple Steps
            </h2>
          </div>
          <span className="text-xs text-[var(--color-text-secondary)]">
            Follow these steps to file compliant returns on time
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Step 1 */}
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex flex-col justify-between hover:border-emerald-500/40 transition-colors group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white dark:bg-slate-800 text-emerald-600 border border-emerald-500/20">
                  Step 01
                </span>
              </div>
              <h3 className="font-bold text-sm text-[var(--color-text-heading)] mb-1">
                Onboard Client GSTIN
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
                Add your client&apos;s 15-digit GSTIN to auto-fetch registration details, filing frequency, and portal status.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs h-7 px-2.5"
              >
                New Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStandaloneVerifyOpen(true)}
                leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                className="text-xs h-7 px-2"
              >
                Verify
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex flex-col justify-between hover:border-blue-500/40 transition-colors group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white dark:bg-slate-800 text-blue-600 border border-blue-500/20">
                  Step 02
                </span>
              </div>
              <h3 className="font-bold text-sm text-[var(--color-text-heading)] mb-1">
                Sync Invoices & Ledger
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
                Upload monthly sales/purchase Excel bills, sync Tally vouchers, or export audit-ready sales registers.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
              <Link
                href="/dashboard/gst/invoices"
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors h-7"
              >
                Invoices <ArrowRight className="w-3 h-3" />
              </Link>
              <ExportSalesButton year={now.getFullYear()} className="text-xs h-7 px-2" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex flex-col justify-between hover:border-purple-500/40 transition-colors group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white dark:bg-slate-800 text-purple-600 border border-purple-500/20">
                  Step 03
                </span>
              </div>
              <h3 className="font-bold text-sm text-[var(--color-text-heading)] mb-1">
                Reconcile ITC & File
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
                Match GSTR-2B against books in IMS portal, auto-populate GSTR-3B net tax liability, and submit returns.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
              <Link
                href="/dashboard/gst/returns"
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors h-7"
              >
                Returns Hub <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                href="/dashboard/gst/ims"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors h-7"
              >
                IMS Reco
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <GstOverviewStats
        totalProfiles={totalProfiles}
        totalReturns={totalReturns}
        filedReturns={filedReturns}
        pendingReturns={pendingReturns}
        isLoading={isLoadingProfiles || isLoadingReturns}
      />

      {/* 2-Column Split: Active Profiles + Deadlines/Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Profiles Table - 7 Cols) */}
        <div
          className="lg:col-span-8 p-5 rounded-2xl border space-y-4"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base" style={{ color: 'var(--color-text-heading)' }}>
                  Client GSTIN Profiles
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {totalProfiles} active
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Active client registrations with direct return filing shortcuts
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs h-7 px-2.5"
              >
                New Profile
              </Button>
              <Link
                href="/dashboard/gst/profiles"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <GstProfilesTable
            profiles={profiles}
            isLoading={isLoadingProfiles}
            onEdit={(profile) => setEditingProfile(profile)}
            onVerify={(profile) => setVerifyingProfile(profile)}
            onCreateProfile={() => setIsCreateModalOpen(true)}
          />
        </div>

        {/* Right Column (Deadlines & Quick Tools - 4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Statutory Deadlines Card */}
          <div
            className="p-5 rounded-2xl border space-y-4"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[var(--color-text-heading)]">
                    Upcoming GST Deadlines
                  </h4>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    Statutory Cutoffs ({curMonth} {now.getFullYear()})
                  </span>
                </div>
              </div>
              <Link
                href="/dashboard/gst/returns"
                className="text-[11px] font-semibold text-emerald-600 hover:underline"
              >
                Filings
              </Link>
            </div>

            <div className="space-y-2.5">
              {deadlines.map((item) => {
                const diff = item.dueDay - curDay;
                const isOverdue = diff < 0;
                const isDueSoon = diff >= 0 && diff <= 5;

                return (
                  <div
                    key={item.code}
                    className={`p-3 rounded-xl border transition-colors ${
                      item.highlight
                        ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[var(--color-text-heading)]">
                        {item.code}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : isDueSoon
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        }`}
                      >
                        {item.dueDate} {diff === 0 ? '(Today)' : diff > 0 ? `(${diff}d left)` : `(Passed)`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-tight">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Practice Utilities */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">
              Practice Utilities
            </h4>

            <div className="space-y-2">
              <Link
                href="/dashboard/gst/calculator"
                className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:border-emerald-500/40 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[var(--color-text-heading)] group-hover:text-emerald-600 transition-colors block">
                      Late Fee & Delay Interest
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] block">
                      Section 50 18% p.a. calculation
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/dashboard/gst/portal-sync"
                className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:border-blue-500/40 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[var(--color-text-heading)] group-hover:text-blue-600 transition-colors block">
                      GST Portal Sync
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] block">
                      Sync filing status & OTP token
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/dashboard/gst/catalog"
                className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:border-purple-500/40 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[var(--color-text-heading)] group-hover:text-purple-600 transition-colors block">
                      Statutory Rate Catalog
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] block">
                      HSN / SAC codes & tax slab directory
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateProfileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultClientId={clientId || ''}
      />

      <EditProfileModal
        isOpen={editingProfile !== null}
        onClose={() => setEditingProfile(null)}
        profile={editingProfile}
      />

      <VerifyGstinModal
        isOpen={verifyingProfile !== null || isStandaloneVerifyOpen}
        onClose={() => {
          setVerifyingProfile(null);
          setIsStandaloneVerifyOpen(false);
        }}
        profileId={verifyingProfile?.id}
        initialGstin={verifyingProfile?.gstin || ''}
      />
    </div>
  );
}

export default function GstOverviewPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-sm text-[var(--color-text-secondary)] animate-pulse">
        Loading GST Workspace...
      </div>
    }>
      <GstOverviewMainContent />
    </Suspense>
  );
}
