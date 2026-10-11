'use client';

import React, { useState } from 'react';
import { Megaphone, Send, Filter, ShieldCheck, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useSendEmailBroadcastMutation,
  useGetTemplatesQuery,
} from '@/lib/store/api/communicationApi';
import type { BroadcastType } from '@/lib/types/communication.types';

interface ComposeBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const BROADCAST_TYPES: { value: BroadcastType; label: string; desc: string }[] = [
  { value: 'CIRCULAR', label: 'Statutory Circular / Advisory', desc: 'GST/ITR/MCA legal amendments or compliance updates' },
  { value: 'BUDGET_UPDATE', label: 'Union Budget / Tax Notification', desc: 'Summary of Finance Act changes or rate notifications' },
  { value: 'FIRM_ANNOUNCEMENT', label: 'CA Firm Announcement', desc: 'Office holiday notice, audit season guidance, new partners' },
  { value: 'GENERAL', label: 'General Broadcast Notice', desc: 'Custom advisory or newsletter to client roster' },
];

export function ComposeBroadcastModal({
  isOpen,
  onClose,
  onSuccess,
}: ComposeBroadcastModalProps) {
  const { showToast } = useToast();
  const [sendBroadcast, { isLoading }] = useSendEmailBroadcastMutation();
  const { data: templatesRes } = useGetTemplatesQuery({ channel: 'EMAIL' });

  const [type, setType] = useState<BroadcastType>('CIRCULAR');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateId, setTemplateId] = useState('');

  // Segment filters
  const [sendToAll, setSendToAll] = useState(true);
  const [clientGroup, setClientGroup] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [city, setCity] = useState('');

  const templates = templatesRes?.data || [];

  const handleTemplateSelect = (id: string) => {
    setTemplateId(id);
    const chosen = templates.find((t) => t.id === id);
    if (chosen) {
      if (chosen.subject) setSubject(chosen.subject);
      setBody(chosen.body);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      showToast('Subject is required', 'error');
      return;
    }
    if (!body.trim()) {
      showToast('Message body is required', 'error');
      return;
    }

    try {
      await sendBroadcast({
        type,
        name: name.trim() || undefined,
        subject: subject.trim(),
        body: body.trim(),
        templateId: templateId || undefined,
        segment: {
          sendToAll,
          clientGroup: clientGroup.trim() || undefined,
          serviceType: serviceType.trim() || undefined,
          city: city.trim() || undefined,
        },
      }).unwrap();

      showToast('Email broadcast dispatched to client roster successfully', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to dispatch broadcast', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compose Email Broadcast (Circular / Advisory)"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-[#1E2A38] dark:text-slate-100">
        <div className="p-3.5 rounded-lg bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-[#4A6FA5] shrink-0 mt-0.5" />
          <div className="text-xs text-[#5A6E85] dark:text-slate-300 leading-relaxed">
            Broadcast official circulars, regulatory advisories, and firm announcements directly
            to clients with high-deliverability CA firm email headers and read-tracking pixels.
          </div>
        </div>

        {/* Broadcast Type & Internal Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A6E85] dark:text-slate-300 mb-1.5">
              Broadcast Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as BroadcastType)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
            >
              {BROADCAST_TYPES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A6E85] dark:text-slate-300 mb-1.5">
              Internal Campaign Label (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. October 2026 GST Notification Circular"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
            />
          </div>
        </div>

        {/* Load Template */}
        <div>
          <label className="block text-xs font-semibold text-[#5A6E85] dark:text-slate-300 mb-1.5">
            Load From Template (Optional)
          </label>
          <select
            value={templateId}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
          >
            <option value="">Start with blank message</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-[#5A6E85] dark:text-slate-300 mb-1.5">
            Email Subject Line <span className="text-[#9E4A4A]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Important Advisory: CBIC Notification on E-Invoicing Thresholds"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-semibold text-[#5A6E85] dark:text-slate-300 mb-1.5">
            Message Body <span className="text-[#9E4A4A]">*</span>
          </label>
          <textarea
            required
            rows={5}
            placeholder="Dear Client,&#10;&#10;Please find below an important advisory regarding statutory compliance changes effective this month..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] font-sans"
          />
        </div>

        {/* Audience Filtering */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E2A38] dark:text-white">
              <Filter className="w-4 h-4 text-[#4A6FA5]" />
              Recipient Audience
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer text-[#5A6E85] dark:text-slate-300">
              <input
                type="checkbox"
                checked={sendToAll}
                onChange={(e) => setSendToAll(e.target.checked)}
                className="rounded border-slate-300 text-[#4A6FA5] focus:ring-[#4A6FA5]"
              />
              Send to All Clients
            </label>
          </div>

          {!sendToAll && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-[#5A6E85] dark:text-slate-400 mb-1">
                  Client Group
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP, Corporates"
                  value={clientGroup}
                  onChange={(e) => setClientGroup(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#5A6E85] dark:text-slate-400 mb-1">
                  Service / Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. GST, Audit"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#5A6E85] dark:text-slate-400 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
          >
            <Send className="w-3.5 h-3.5" />
            {isLoading ? 'Dispatching...' : 'Dispatch Broadcast'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
