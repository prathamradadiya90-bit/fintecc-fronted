'use client';

import React, { useState } from 'react';
import {
  Bell,
  Play,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Filter,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  useGetNotificationRulesQuery,
  useCreateNotificationRuleMutation,
  useUpdateNotificationRuleMutation,
  useDeleteNotificationRuleMutation,
  useEvaluateNotificationRuleMutation,
  useEvaluateAllNotificationRulesMutation,
  useGetTemplatesQuery,
} from '@/lib/store/api/communicationApi';
import type {
  NotificationRule,
  NotificationRuleReturnType,
  NotificationRuleFilingStatus,
  NotificationRuleChannel,
} from '@/lib/types/communication.types';

export function NotificationRulesTab() {
  const { showToast } = useToast();
  const { data: response, isLoading, refetch } = useGetNotificationRulesQuery();
  const { data: templatesRes } = useGetTemplatesQuery();

  const [createRule, { isLoading: isCreating }] = useCreateNotificationRuleMutation();
  const [updateRule, { isLoading: isUpdating }] = useUpdateNotificationRuleMutation();
  const [deleteRule, { isLoading: isDeleting }] = useDeleteNotificationRuleMutation();
  const [evaluateRule, { isLoading: isEvaluating }] = useEvaluateNotificationRuleMutation();
  const [evaluateAll, { isLoading: isEvaluatingAll }] = useEvaluateAllNotificationRulesMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [returnType, setReturnType] = useState<NotificationRuleReturnType>('GSTR-3B');
  const [filingStatus, setFilingStatus] = useState<NotificationRuleFilingStatus>('PENDING');
  const [channel, setChannel] = useState<NotificationRuleChannel>('EMAIL');
  const [templateId, setTemplateId] = useState('');
  const [daysBeforeDueDate, setDaysBeforeDueDate] = useState<string>('7, 3, 1');
  const [isActive, setIsActive] = useState(true);

  const rules = response?.data || [];
  const templates = templatesRes?.data || [];

  const openCreateModal = () => {
    setEditingRule(null);
    setName('');
    setDescription('');
    setReturnType('GSTR-3B');
    setFilingStatus('PENDING');
    setChannel('EMAIL');
    setTemplateId('');
    setDaysBeforeDueDate('7, 3, 1');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: NotificationRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setDescription(rule.description || '');
    setReturnType(rule.returnType);
    setFilingStatus(rule.filingStatus);
    setChannel(rule.channel);
    setTemplateId(rule.templateId || '');
    setDaysBeforeDueDate(rule.daysBeforeDueDate?.join(', ') || '7, 3, 1');
    setIsActive(rule.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Rule name is required', 'error');
      return;
    }

    const parsedDays = daysBeforeDueDate
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 0);

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      returnType,
      filingStatus,
      channel,
      templateId: templateId || null,
      daysBeforeDueDate: parsedDays.length > 0 ? parsedDays : [7, 3, 1],
      isActive,
    };

    try {
      if (editingRule) {
        await updateRule({ id: editingRule.id, data: payload }).unwrap();
        showToast('Notification rule updated', 'success');
      } else {
        await createRule(payload).unwrap();
        showToast('Notification rule created', 'success');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to save rule', 'error');
    }
  };

  const handleDelete = async (rule: NotificationRule) => {
    if (!confirm(`Delete notification rule "${rule.name}"?`)) return;
    try {
      await deleteRule(rule.id).unwrap();
      showToast('Rule deleted', 'success');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete rule', 'error');
    }
  };

  const handleEvaluate = async (rule: NotificationRule) => {
    try {
      const res = await evaluateRule(rule.id).unwrap();
      showToast(
        res.data?.message || `Rule evaluated. Triggered notifications for matching clients.`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.data?.message || 'Evaluation failed', 'error');
    }
  };

  const handleEvaluateAll = async () => {
    try {
      const res = await evaluateAll().unwrap();
      showToast(res.data?.message || 'All active notification rules evaluated successfully', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Evaluation failed', 'error');
    }
  };

  const handleToggleStatus = async (rule: NotificationRule) => {
    try {
      await updateRule({ id: rule.id, data: { isActive: !rule.isActive } }).unwrap();
      showToast(`Rule ${!rule.isActive ? 'activated' : 'paused'}`, 'info');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to toggle rule', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E]">
        <div>
          <h2 className="text-base font-semibold text-[#1E2A38] dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#4A6FA5]" />
            Automated Notification & Reminder Rules
          </h2>
          <p className="text-xs text-[#5A6E85] dark:text-slate-400 mt-0.5">
            Configure automated reminder sequences triggered prior to statutory deadlines (e.g. T-7, T-3, T-1 days).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEvaluateAll}
            disabled={isEvaluatingAll}
            className="flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 text-[#3D7A64]" />
            {isEvaluatingAll ? 'Evaluating...' : 'Evaluate All Rules'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Rules Table / Cards */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#5A6E85]">Loading notification rules...</div>
      ) : rules.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E]">
          <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-[#1E2A38] dark:text-slate-200">No Rules Configured</h3>
          <p className="text-xs text-[#5A6E85] dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Create automated rules to proactively notify clients ahead of GSTR-1, GSTR-3B, or Advance Tax dates.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="mt-4 bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
          >
            Create First Rule
          </Button>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#131C2E]">
          <table className="w-full text-left text-xs text-[#1E2A38] dark:text-slate-200 divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-[#F7F9FB] dark:bg-[#0C131F] text-[#5A6E85] dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Rule Name & Scope</th>
                <th className="px-4 py-3">Return</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Trigger Schedule</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-sm text-[#1E2A38] dark:text-white">
                      {rule.name}
                    </div>
                    {rule.description && (
                      <div className="text-[11px] text-[#5A6E85] dark:text-slate-400 truncate max-w-xs">
                        {rule.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20">
                      {rule.returnType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-[#5A6E85] dark:text-slate-300 font-medium">
                      {rule.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#1E2A38] dark:text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-[#9E6B42]" />
                      <span>
                        {rule.daysBeforeDueDate && rule.daysBeforeDueDate.length > 0
                          ? `T - ${rule.daysBeforeDueDate.join(', ')} days`
                          : 'Immediate'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(rule)}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                        rule.isActive
                          ? 'bg-[#3D7A64]/10 text-[#3D7A64] border border-[#3D7A64]/20'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Paused'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Evaluate rule immediately"
                        onClick={() => handleEvaluate(rule)}
                        disabled={isEvaluating}
                        className="p-1 rounded text-[#3D7A64] hover:bg-[#3D7A64]/10 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Edit rule"
                        onClick={() => openEditModal(rule)}
                        className="p-1 rounded text-[#4A6FA5] hover:bg-[#4A6FA5]/10 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete rule"
                        onClick={() => handleDelete(rule)}
                        disabled={isDeleting}
                        className="p-1 rounded text-[#9E4A4A] hover:bg-[#9E4A4A]/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRule ? 'Edit Notification Rule' : 'New Automated Notification Rule'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs text-[#1E2A38] dark:text-slate-200">
          <div>
            <label className="block font-semibold mb-1 text-[#5A6E85] dark:text-slate-300">
              Rule Name <span className="text-[#9E4A4A]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GSTR-3B 7-Day & 3-Day Auto Nudge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-[#5A6E85] dark:text-slate-300">
                Statutory Return Type
              </label>
              <select
                value={returnType}
                onChange={(e) => setReturnType(e.target.value as NotificationRuleReturnType)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
              >
                <option value="GSTR-3B">GSTR-3B</option>
                <option value="GSTR-1">GSTR-1</option>
                <option value="ADVANCE_TAX">Advance Tax</option>
                <option value="TDS">TDS Monthly</option>
                <option value="ITR">Income Tax (ITR)</option>
                <option value="ROC">MCA / ROC</option>
                <option value="ALL">All Statutory Compliances</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#5A6E85] dark:text-slate-300">
                Target Filing Status
              </label>
              <select
                value={filingStatus}
                onChange={(e) => setFilingStatus(e.target.value as NotificationRuleFilingStatus)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
              >
                <option value="PENDING">PENDING (Unfiled clients)</option>
                <option value="OVERDUE">OVERDUE (Past due date)</option>
                <option value="ALL">ALL (Regardless of status)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-[#5A6E85] dark:text-slate-300">
                Notification Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as NotificationRuleChannel)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
              >
                <option value="EMAIL">Email Only</option>
                <option value="IN_APP">In-App Notification</option>
                <option value="BOTH">Both (Email + In-App)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#5A6E85] dark:text-slate-300">
                Days Before Due Date (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="7, 3, 1"
                value={daysBeforeDueDate}
                onChange={(e) => setDaysBeforeDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
              />
              <span className="text-[10px] text-[#5A6E85] mt-0.5 block">
                Evaluates clients when today is N days before statutory deadline.
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#5A6E85] dark:text-slate-300">
              Message Template (Optional)
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]"
            >
              <option value="">Default Fintecc CA Statutory Notice</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} ({tpl.channel})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="ruleIsActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-slate-300 text-[#4A6FA5] focus:ring-[#4A6FA5]"
            />
            <label htmlFor="ruleIsActive" className="font-medium text-[#1E2A38] dark:text-white cursor-pointer">
              Rule is active and enabled for automated evaluation
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isCreating || isUpdating}
              className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
            >
              {editingRule ? 'Save Changes' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
