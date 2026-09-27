'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useUpdateLeadStatusMutation } from '@/lib/store/api/leadsApi';
import type { Lead, LeadStatus } from '@/lib/types/lead.types';
import {
  Building2,
  User,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface LeadDetailsModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig: Record<LeadStatus, { label: string; badgeClass: string; desc: string }> = {
  NEW: {
    label: 'New Lead',
    badgeClass: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
    desc: 'Recently captured inquiry.',
  },
  CONTACTED: {
    label: 'Contacted',
    badgeClass: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    desc: 'Introduction made & requirement scoping underway.',
  },
  PROPOSAL_SENT: {
    label: 'Proposal Sent',
    badgeClass: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
    desc: 'Engagement fee quote and proposal shared.',
  },
  WON: {
    label: 'Won (Client)',
    badgeClass: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
    desc: 'Retainer approved! Converted into an active client.',
  },
  LOST: {
    label: 'Lost',
    badgeClass: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
    desc: 'Prospect declined or chosen another firm.',
  },
};

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [updateStatus, { isLoading }] = useUpdateLeadStatusMutation();

  if (!lead) return null;

  const currentStatus = lead.status;

  const handleStatusChange = async (newStatus: LeadStatus) => {
    try {
      await updateStatus({ id: lead.id, status: newStatus }).unwrap();
      if (newStatus === 'WON') {
        showToast('Success! Converted to Client & triggered automated onboarding workflow.', 'success');
      } else {
        showToast(`Lead status updated to ${newStatus}`, 'success');
      }
      onClose();
    } catch (err: unknown) {
      console.error('Update status error:', err);
      const apiErr = err as { data?: { message?: string } };
      showToast(apiErr?.data?.message || 'Failed to update lead status', 'error');
    }
  };

  const rawVal = lead.dealValue ?? lead.estimatedValue ?? 0;
  const formattedValue = Number(rawVal).toLocaleString('en-IN');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lead Profile & CRM Status"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {currentStatus !== 'WON' && (
            <Button
              size="sm"
              isLoading={isLoading}
              onClick={() => handleStatusChange('WON')}
              leftIcon={<Sparkles className="w-4 h-4 text-emerald-300" />}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Convert to WON (Automate Onboarding)
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        {/* Header Information */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="space-y-1">
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Building2 className="w-4 h-4 text-emerald-500" />
              {lead.companyName}
            </h3>
            {lead.contactPerson && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Contact: <span className="font-semibold text-slate-700 dark:text-slate-300">{lead.contactPerson}</span>
              </p>
            )}
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig[currentStatus].badgeClass}`}>
            {statusConfig[currentStatus].label}
          </span>
        </div>

        {/* Financial & Contact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border space-y-1" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Estimated Retainer
            </span>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>₹{formattedValue}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border space-y-1" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Email
            </span>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate" title={lead.email || 'N/A'}>
              {lead.email || 'Not provided'}
            </div>
          </div>

          <div className="p-3 rounded-xl border space-y-1" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Phone
            </span>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
              {lead.phone || 'Not provided'}
            </div>
          </div>
        </div>

        {/* Scope / Notes */}
        {lead.notes && (
          <div className="p-3 rounded-xl border text-xs space-y-1.5" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Requirement & Scope Notes:
            </span>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
              {lead.notes}
            </p>
          </div>
        )}

        {/* Status Pipeline Transition */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold block" style={{ color: 'var(--color-text-secondary)' }}>
            Update Pipeline Status:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['NEW', 'CONTACTED', 'PROPOSAL_SENT', 'WON', 'LOST'] as LeadStatus[]).map((st) => (
              <button
                type="button"
                key={st}
                disabled={isLoading || st === currentStatus}
                onClick={() => handleStatusChange(st)}
                className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  st === currentStatus
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Automated Workflow Notice */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Automated Onboarding Sequence (Triggers on WON)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Converts prospect to active Client account</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Creates initial KYC & Onboarding task</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Sends branded Welcome Email</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Generates eSign Engagement Letter</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
