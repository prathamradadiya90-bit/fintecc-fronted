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
    <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
    <span className="text-[14px] font-medium text-slate-800">
      {value || <span className="text-slate-300 italic">Not provided</span>}
    </span>
  </div>
);

const SectionHeader = ({ letter, title }: { letter: string; title: string }) => (
  <div className="flex items-center gap-2.5 mt-8 mb-5 pb-3 border-b border-slate-100">
    <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 text-[11px] font-bold">
      {letter}
    </div>
    <h4 className="text-[12px] font-bold text-slate-800 uppercase tracking-[0.1em]">{title}</h4>
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
        <div className="flex items-start gap-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <div className="w-14 h-14 rounded-full bg-[#091124] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{client.name}</h3>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-full text-[11px] font-semibold">
                {client.type}
              </span>
              <span className={`px-2.5 py-0.5 border rounded-full text-[11px] font-semibold ${
                client.status === 'Active' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : 'bg-red-50 border-red-100 text-red-600'
              }`}>
                {client.status || 'Active'}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
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
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div className="text-[14px] text-slate-700 leading-relaxed">
            {client.address ? (
              <>
                {client.address.street && <div>{client.address.street}</div>}
                <div>
                  {[client.address.city, client.address.state, client.address.zip].filter(Boolean).join(', ')}
                </div>
                {client.address.country && <div>{client.address.country}</div>}
              </>
            ) : (
              <span className="text-slate-400 italic">No address provided</span>
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
          <div className="text-[13px] text-slate-400 italic">No bank details provided</div>
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
            <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">
              {client.notes}
            </div>
          </>
        )}
      </div>
    </SlideOver>
  );
}
