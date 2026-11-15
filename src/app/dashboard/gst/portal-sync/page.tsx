'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GstPortalSyncPanel } from '@/features/gst/components/GstPortalSyncPanel';

function GstPortalSyncMainContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') || undefined;

  return (
    <div className="space-y-4">
      <GstPortalSyncPanel clientId={clientId} />
    </div>
  );
}

export default function GstPortalSyncPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-sm text-[var(--color-text-secondary)] animate-pulse">
        Loading Portal Sync...
      </div>
    }>
      <GstPortalSyncMainContent />
    </Suspense>
  );
}
