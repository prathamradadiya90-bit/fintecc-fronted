'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, ShieldCheck, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetProfilesQuery } from '@/lib/store/api/gstApi';
import { GstProfilesTable } from '@/features/gst/components/GstProfilesTable';
import { CreateProfileModal } from '@/features/gst/components/CreateProfileModal';
import { EditProfileModal } from '@/features/gst/components/EditProfileModal';
import { VerifyGstinModal } from '@/features/gst/components/VerifyGstinModal';
import type { GstProfile } from '@/lib/types/gst.types';

function GstProfilesMainContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') || undefined;

  const { data: profilesData, isLoading } = useGetProfilesQuery(
    clientId ? { clientId } : undefined
  );
  const profiles = profilesData?.data || [];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<GstProfile | null>(null);
  const [verifyingProfile, setVerifyingProfile] = useState<GstProfile | null>(null);
  const [isStandaloneVerifyOpen, setIsStandaloneVerifyOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
              <Building2 className="w-5 h-5 text-emerald-500" />
              GST Profiles Directory
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Manage client GSTIN registrations, filing frequencies (Monthly/QRMP), and verification details.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => setIsStandaloneVerifyOpen(true)}
            leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
            className="text-xs h-8 px-3"
          >
            Verify GSTIN
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs h-8 px-3"
          >
            Add GST Profile
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        className="p-5 rounded-2xl border space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <GstProfilesTable
          profiles={profiles}
          isLoading={isLoading}
          onEdit={(profile) => setEditingProfile(profile)}
          onVerify={(profile) => setVerifyingProfile(profile)}
          onCreateProfile={() => setIsCreateModalOpen(true)}
        />
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

export default function GstProfilesPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-sm text-[var(--color-text-secondary)] animate-pulse">
        Loading GST Profiles Directory...
      </div>
    }>
      <GstProfilesMainContent />
    </Suspense>
  );
}
