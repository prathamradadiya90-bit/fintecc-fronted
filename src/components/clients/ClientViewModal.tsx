import React from 'react';
import { SlideOver } from '@/components/ui/SlideOver';
import type { Client } from '@/lib/types/client.types';
import { MapPin, Building2, Phone, Mail, Landmark, CreditCard, FileText, CheckCircle2 } from 'lucide-react';

interface ClientViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

const DetailRow = ({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: React.ElementType }) => (
  <div className="flex flex-col gap-1 mb-4">
    <span className="text-[12px] font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
    <span className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
      {value || <span className="italic" style={{ color: 'var(--color-text-muted)' }}>Not provided</span>}
    </span>
  </div>
);

const SectionHeader = ({ letter, title }: { letter: string; title: string }) => (
  <div className="flex items-center gap-2.5 mt-8 mb-5 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
    <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 text-[11px] font-bold">
      {letter}
    </div>
    <h4 className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--color-text-primary)' }}>{title}</h4>
  </div>
);

export function ClientViewModal({ isOpen, onClose, client }: ClientViewModalProps) {
  if (!client) return null;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Client Profile"
      width="40vw"
      footer={
        <div className="w-full flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 text-[13px] text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="pb-6">
        {/* Header Profile Section */}
        <div className="flex items-start gap-4 mb-8 p-5 rounded-2xl" style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
          <div className="w-14 h-14 rounded-full bg-[#091124] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{client.name}</h3>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                {client.type}
              </span>
              <span className={`px-2.5 py-0.5 border rounded-full text-[11px] font-semibold ${
                client.status === 'Active' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : 'bg-red-50 border-red-100 text-red-600'
              }`}>
                {client.status || 'Active'}
              </span>
              <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                ID: C-{client.id.substring(0, 6).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* PERSONAL & CONTACT INFORMATION */}
        <SectionHeader letter="A" title="PERSONAL & CONTACT" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <DetailRow label="Mobile Number" value={client.phone} icon={Phone} />
          <DetailRow label="Email Address" value={client.email} icon={Mail} />
          <DetailRow label="Secondary Phone" value={client.secondaryPhone} icon={Phone} />
          <DetailRow label="Aadhaar Number" value={client.aadhaar} icon={CreditCard} />
        </div>

        {/* BUSINESS DETAILS */}
        <SectionHeader letter="B" title="BUSINESS DETAILS" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <DetailRow label="PAN Number" value={client.pan} icon={CreditCard} />
          <DetailRow label="Company Name" value={client.companyName} icon={Building2} />
          <DetailRow label="GSTIN" value={client.gstin} icon={FileText} />
          <DetailRow label="TAN Number" value={client.tan} icon={FileText} />
        </div>

        {/* ADDRESS */}
        <SectionHeader letter="C" title="ADDRESS" />
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <div className="text-[14px] leading-relaxed" style={{ color: 'var(--color-text-on-card)' }}>
            {client.address ? (
              <>
                {client.address.street && <div>{client.address.street}</div>}
                <div>
                  {[client.address.city, client.address.state, client.address.zip].filter(Boolean).join(', ')}
                </div>
                {client.address.country && <div>{client.address.country}</div>}
              </>
            ) : (
              <span className="italic" style={{ color: 'var(--color-text-muted)' }}>No address provided</span>
            )}
          </div>
        </div>

        {/* BANK DETAILS */}
        <SectionHeader letter="D" title="BANK DETAILS" />
        {client.bankDetails && client.bankDetails.length > 0 && client.bankDetails[0].bankName ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <DetailRow label="Bank Name" value={client.bankDetails[0].bankName} icon={Landmark} />
            <DetailRow label="Account Name" value={client.bankDetails[0].accountName} />
            <DetailRow label="Account Number" value={client.bankDetails[0].accountNumber} />
            <DetailRow label="IFSC Code" value={client.bankDetails[0].ifsc} />
          </div>
        ) : (
          <div className="text-[13px] italic" style={{ color: 'var(--color-text-muted)' }}>No bank details provided</div>
        )}

        {/* SERVICES ASSIGNED */}
        {client.tags && client.tags.length > 0 && (
          <>
            <SectionHeader letter="E" title="SERVICES ASSIGNED" />
            <div className="flex flex-wrap gap-2">
              {client.tags.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg text-[12px] font-semibold">
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
            <SectionHeader letter="F" title="NOTES" />
            <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl text-[13px] whitespace-pre-wrap leading-relaxed dark:bg-yellow-900/20 dark:border-yellow-800" style={{ color: 'var(--color-text-on-card)' }}>
              {client.notes}
            </div>
          </>
        )}
      </div>
    </SlideOver>
  );
}
