'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2, FileCheck2, Calendar } from 'lucide-react';
import { useGetProfilesQuery } from '@/lib/store/api/gstApi';
import { ImsManager } from '@/features/gst/ims/ImsManager';

function GstImsMainContent() {
  const searchParams = useSearchParams();
  const urlClientId = searchParams.get('clientId') || '';

  const { data: profilesData, isLoading: isProfilesLoading } = useGetProfilesQuery();
  const profiles = profilesData?.data || [];

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = String(now.getMonth() + 1).padStart(2, '0');
  const defaultPeriod = `${curYear}-${curMonth}`;

  const [selectedClientId, setSelectedClientId] = useState<string>(urlClientId);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(defaultPeriod);

  // Auto-select first client if available and none selected
  const activeClientId = selectedClientId || urlClientId || profiles[0]?.clientId || '';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-heading)] flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-500" />
              GST IMS & 2B Reconciliation
            </h1>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Real-time portal invoice matching, 3-way action staging (Accept / Reject / Pending), and GSTR-2B ITC control.
          </p>
        </div>

        {/* Global Client & Period Selector */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Client Selector */}
          <div className="relative">
            <select
              value={activeClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="text-xs py-1.5 pl-3 pr-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-heading)] font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {isProfilesLoading ? (
                <option value="">Loading entities...</option>
              ) : profiles.length === 0 ? (
                <option value="">No GST Profiles Found</option>
              ) : (
                <>
                  <option value="">All GST Profiles / Entities</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.clientId}>
                      {p.legalName || p.tradeName} ({p.gstin})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Period Selector */}
          <div className="relative">
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-heading)] font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main IMS Workspace */}
      {activeClientId ? (
        <ImsManager clientId={activeClientId} period={selectedPeriod} />
      ) : (
        <div
          className="p-12 text-center rounded-2xl border"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-semibold text-[var(--color-text-heading)]">
            Select a Client to View IMS Records
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Choose a registered GST profile above to view and stage invoice actions.
          </p>
        </div>
      )}
    </div>
  );
}

export default function GstImsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-sm text-[var(--color-text-secondary)] animate-pulse">
        Loading IMS Dashboard...
      </div>
    }>
      <GstImsMainContent />
    </Suspense>
  );
}
