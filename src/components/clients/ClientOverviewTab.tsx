import React from 'react';
import { MapPin, Building2, Phone, Mail, Landmark, CreditCard, FileText, CheckCircle2 } from 'lucide-react';
import type { Client } from '@/lib/types/client.types';

interface ClientOverviewTabProps {
  client: Client;
}

const DetailRow = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ElementType;
}) => (
  <div className="flex flex-col gap-1 mb-4">
    <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
      {value || <span className="italic text-xs" style={{ color: 'var(--color-text-muted)' }}>Not provided</span>}
    </span>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 mt-8 mb-4 pb-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
    <h4 className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--color-text-muted)' }}>{title}</h4>
  </div>
);

export function ClientOverviewTab({ client }: ClientOverviewTabProps) {
  const addressParts = [
    client.address?.street,
    client.address?.city,
    client.address?.state,
    client.address?.zip,
    client.address?.country,
  ].filter(Boolean);

  return (
    <div className="max-w-3xl">
      {/* PERSONAL & CONTACT */}
      <SectionHeader title="Personal & Contact" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
        <DetailRow label="Mobile Number"    value={client.phone}          icon={Phone}      />
        <DetailRow label="Email Address"    value={client.email}          icon={Mail}       />
        <DetailRow label="Secondary Phone"  value={client.secondaryPhone} icon={Phone}      />
        <DetailRow label="Aadhaar Number"   value={client.aadhaar}        icon={CreditCard} />
      </div>

      {/* BUSINESS DETAILS */}
      <SectionHeader title="Business Details" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
        <DetailRow label="PAN Number"    value={client.pan}         icon={CreditCard} />
        <DetailRow label="Company Name"  value={client.companyName} icon={Building2}  />
        <DetailRow label="GSTIN"         value={client.gstin}       icon={FileText}   />
        <DetailRow label="TAN Number"    value={client.tan}         icon={FileText}   />
      </div>

      {/* ADDRESS */}
      <SectionHeader title="Address" />
      {addressParts.length > 0 ? (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-on-card)' }}>{addressParts.join(', ')}</p>
        </div>
      ) : (
        <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>No address provided</p>
      )}

      {/* BANK DETAILS */}
      <SectionHeader title="Bank Details" />
      {client.bankDetails && client.bankDetails.length > 0 && client.bankDetails[0].bankName ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          <DetailRow label="Bank Name"       value={client.bankDetails[0].bankName}      icon={Landmark} />
          <DetailRow label="Account Name"    value={client.bankDetails[0].accountName}   />
          <DetailRow label="Account Number"  value={client.bankDetails[0].accountNumber} />
          <DetailRow label="IFSC Code"       value={client.bankDetails[0].ifsc}          />
        </div>
      ) : (
        <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>No bank details provided</p>
      )}

      {/* SERVICES */}
      {client.tags && client.tags.length > 0 && (
        <>
          <SectionHeader title="Services Assigned" />
          <div className="flex flex-wrap gap-2">
            {client.tags.map((tag, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg text-xs font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {tag}
              </div>
            ))}
          </div>
        </>
      )}

      {/* NOTES */}
      {client.notes && (
        <>
          <SectionHeader title="Notes" />
          <div className="p-4 bg-yellow-50/60 border border-yellow-100 rounded-xl text-sm whitespace-pre-wrap leading-relaxed dark:bg-yellow-900/20 dark:border-yellow-800" style={{ color: 'var(--color-text-on-card)' }}>
            {client.notes}
          </div>
        </>
      )}
    </div>
  );
}
