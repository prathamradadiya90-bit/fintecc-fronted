'use client';

import React, { useState } from 'react';
import { ShieldCheck, Building2, Calendar } from 'lucide-react';
import { useGetProfilesQuery } from '@/lib/store/api/gstApi';
import { ImsManager } from '@/features/gst/ims/ImsManager';

export default function GstImsPage() {
  const { data: profilesData, isLoading: isProfilesLoading } = useGetProfilesQuery();
  const profiles = profilesData?.data || [];

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024-11');

  // Auto-select first client if available and none selected
  const activeClientId = selectedClientId || profiles[0]?.clientId || '';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-1">
            <span>GST Compliance</span>
            <span>/</span>
            <span className="text-[var(--color-text-heading)] font-medium">Invoice Management System</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-heading)]">
            GST IMS Dashboard
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Real-time portal invoice matching, 3-way action staging (Accept / Reject / Pend), and GSTR-2B control.
          </p>
        </div>

        {/* Global Client & Period Selector */}
        <div className="flex items-center gap-2">
          {/* Client Selector */}
          <div className="relative">
            <select
              value={activeClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="text-xs py-2 pl-3 pr-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-heading)] font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {isProfilesLoading ? (
                <option value="">Loading entities...</option>
              ) : profiles.length === 0 ? (
                <option value="">No GST Profiles Found</option>
              ) : (
                profiles.map((p) => (
                  <option key={p.id} value={p.clientId}>
                    {p.legalName || p.tradeName} ({p.gstin})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Period Selector */}
          <div className="relative">
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-heading)] font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

