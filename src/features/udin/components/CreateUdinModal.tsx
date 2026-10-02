'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Building2, Calendar, FileText, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { useCreateUdinMutation } from '@/lib/store/api/udinApi';
import { useToast } from '@/components/ui/Toast';

interface CreateUdinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DOCUMENT_TYPES = [
  'Tax Audit Report (Form 3CA/3CB-3CD)',
  'Statutory Audit Report (Company / LLP)',
  'Net Worth Certificate',
  'Turnover / Working Capital Certificate',
  'GST Audit Certificate (Form 9C)',
  'Direct Tax Certification (15CB / 10B / 10BB)',
  'Visa & Immigration Financial Certificate',
  'Bank Borrowing / Loan Certification',
  'Other ICAI Attestation',
];

export function CreateUdinModal({ isOpen, onClose }: CreateUdinModalProps) {
  const { showToast } = useToast();
  const { data: clientsData } = useGetClientsQuery({ limit: 100 });
  const [createUdin, { isLoading }] = useCreateUdinMutation();

  const clients = clientsData?.data || [];

  const [udinNumber, setUdinNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);
  const [dateOfGeneration, setDateOfGeneration] = useState(new Date().toISOString().split('T')[0]);
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [turnover, setTurnover] = useState<string>('');
  const [netProfit, setNetProfit] = useState<string>('');
  const [documentDescription, setDocumentDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUdin = udinNumber.trim().toUpperCase();
    if (!cleanUdin || cleanUdin.length < 10) {
      showToast('Please enter a valid UDIN number (e.g. 18 characters)', 'error');
      return;
    }

    try {
      const figures: Record<string, any> = {};
      if (turnover) figures.turnover = Number(turnover);
      if (netProfit) figures.netProfit = Number(netProfit);

      await createUdin({
        udinNumber: cleanUdin,
        clientId: clientId || undefined,
        documentType,
        documentDescription: documentDescription.trim() || undefined,
        dateOfGeneration: new Date(dateOfGeneration).toISOString(),
        financialYear,
        figures: Object.keys(figures).length > 0 ? figures : undefined,
      }).unwrap();

      showToast(`UDIN ${cleanUdin} registered successfully!`, 'success');
      onClose();
      // Reset
      setUdinNumber('');
      setClientId('');
      setTurnover('');
      setNetProfit('');
      setDocumentDescription('');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to register UDIN', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-xl my-8 overflow-hidden transition-all"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                Register New UDIN
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Record Unique Document Identification Number issued via ICAI Portal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* UDIN Number & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                18-Digit UDIN Number <span className="text-rose-500">*</span>
              </label>
              <Input
                value={udinNumber}
                onChange={(e) => setUdinNumber(e.target.value.toUpperCase())}
                placeholder="24123456ABCDE12345"
                required
                maxLength={24}
                className="font-mono text-xs uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Date of Generation <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={dateOfGeneration}
                onChange={(e) => setDateOfGeneration(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Client & Financial Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Associated Client (Optional)
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4A6FA5]"
                style={{
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="">No client linked / Independent</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName ? `${c.companyName} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Financial Year
              </label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4A6FA5]"
                style={{
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="2025-26">2025-26</option>
                <option value="2024-25">2024-25</option>
                <option value="2023-24">2023-24</option>
                <option value="2022-23">2022-23</option>
              </select>
            </div>
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Document / Certificate Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
              className="w-full h-9 px-3 rounded-xl border text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4A6FA5]"
              style={{
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Key Figures Section */}
          <div
            className="p-4 rounded-xl border space-y-3"
            style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--color-text-heading)' }}>
              Key Figures Disclosed on UDIN Portal
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Disclosed Turnover / Gross Receipts (₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 5000000"
                  value={turnover}
                  onChange={(e) => setTurnover(e.target.value)}
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Disclosed Net Profit / Net Worth (₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 750000"
                  value={netProfit}
                  onChange={(e) => setNetProfit(e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Remarks / Description */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Document Description / Purpose
            </label>
            <textarea
              rows={2}
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              placeholder="e.g. Issued for SBI Term Loan Application against audited financials."
              className="w-full p-2.5 rounded-xl border text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4A6FA5]"
              style={{
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white"
            >
              Register UDIN
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
