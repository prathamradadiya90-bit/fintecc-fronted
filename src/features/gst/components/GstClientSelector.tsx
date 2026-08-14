import React from 'react';
import { UserCheck, Users } from 'lucide-react';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';

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

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs shadow-sm transition-all"
      style={{
        background: 'var(--color-bg-card)',
        borderColor: selectedClientId ? '#00C2B3' : 'var(--color-border)',
      }}
    >
      {selectedClientId ? (
        <UserCheck className="w-4 h-4 text-[#00C2B3] shrink-0" />
      ) : (
        <Users className="w-4 h-4 text-slate-400 shrink-0" />
      )}
      
      <span className="font-medium shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
        Active Client:
      </span>

      <select
        value={selectedClientId}
        onChange={(e) => onSelectClient(e.target.value)}
        disabled={isLoading}
        className="bg-transparent font-semibold text-xs focus:outline-none cursor-pointer max-w-[200px] truncate"
        style={{ color: 'var(--color-text-primary)' }}
      >
        <option value="" style={{ background: 'var(--color-bg-card)' }}>
          All Clients (Global View)
        </option>
        {clients.map((client) => (
          <option key={client.id} value={client.id} style={{ background: 'var(--color-bg-card)' }}>
            {client.name} {client.companyName ? `(${client.companyName})` : ''}
          </option>
        ))}
      </select>

      {selectedClientId && (
        <button
          onClick={() => onSelectClient('')}
          className="text-[11px] text-slate-400 hover:text-slate-200 ml-1 underline"
          title="Clear client selection"
        >
          Clear
        </button>
      )}
    </div>
  );
};
