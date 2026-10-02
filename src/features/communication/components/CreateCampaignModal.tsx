'use client';

import React, { useState } from 'react';
import { X, Megaphone, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  useCreateCampaignMutation,
  useGetTemplatesQuery,
} from '@/lib/store/api/communicationApi';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const { showToast } = useToast();
  const { data: templatesRes } = useGetTemplatesQuery();
  const [createCampaign, { isLoading: isSubmitting }] = useCreateCampaignMutation();

  const templates = templatesRes?.data || [];

  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [clientGroup, setClientGroup] = useState('');
  const [clientStatus, setClientStatus] = useState('');
  const [clientType, setClientType] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Campaign title is required', 'error');
      return;
    }
    if (!templateId) {
      showToast('Please select a message template', 'error');
      return;
    }

    try {
      const targetAudience: any = {};
      if (clientGroup.trim()) targetAudience.clientGroup = clientGroup.trim();
      if (clientStatus) targetAudience.status = clientStatus;
      if (clientType) targetAudience.type = clientType;

      await createCampaign({
        name,
        templateId,
        targetAudience: Object.keys(targetAudience).length > 0 ? targetAudience : undefined,
      }).unwrap();

      showToast('Broadcast campaign created as draft', 'success');
      onClose();
      setName('');
      setTemplateId('');
      setClientGroup('');
      setClientStatus('');
      setClientType('');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to create campaign', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#1E2B42] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1E2A38] dark:text-slate-100">
                Launch Broadcast Campaign
              </h3>
              <p className="text-xs text-[#5A6E85] dark:text-slate-400">
                Send segmented updates and reminders to your client base
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. March 2024 GST Filing Notice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
              Message Template <span className="text-red-500">*</span>
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C131F] text-[#1E2A38] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/30"
              required
            >
              <option value="">Select a template...</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  [{tpl.channel}] {tpl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Audience Segmentation */}
          <div className="p-4 rounded-xl bg-[#F7F9FB] dark:bg-[#0C131F] border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#1E2A38] dark:text-slate-200">
              <Users className="w-4 h-4 text-[#4A6FA5]" />
              <span>Audience Segmentation (Optional)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#5A6E85] dark:text-slate-400 mb-1">
                  Client Group
                </label>
                <Input
                  placeholder="e.g. Audit, Regular"
                  value={clientGroup}
                  onChange={(e) => setClientGroup(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#5A6E85] dark:text-slate-400 mb-1">
                  Client Type
                </label>
                <select
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] text-[#1E2A38] dark:text-slate-200"
                >
                  <option value="">All Types</option>
                  <option value="COMPANY">Company</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="FIRM">Partnership / LLP</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-[#5A6E85] dark:text-slate-400">
              Leave blank to dispatch to all active clients in your firm practice.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
