'use client';

import React from 'react';
import { UserCheck, Users } from 'lucide-react';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';

interface GstClientSelectorProps {
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
}

export const GstClientSelector: React.FC<GstClientSelectorProps> = ({
  selectedClientId,
  onSelectClient,
}) => {
  const { data: clientsData, isLoading } = useGetClientsQuery();
  const clients = clientsData?.data || [];

  const options: SearchableOption[] = [
    {
      value: '',
      label: 'All Clients',
      sublabel: 'View all GST returns & profiles across all clients',
    },
    ...clients.map((client) => ({
      value: client.id,
      label: client.name,
      sublabel: client.companyName || undefined,
      badge: client.gstin || (client.pan ? `PAN: ${client.pan}` : undefined),
      metadata: client.email || client.phone || undefined,
    })),
  ];

  return (
    <div className="w-full sm:w-72">
      <SearchableSelect
        options={options}
        value={selectedClientId}
        onChange={onSelectClient}
        placeholder="Filter by Client / GSTIN..."
        searchPlaceholder="Search by name, company, GSTIN, PAN..."
        isLoading={isLoading}
        clearable={true}
      />
    </div>
  );
};
