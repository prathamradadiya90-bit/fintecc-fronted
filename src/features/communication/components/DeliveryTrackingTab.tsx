'use client';

import React, { useState } from 'react';
import {
  Mail,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Send,
  Zap,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  useGetTrackingStatsQuery,
  useTriggerAutoFollowUpMutation,
} from '@/lib/store/api/communicationApi';

export function DeliveryTrackingTab() {
  const { showToast } = useToast();
  const [daysBack, setDaysBack] = useState<number>(30);
  const [returnType, setReturnType] = useState<string>('');

  const { data: response, isLoading, refetch } = useGetTrackingStatsQuery({
    daysBack,
    returnType: returnType || undefined,
  });

  const [triggerFollowUp, { isLoading: isFollowingUp }] = useTriggerAutoFollowUpMutation();

  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [daysUnopened, setDaysUnopened] = useState<number>(3);

  const stats = response?.data;
  const summary = stats?.summary || {
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalFailed: 0,
    unreadCount: 0,
    readRatePercentage: 0,
  };
  const logs = stats?.logs || [];

  const handleExecuteFollowUp = async () => {
    try {
      const res = await triggerFollowUp({
        daysUnopened,
        returnType: returnType || undefined,
      }).unwrap();
      showToast(
        res.data?.message ||
          `Follow-up dispatched: ${res.data?.nudgesDispatched || 0} reminders sent (${res.data?.skippedAlreadyFiled || 0} already filed skipped)`,
        'success'
      );
      setIsFollowUpModalOpen(false);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to trigger follow-ups', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READ':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#3D7A64]/10 text-[#3D7A64] border border-[#3D7A64]/20">
            Read
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20">
            Delivered
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Sent
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#9E4A4A]/10 text-[#9E4A4A] border border-[#9E4A4A]/20">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Follow-Up Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E]">
        <div>
          <h2 className="text-base font-semibold text-[#1E2A38] dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#4A6FA5]" />
            Email Delivery & Read Receipt Tracking
          </h2>
          <p className="text-xs text-[#5A6E85] dark:text-slate-400 mt-0.5">
            Real-time open tracking pixel metrics and automated follow-up engine for unread CA client reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsFollowUpModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
          >
            <Zap className="w-3.5 h-3.5" />
            Auto Follow-Up Unread
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E]">
          <div className="text-xs font-medium text-[#5A6E85] dark:text-slate-400">Total Dispatched</div>
          <div className="text-2xl font-bold text-[#1E2A38] dark:text-white mt-1">
            {summary.totalSent}
          </div>
          <div className="text-[11px] text-[#5A6E85] mt-1">Last {daysBack} days</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E]">
          <div className="text-xs font-medium text-[#5A6E85] dark:text-slate-400">Delivered</div>
          <div className="text-2xl font-bold text-[#4A6FA5] mt-1">
            {summary.totalDelivered}
          </div>
          <div className="text-[11px] text-[#5A6E85] mt-1">
            {summary.totalSent > 0
              ? `${Math.round((summary.totalDelivered / summary.totalSent) * 100)}% delivery rate`
              : '0%'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E]">
          <div className="text-xs font-medium text-[#5A6E85] dark:text-slate-400">Read & Opened</div>
          <div className="text-2xl font-bold text-[#3D7A64] mt-1">
            {summary.totalRead}
          </div>
          <div className="text-[11px] text-[#3D7A64] mt-1 font-medium">
            {summary.readRatePercentage}% read rate
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E]">
          <div className="text-xs font-medium text-[#5A6E85] dark:text-slate-400">Unread Reminders</div>
          <div className="text-2xl font-bold text-[#9E6B42] mt-1">
            {summary.unreadCount}
          </div>
          <div className="text-[11px] text-[#9E6B42] mt-1 font-medium">
            Eligible for auto follow-up
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[#1E2A38] dark:text-white">
          <Filter className="w-3.5 h-3.5 text-[#4A6FA5]" />
          Filter Logs:
        </div>

        <select
          value={daysBack}
          onChange={(e) => setDaysBack(Number(e.target.value))}
          className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] text-xs"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>

        <select
          value={returnType}
          onChange={(e) => setReturnType(e.target.value)}
          className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] text-xs"
        >
          <option value="">All Return Types</option>
          <option value="GSTR-3B">GSTR-3B</option>
          <option value="GSTR-1">GSTR-1</option>
          <option value="ADVANCE_TAX">Advance Tax</option>
          <option value="TDS">TDS</option>
          <option value="ITR">ITR</option>
          <option value="ROC">ROC</option>
        </select>
      </div>

      {/* Recipient Logs Table */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#5A6E85]">Loading delivery tracking logs...</div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E]">
          <Mail className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-[#1E2A38] dark:text-slate-200">No Tracking Logs Found</h3>
          <p className="text-xs text-[#5A6E85] dark:text-slate-400 mt-1">
            Dispatch a broadcast or due date reminder to view live tracking and open receipts.
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#131C2E]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1E2A38] dark:text-slate-200 divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-[#F7F9FB] dark:bg-[#0C131F] text-[#5A6E85] dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Client Recipient</th>
                  <th className="px-4 py-3">Subject / Notice</th>
                  <th className="px-4 py-3">Return</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">First Opened</th>
                  <th className="px-4 py-3">Opens</th>
                  <th className="px-4 py-3 text-right">Follow-Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-xs text-[#1E2A38] dark:text-white">
                        {log.clientName}
                      </div>
                      <div className="text-[11px] text-[#5A6E85] dark:text-slate-400">
                        {log.clientEmail || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={log.subject}>
                      {log.subject}
                    </td>
                    <td className="px-4 py-3">
                      {log.complianceType ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#4A6FA5]/10 text-[#4A6FA5]">
                          {log.complianceType}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                    <td className="px-4 py-3 text-[11px] text-[#5A6E85]">
                      {log.openedAt ? new Date(log.openedAt).toLocaleString() : 'Not opened yet'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-xs">
                      {log.openCount > 0 ? (
                        <span className="text-[#3D7A64]">{log.openCount}x</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {log.autoFollowUpSent ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-[#9E6B42]/10 text-[#9E6B42] font-medium">
                          Nudged
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Auto Follow-Up Modal */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title="Trigger Auto Follow-Up For Unopened Reminders"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-[#1E2A38] dark:text-slate-200">
          <p className="text-xs text-[#5A6E85] leading-relaxed">
            The auto follow-up engine searches for all clients who were sent reminder emails at least{' '}
            <span className="font-semibold">{daysUnopened} days ago</span> and have not yet opened them.
          </p>

          <div className="p-3 rounded-lg bg-[#3D7A64]/10 border border-[#3D7A64]/20 text-[11px] text-[#3D7A64]">
            <strong>Filing Safety Check:</strong> If any recipient has filed their return in the meantime,
            they will automatically be skipped to avoid unnecessary nudges.
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#5A6E85] dark:text-slate-300">
              Days Unopened Threshold
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={daysUnopened}
              onChange={(e) => setDaysUnopened(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFollowUpModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isFollowingUp}
              onClick={handleExecuteFollowUp}
              className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
            >
              {isFollowingUp ? 'Processing...' : 'Dispatch Follow-Up Nudges'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
