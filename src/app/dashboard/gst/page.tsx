'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetProfilesQuery, useGetReturnsQuery } from '@/lib/store/api/gstApi';
import { GstOverviewStats } from '@/features/gst/components/GstOverviewStats';
import { ExportSalesButton } from '@/features/gst/components/ExportSalesButton';
import { GstProfilesTable } from '@/features/gst/components/GstProfilesTable';
import { CreateProfileModal } from '@/features/gst/components/CreateProfileModal';
import { EditProfileModal } from '@/features/gst/components/EditProfileModal';
import { VerifyGstinModal } from '@/features/gst/components/VerifyGstinModal';
import { GstComplianceCalendar } from '@/features/gst/components/GstComplianceCalendar';
import type { GstProfile } from '@/lib/types/gst.types';

export default function GstOverviewPage() {
  const { data: profilesData, isLoading: isLoadingProfiles } = useGetProfilesQuery({ limit: 10 });
  const { data: returnsData, isLoading: isLoadingReturns } = useGetReturnsQuery({ limit: 50 });

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

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border bg-gradient-to-r from-emerald-500/10 via-transparent to-indigo-500/10 border-[var(--color-border)]">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
            <Sparkles className="w-5 h-5 text-emerald-500" />
            GST Overview & Quick Actions
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Export sales data to Excel, add new GSTIN profiles, or verify registration details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <ExportSalesButton year={new Date().getFullYear()} />
          
          <Button
            variant="outline"
            onClick={() => setIsStandaloneVerifyOpen(true)}
            leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
          >
            Verify GSTIN
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New GST Profile
          </Button>
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

      {/* Quick Action Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-5 rounded-2xl border transition-all hover:border-emerald-500/40 flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              GST Profiles & Clients
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Maintain client GSTINs, state codes, registration types, and authorized signatories.
            </p>
          </div>
          <Link
            href="/dashboard/gst/profiles"
            className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-4 gap-1"
          >
            Manage Profiles <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          className="p-5 rounded-2xl border transition-all hover:border-indigo-500/40 flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              GSTR-1 & GSTR-3B Returns
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Prepare return drafts, compute liabilities, submit for client approval, and file via GSP API.
            </p>
          </div>
          <Link
            href="/dashboard/gst/returns"
            className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-4 gap-1"
          >
            Returns Workflow <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          className="p-5 rounded-2xl border transition-all hover:border-amber-500/40 flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              ITC Reconciliation & Invoices
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Match supplier uploaded 2B/2A data with client purchase invoices to claim optimal Input Tax Credit.
            </p>
          </div>
          <Link
            href="/dashboard/gst/invoices"
            className="inline-flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline mt-4 gap-1"
          >
            Manage Invoices <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* New Statutory & Portal Sync Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-5 rounded-2xl border transition-all hover:border-[#4A6FA5]/40 flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Statutory 22 Returns Catalog
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Full directory of active, suspended, and view-only GST returns with legal sections and due date rules.
            </p>
          </div>
          <Link
            href="/dashboard/gst/catalog"
            className="inline-flex items-center text-xs font-semibold text-[#4A6FA5] hover:underline mt-4 gap-1"
          >
            Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          className="p-5 rounded-2xl border transition-all hover:border-[#9E6B42]/40 flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[rgba(158,107,66,0.1)] text-[#9E6B42] flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Interest & Late Fee Calculator
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Compute Section 47 daily late fees with rationalized caps and Section 50(1) 18% p.a. interest.
            </p>
          </div>
          <Link
            href="/dashboard/gst/calculator"
            className="inline-flex items-center text-xs font-semibold text-[#9E6B42] hover:underline mt-4 gap-1"
          >
            Open Calculator <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          className="p-5 rounded-2xl border transition-all hover:border-[#3D7A64]/40 flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[rgba(61,122,100,0.1)] text-[#3D7A64] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              GST Portal Real-Time Sync
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Query any GSTIN or bulk-sync all firm clients to fetch live return filing history and ARNs without logins.
            </p>
          </div>
          <Link
            href="/dashboard/gst/portal-sync"
            className="inline-flex items-center text-xs font-semibold text-[#3D7A64] hover:underline mt-4 gap-1"
          >
            Portal Sync <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Profiles Preview Table */}
      <div
        className="p-5 rounded-2xl border space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)' }}>
              Registered GST Profiles ({totalProfiles})
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Showing active GSTIN registrations across all firm clients
            </p>
          </div>

          <Link
            href="/dashboard/gst/profiles"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <GstProfilesTable
          profiles={profiles}
          isLoading={isLoadingProfiles}
          onEdit={(profile) => setEditingProfile(profile)}
          onVerify={(profile) => setVerifyingProfile(profile)}
        />
      </div>

      {/* Statutory Compliance Calendar */}
      <GstComplianceCalendar />

      {/* Modals */}
      <CreateProfileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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
