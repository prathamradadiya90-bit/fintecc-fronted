import React from 'react';
import { ShieldCheck, Plus, Check, Loader2, Phone, Mail, UserCheck } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ItrConsentBadge } from './ItrConsentBadge';
import { useRequestConsentMutation } from '@/lib/store/api/itrApi';
import type { ItrClient } from '@/lib/types/itr.types';

interface ItrClientsTableProps {
  clients: ItrClient[];
  isLoading?: boolean;
  onPrepareReturn?: (client: ItrClient) => void;
  onSelectClient?: (client: ItrClient) => void;
}

export const ItrClientsTable: React.FC<ItrClientsTableProps> = ({
  clients,
  isLoading = false,
  onPrepareReturn,
  onSelectClient,
}) => {
  const [requestConsentApi, { isLoading: isRequestingConsent }] = useRequestConsentMutation();
  const [activeConsentClientId, setActiveConsentClientId] = React.useState<string | null>(null);

  const handleRequestConsent = async (e: React.MouseEvent, client: ItrClient) => {
    e.stopPropagation();
    try {
      setActiveConsentClientId(client.id);
      const res = await requestConsentApi(client.id).unwrap();
      alert(`Consent requested successfully! Consent ID: ${res?.data?.consentId || 'Recorded'}`);
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to request taxpayer consent');
    } finally {
      setActiveConsentClientId(null);
    }
  };

  const columns: Column<ItrClient>[] = [
    {
      key: 'pan',
      header: 'Taxpayer & PAN',
      render: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className="font-mono font-bold text-xs tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
            >
              {item.pan}
            </span>
          </div>
          <span
            className="text-xs font-medium mt-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {item.name}
          </span>
          {item.client?.companyName && (
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {item.client.companyName}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (item) => {
        const phone = item.mobile || item.phone;
        return (
          <div className="flex flex-col gap-0.5 text-xs">
            {item.email ? (
              <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate max-w-[180px]">{item.email}</span>
              </div>
            ) : null}
            {phone ? (
              <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{phone}</span>
              </div>
            ) : null}
            {!item.email && !phone && (
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                —
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'consentStatus',
      header: 'Taxpayer Consent',
      render: (item) => (
        <div className="flex flex-col items-start gap-1">
          <ItrConsentBadge status={item.consentStatus || 'PENDING'} size="sm" />
          {item.consentTill && (
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              Valid till: {new Date(item.consentTill).toLocaleDateString('en-IN')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'eriStatus',
      header: 'ITD Portal Status',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
            {item.eriStatus || 'Active Taxpayer'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        const isClientConsentLoading = isRequestingConsent && activeConsentClientId === item.id;
        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleRequestConsent(e, item)}
              disabled={isClientConsentLoading}
              leftIcon={
                isClientConsentLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin text-[#00C2B3]" />
                ) : (
                  <ShieldCheck className="w-3 h-3 text-[#00C2B3]" />
                )
              }
            >
              Consent
            </Button>

            {onPrepareReturn && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onPrepareReturn(item)}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                File ITR
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      data={clients}
      columns={columns}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      onRowClick={onSelectClient}
      emptyMessage="No ITR taxpayers registered yet. Click 'Add ITR Client' to add your first taxpayer PAN."
    />
  );
};
