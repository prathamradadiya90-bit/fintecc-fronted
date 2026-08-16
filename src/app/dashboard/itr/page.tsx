'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  ReceiptText,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetItrClientsQuery } from '@/lib/store/api/itrApi';
import { ItrOverviewStats } from '@/features/itr/components/ItrOverviewStats';
import { ItrClientsTable } from '@/features/itr/components/ItrClientsTable';
import { AddItrClientModal } from '@/features/itr/components/AddItrClientModal';
import { PrepareReturnModal } from '@/features/itr/components/PrepareReturnModal';
import type { ItrClient } from '@/lib/types/itr.types';

export default function ItrOverviewPage() {
  const { data: clientsData, isLoading: isLoadingClients } = useGetItrClientsQuery();

  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isPrepareReturnOpen, setIsPrepareReturnOpen] = useState(false);
  const [selectedClientForReturn, setSelectedClientForReturn] = useState<ItrClient | null>(null);

  const clients = clientsData?.data || [];
  const totalClients = clients.length;

  const handlePrepareReturnForClient = (client: ItrClient) => {
    setSelectedClientForReturn(client);
    setIsPrepareReturnOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border bg-gradient-to-r from-teal-500/10 via-transparent to-indigo-500/10 border-[var(--color-border)]">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
            <Sparkles className="w-4 h-4 text-[#00C2B3]" />
            Direct Tax (ITR) Hub & Rapid Filing
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Onboard taxpayer PANs, request e-filing consent, prepare ITR-1 to ITR-7 drafts, and submit directly to ITD.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedClientForReturn(null);
              setIsPrepareReturnOpen(true);
            }}
            leftIcon={<ReceiptText className="w-4 h-4 text-teal-600" />}
          >
            Prepare Return
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsAddClientOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add ITR Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <ItrOverviewStats
        totalClients={totalClients}
        totalReturns={totalClients > 0 ? totalClients : 0}
        preparedReturns={clients.filter((c) => c.consentStatus === 'PENDING').length}
        validatedReturns={clients.filter((c) => c.consentStatus === 'GRANTED').length}
        filedReturns={0}
        isLoading={isLoadingClients}
      />

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-5 rounded-2xl border transition-all hover:border-[#00C2B3] flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#00C2B3] flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Taxpayers & Master Profiles
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Maintain client PAN cards, contact details, ITD portal authorization, and active e-filing consent tokens.
            </p>
          </div>
          <Link
            href="/dashboard/itr/clients"
            className="inline-flex items-center text-xs font-semibold text-[#00C2B3] hover:underline mt-4 gap-1"
          >
            Manage Taxpayers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          className="p-5 rounded-2xl border transition-all hover:border-[#00C2B3] flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              ITR-1 to ITR-7 Return Drafts
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Prepare assessment returns, validate schema structures, compute liabilities, and transmit filings.
            </p>
          </div>
          <Link
            href="/dashboard/itr/returns"
            className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-4 gap-1"
          >
            Returns Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          className="p-5 rounded-2xl border transition-all hover:border-[#00C2B3] flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              26AS / AIS Prefill Sync
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Auto-fetch TDS deductions, salary details, and interest income directly into returns using taxpayer consent.
            </p>
          </div>
          <button
            onClick={() => setIsAddClientOpen(true)}
            className="inline-flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline mt-4 gap-1 text-left"
          >
            Register PAN for Prefill <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Taxpayers Preview Table */}
      <div
        className="p-5 rounded-2xl border space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)' }}>
              Registered Taxpayers ({totalClients})
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Showing active PAN accounts configured for Direct Tax & ITR filing
            </p>
          </div>

          <Link
            href="/dashboard/itr/clients"
            className="text-xs font-semibold text-[#00C2B3] hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ItrClientsTable
          clients={clients}
          isLoading={isLoadingClients}
          onPrepareReturn={handlePrepareReturnForClient}
        />
      </div>

      {/* Modals */}
      <AddItrClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />

      <PrepareReturnModal
        isOpen={isPrepareReturnOpen}
        onClose={() => {
          setIsPrepareReturnOpen(false);
          setSelectedClientForReturn(null);
        }}
        defaultClientId={selectedClientForReturn?.id || ''}
      />
    </div>
  );
}
