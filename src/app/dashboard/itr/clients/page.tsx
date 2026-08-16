'use client';

import React, { useState } from 'react';
import { Users, Plus, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGetItrClientsQuery } from '@/lib/store/api/itrApi';
import { ItrClientsTable } from '@/features/itr/components/ItrClientsTable';
import { AddItrClientModal } from '@/features/itr/components/AddItrClientModal';
import { PrepareReturnModal } from '@/features/itr/components/PrepareReturnModal';
import type { ItrClient } from '@/lib/types/itr.types';

export default function ItrClientsPage() {
  const { data: clientsData, isLoading } = useGetItrClientsQuery();
  const clients = clientsData?.data || [];

  const [search, setSearch] = useState('');
  const [consentFilter, setConsentFilter] = useState<string>('ALL');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isPrepareReturnOpen, setIsPrepareReturnOpen] = useState(false);
  const [selectedClientForReturn, setSelectedClientForReturn] = useState<ItrClient | null>(null);

  const filteredClients = clients.filter((c) => {
    const matchesConsent =
      consentFilter === 'ALL' || (c.consentStatus || 'PENDING') === consentFilter;

    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      c.pan.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.mobile && c.mobile.includes(query)) ||
      (c.phone && c.phone.includes(query)) ||
      (c.client?.companyName && c.client.companyName.toLowerCase().includes(query));

    return matchesConsent && matchesSearch;
  });

  const handlePrepareReturn = (client: ItrClient) => {
    setSelectedClientForReturn(client);
    setIsPrepareReturnOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
            <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            ITR Taxpayers & Master Accounts
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Register PAN profiles, verify taxpayer identity, and manage ITD portal consent authorizations.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddClientOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add ITR Client
        </Button>
      </div>

      {/* Main Table Card */}
      <div
        className="p-5 rounded-2xl border space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by PAN, Taxpayer Name, Email, Mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={consentFilter}
              onChange={(e) => setConsentFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="ALL">All Consent Statuses</option>
              <option value="GRANTED">Consent Granted</option>
              <option value="PENDING">Consent Pending</option>
              <option value="EXPIRED">Consent Expired</option>
              <option value="REVOKED">Consent Revoked</option>
            </select>
          </div>
        </div>

        {/* Clients Table */}
        <ItrClientsTable
          clients={filteredClients}
          isLoading={isLoading}
          onPrepareReturn={handlePrepareReturn}
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
