'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  ShieldCheck,
  ArrowRight,
  FileSpreadsheet,
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
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--color-text-heading)' }}>
            Filing & Statutory Overview
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Real-time returns tracking, GSTIN profiles, and statutory compliance timeline
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <ExportSalesButton year={new Date().getFullYear()} />
          
          <Button
            variant="outline"
            onClick={() => setIsStandaloneVerifyOpen(true)}
            leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
            className="text-xs h-8 px-2.5"
          >
            Verify GSTIN
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs h-8 px-3"
          >
            New Profile
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
