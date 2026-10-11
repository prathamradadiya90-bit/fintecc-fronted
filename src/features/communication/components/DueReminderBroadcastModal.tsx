'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Send,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Eye,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useSendDueRemindersMutation,
  useGetTemplatesQuery,
} from '@/lib/store/api/communicationApi';
import type {
  ComplianceReminderType,
  DueReminderResult,
} from '@/lib/types/communication.types';

interface DueReminderBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMPLIANCE_OPTIONS: { value: ComplianceReminderType; label: string; defaultDay: number }[] = [
  { value: 'GSTR-3B', label: 'GSTR-3B (Monthly Summary Return)', defaultDay: 20 },
  { value: 'GSTR-1', label: 'GSTR-1 (Outward Supplies Return)', defaultDay: 11 },
  { value: 'ADVANCE_TAX', label: 'Advance Tax Installment', defaultDay: 15 },
  { value: 'TDS', label: 'TDS Monthly Deposit (Challan 281)', defaultDay: 7 },
  { value: 'ITR', label: 'Income Tax Return (ITR)', defaultDay: 31 },
  { value: 'ROC', label: 'MCA / ROC Annual Filings (AOC-4 / MGT-7)', defaultDay: 30 },
  { value: 'GST', label: 'General Statutory GST Compliance', defaultDay: 20 },
];

export function DueReminderBroadcastModal({
  isOpen,
  onClose,
  onSuccess,
}: DueReminderBroadcastModalProps) {
  const { showToast } = useToast();
  const [sendDueReminders, { isLoading: isDispatching }] = useSendDueRemindersMutation();
  const { data: templatesRes } = useGetTemplatesQuery({ channel: 'EMAIL' });

  const [complianceType, setComplianceType] = useState<ComplianceReminderType>('GSTR-3B');
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(20);
    return d.toISOString().split('T')[0];
  });
  const [period, setPeriod] = useState<string>('September 2026');
  const [templateId, setTemplateId] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customBody, setCustomBody] = useState<string>('');
  
  // Segment filters
  const [sendToAll, setSendToAll] = useState(true);
  const [clientGroup, setClientGroup] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [city, setCity] = useState('');

  // Preview state
  const [previewResult, setPreviewResult] = useState<DueReminderResult | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const templates = templatesRes?.data || [];

  const handleComplianceChange = (type: ComplianceReminderType) => {
    setComplianceType(type);
    const opt = COMPLIANCE_OPTIONS.find((o) => o.value === type);
    if (opt) {
      const d = new Date();
      d.setDate(opt.defaultDay);
      setDueDate(d.toISOString().split('T')[0]);
    }
    setPreviewResult(null);
  };

  const getPayload = (previewOnly: boolean) => ({
    complianceType,
    dueDate,
    period: period.trim() || undefined,
    templateId: templateId ? templateId : undefined,
    customSubject: customSubject.trim() || undefined,
    customBody: customBody.trim() || undefined,
    segment: {
      sendToAll,
      clientGroup: clientGroup.trim() || undefined,
      serviceType: serviceType.trim() || undefined,
      city: city.trim() || undefined,
    },
    preview: previewOnly,
  });

  const handlePreviewAudience = async () => {
    if (!dueDate) {
      showToast('Please select a statutory due date first', 'error');
      return;
    }
    setIsPreviewing(true);
    try {
      const res = await sendDueReminders(getPayload(true)).unwrap();
      if (res.data) {
        setPreviewResult(res.data);
        showToast(
          `Preview loaded: ${res.data.nudgedClientsCount} pending, ${res.data.skippedAlreadyFiledCount} already filed (auto-excluded)`,
          'info'
        );
      }
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to simulate audience', 'error');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDispatch = async () => {
    if (!dueDate) {
      showToast('Please specify the due date', 'error');
      return;
    }
    try {
      const res = await sendDueReminders(getPayload(false)).unwrap();
      showToast(
        `Successfully sent reminders to ${res.data?.nudgedClientsCount || 0} clients. ${res.data?.skippedAlreadyFiledCount || 0} clients who already filed were excluded!`,
        'success'
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to dispatch due date reminders', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scheduled Due Date Reminder Broadcast"
      maxWidth="xl"
    >
      <div className="space-y-5 text-sm text-[#1E2A38] dark:text-slate-100">
        <div className="p-3.5 rounded-lg bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#4A6FA5] shrink-0 mt-0.5" />
          <div className="text-xs text-[#5A6E85] dark:text-slate-300 leading-relaxed">
            <span className="font-semibold text-[#1E2A38] dark:text-white">
              Smart Auto-Exclusion Active:
            </span>{' '}
            Clients who have already completed or verified their statutory filing for this period
            are automatically excluded from receiving redundant reminder emails.
          </div>
        </div>

        {/* Return Type & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A6E85] dark:text-slate-300 mb-1.5">
              Statutory Return / Compliance
            </label>
            <select
              value={complianceType}
              onChange={(e) => handleComplianceChange(e.target.value as ComplianceReminderType)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
            >
              {COMPLIANCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A6E85] dark:text-slate-300 mb-1.5">
              Statutory Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setPreviewResult(null);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
              />
            </div>
          </div>
        </div>

        {/* Period & Template */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A6E85] dark:text-slate-300 mb-1.5">
              Filing Period / Quarter
            </label>
            <input
              type="text"
              placeholder="e.g. September 2026 or Q2 FY 2026-27"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A6E85] dark:text-slate-300 mb-1.5">
              Branded Message Template (Optional)
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
            >
              <option value="">Default Fintecc CA Due Reminder Template</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Subject & Body Override (Optional) */}
        {!templateId && (
          <div className="space-y-3 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F]">
            <div>
              <label className="block text-xs font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Custom Subject (Optional override)
              </label>
              <input
                type="text"
                placeholder="e.g. Urgent Reminder: GSTR-3B Filing Due by 20th"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Custom Email Body / Additional Notice (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Please share pending purchase invoices and bank statements before the 18th to avoid Section 47 late fees..."
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
              />
            </div>
          </div>
        )}

        {/* Segment Filters */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E2A38] dark:text-white">
              <Filter className="w-4 h-4 text-[#4A6FA5]" />
              Target Client Audience
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer text-[#5A6E85] dark:text-slate-300">
              <input
                type="checkbox"
                checked={sendToAll}
                onChange={(e) => {
                  setSendToAll(e.target.checked);
                  setPreviewResult(null);
                }}
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
                  placeholder="e.g. VIP, Manufacturing"
                  value={clientGroup}
                  onChange={(e) => {
                    setClientGroup(e.target.value);
                    setPreviewResult(null);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#5A6E85] dark:text-slate-400 mb-1">
                  Service / Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. GST, Audit, Regular"
                  value={serviceType}
                  onChange={(e) => {
                    setServiceType(e.target.value);
                    setPreviewResult(null);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#5A6E85] dark:text-slate-400 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Ahmedabad"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPreviewResult(null);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Audience Preview Panel */}
        {previewResult && (
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1E2A38] dark:text-white">
              <span>Audience Simulation Breakdown</span>
              <span className="text-[11px] text-[#5A6E85]">
                Total Matched: {previewResult.totalMatchedClients}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-md bg-[#3D7A64]/10 border border-[#3D7A64]/20">
                <div className="text-[11px] font-medium text-[#3D7A64]">
                  Auto-Excluded (Already Filed)
                </div>
                <div className="text-xl font-bold text-[#3D7A64]">
                  {previewResult.skippedAlreadyFiledCount}
                </div>
                <p className="text-[10px] text-[#5A6E85] mt-0.5">
                  Verified as filed in portal or tasks
                </p>
              </div>

              <div className="p-2.5 rounded-md bg-[#9E6B42]/10 border border-[#9E6B42]/20">
                <div className="text-[11px] font-medium text-[#9E6B42]">
                  Recipients to Nudge (Pending)
                </div>
                <div className="text-xl font-bold text-[#9E6B42]">
                  {previewResult.nudgedClientsCount}
                </div>
                <p className="text-[10px] text-[#5A6E85] mt-0.5">
                  Will receive branded reminder email
                </p>
              </div>
            </div>

            {previewResult.nudgedList?.length > 0 && (
              <div className="mt-2 text-[11px] text-[#5A6E85]">
                <div className="font-semibold text-[#1E2A38] dark:text-slate-200 mb-1">
                  Sample Pending Clients to be Contacted:
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {previewResult.nudgedList.slice(0, 5).map((cl, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-2 py-1 rounded bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 text-[10px]"
                    >
                      <span className="font-medium text-[#1E2A38] dark:text-slate-200">
                        {cl.clientName}
                      </span>
                      <span className="text-slate-400">{cl.email || 'No email on record'}</span>
                    </div>
                  ))}
                  {previewResult.nudgedList.length > 5 && (
                    <div className="text-[10px] text-center text-slate-400 italic">
                      + {previewResult.nudgedList.length - 5} more clients
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreviewAudience}
            disabled={isPreviewing || isDispatching}
            className="flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            {isPreviewing ? 'Simulating...' : 'Preview Audience'}
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDispatch}
              disabled={isDispatching}
              className="flex items-center gap-1.5 bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
            >
              <Send className="w-3.5 h-3.5" />
              {isDispatching ? 'Broadcasting...' : 'Dispatch Reminder Broadcast'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
