'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useCreateLeadMutation } from '@/lib/store/api/leadsApi';
import type { LeadStatus } from '@/lib/types/lead.types';
import { Sparkles } from 'lucide-react';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [createLead, { isLoading }] = useCreateLeadMutation();

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dealValue, setDealValue] = useState<string>('');
  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setCompanyName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setDealValue('');
    setStatus('NEW');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      showToast('Company name is required', 'error');
      return;
    }

    try {
      const numericDealValue = dealValue ? parseFloat(dealValue) : 0;
      await createLead({
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        dealValue: numericDealValue,
        estimatedValue: numericDealValue,
        status,
        notes: notes.trim() || undefined,
      }).unwrap();

      if (status === 'WON') {
        showToast('Lead created & marked WON! Automated client onboarding initiated.', 'success');
      } else {
        showToast('Lead created successfully in CRM pipeline!', 'success');
      }

      resetForm();
      onClose();
    } catch (err: unknown) {
      console.error('Create lead error:', err);
      const apiErr = err as { data?: { message?: string } };
      showToast(apiErr?.data?.message || 'Failed to create lead', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Prospective Client (Lead)"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-lead-form"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-4 h-4 text-emerald-300" />}
          >
            Create Lead
          </Button>
        </div>
      }
    >
      <form id="create-lead-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Company / Enterprise Name *"
            placeholder="e.g. Nexus Apex Logistics Pvt Ltd"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Person"
            placeholder="e.g. Ramesh Chandra (Director)"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
          />

          <Input
            label="Phone / Mobile"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. finance@nexuslogistics.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Estimated Annual Retainer / Deal Value (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="500"
                placeholder="e.g. 150000"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                style={{
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Initial Pipeline Stage
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'NEW', label: 'New', color: 'border-blue-500/30 text-blue-500 bg-blue-500/10' },
              { id: 'CONTACTED', label: 'Contacted', color: 'border-amber-500/30 text-amber-500 bg-amber-500/10' },
              { id: 'PROPOSAL_SENT', label: 'Proposal', color: 'border-purple-500/30 text-purple-500 bg-purple-500/10' },
              { id: 'WON', label: 'Won 🤝', color: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' },
              { id: 'LOST', label: 'Lost', color: 'border-rose-500/30 text-rose-500 bg-rose-500/10' },
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setStatus(item.id as LeadStatus)}
                className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  status === item.id
                    ? `${item.color} ring-2 ring-emerald-500/40 font-bold shadow-sm`
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {status === 'WON' && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Automated onboarding will trigger: Client account created, initial KYC task set up, welcome email dispatched & eSign engagement letter generated.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Prospect Notes & Requirements
          </label>
          <textarea
            rows={3}
            placeholder="Add scope details (e.g. GST filing, statutory audit, ROC annual filings)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            style={{
              background: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
      </form>
    </Modal>
  );
};
