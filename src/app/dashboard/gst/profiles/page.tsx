'use client';

import React, { useState } from 'react';
import { Plus, ShieldCheck, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetProfilesQuery } from '@/lib/store/api/gstApi';
import { GstProfilesTable } from '@/features/gst/components/GstProfilesTable';
import { CreateProfileModal } from '@/features/gst/components/CreateProfileModal';
import { EditProfileModal } from '@/features/gst/components/EditProfileModal';
import { VerifyGstinModal } from '@/features/gst/components/VerifyGstinModal';
import type { GstProfile } from '@/lib/types/gst.types';

export default function GstProfilesPage() {
  const { data: profilesData, isLoading } = useGetProfilesQuery();
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
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
            <Building2 className="w-5 h-5 text-[#00C2B3]" />
            GST Profiles Directory
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Manage client GSTIN registrations, filing frequencies (Monthly/QRMP), and verification details.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => setIsStandaloneVerifyOpen(true)}
            leftIcon={<ShieldCheck className="w-4 h-4 text-teal-600" />}
          >
            Verify GSTIN
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
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
        />
      </div>

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
