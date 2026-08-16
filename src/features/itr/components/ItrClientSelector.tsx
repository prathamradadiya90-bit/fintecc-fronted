'use client';

import React from 'react';
import { useGetItrClientsQuery } from '@/lib/store/api/itrApi';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';

interface ItrClientSelectorProps {
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
}

export const ItrClientSelector: React.FC<ItrClientSelectorProps> = ({
  selectedClientId,
  onSelectClient,
}) => {
  const { data: clientsData, isLoading } = useGetItrClientsQuery();
  const clients = clientsData?.data || [];

  const options: SearchableOption[] = [
    {
      value: '',
      label: 'All Taxpayers (Firm Global View)',
      sublabel: 'View all ITR returns & filings across all taxpayers',
    },
    ...clients.map((client) => ({
      value: client.id,
      label: client.name,
      badge: client.pan,
      sublabel: client.client?.companyName || undefined,
      metadata: client.email || client.mobile || client.phone || undefined,
    })),
  ];

  return (
    <div className="w-full sm:w-72">
      <SearchableSelect
        options={options}
        value={selectedClientId}
        onChange={onSelectClient}
        placeholder="Filter by Taxpayer / PAN..."
        searchPlaceholder="Search by name, PAN, email, mobile..."
        isLoading={isLoading}
        clearable={true}
      />
    </div>
  );
};
