'use client';

import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useGetCampaignsQuery,
  useSendCampaignMutation,
  useDeleteCampaignMutation,
} from '@/lib/store/api/communicationApi';
import { CreateCampaignModal } from '@/features/communication/components/CreateCampaignModal';
import { TemplatesTab } from '@/features/communication/components/TemplatesTab';
import type { BulkCampaign, CampaignStatus } from '@/lib/types/communication.types';

export default function CampaignsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: response, isLoading, refetch } = useGetCampaignsQuery();
  const [sendCampaign, { isLoading: isSending }] = useSendCampaignMutation();
  const [deleteCampaign, { isLoading: isDeleting }] = useDeleteCampaignMutation();

  const campaigns = response?.data || [];

  const stats = useMemo(() => {
    let totalSent = 0;
    let totalFailed = 0;
    let completedCount = 0;

    campaigns.forEach((c) => {
      totalSent += c.sentCount || 0;
      totalFailed += c.failedCount || 0;
      if (c.status === 'COMPLETED') completedCount++;
    });

    return {
      total: campaigns.length,
      completed: completedCount,
      sent: totalSent,
      failed: totalFailed,
    };
  }, [campaigns]);

  const handleBroadcast = async (campaign: BulkCampaign) => {
    if (!confirm(`Broadcast campaign "${campaign.name}" to matching clients now?`)) return;
    try {
      await sendCampaign(campaign.id).unwrap();
      showToast('Campaign broadcast initiated successfully', 'success');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to dispatch broadcast', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete campaign "${name}"?`)) return;
    try {
      await deleteCampaign(id).unwrap();
      showToast('Campaign deleted', 'success');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete campaign', 'error');
    }
  };

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#3D7A64]/10 text-[#3D7A64] border border-[#3D7A64]/20">
            Completed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20 animate-pulse">
            Broadcasting...
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-[#5A6E85] dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Draft
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#9E4A4A]/10 text-[#9E4A4A] border border-[#9E4A4A]/20">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#9E6B42]/10 text-[#9E6B42]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1E2A38] dark:text-slate-100">
              Bulk Communication & Campaigns
            </h1>
            <p className="text-xs text-[#5A6E85] dark:text-slate-400">
              Broadcast compliance updates, invoice reminders, and notices across WhatsApp, Email & SMS
            </p>
          </div>
        </div>

        {activeTab === 'campaigns' && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white flex items-center space-x-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Broadcast Campaign</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'campaigns'
              ? 'border-[#4A6FA5] text-[#4A6FA5]'
              : 'border-transparent text-[#5A6E85] dark:text-slate-400 hover:text-[#1E2A38] dark:hover:text-slate-200'
          }`}
        >
          Broadcast Campaigns
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'templates'
              ? 'border-[#4A6FA5] text-[#4A6FA5]'
              : 'border-transparent text-[#5A6E85] dark:text-slate-400 hover:text-[#1E2A38] dark:hover:text-slate-200'
          }`}
        >
          Message Templates
        </button>
      </div>

      {activeTab === 'templates' ? (
        <TemplatesTab />
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#5A6E85] dark:text-slate-400">Total Campaigns</span>
                <div className="text-xl font-bold text-[#1E2A38] dark:text-slate-100 mt-0.5">
                  {stats.total}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#5A6E85] dark:text-slate-400">Completed Dispatches</span>
                <div className="text-xl font-bold text-[#3D7A64] mt-0.5">
                  {stats.completed}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#3D7A64]/10 text-[#3D7A64] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#5A6E85] dark:text-slate-400">Messages Delivered</span>
                <div className="text-xl font-bold text-[#4A6FA5] mt-0.5">
                  {stats.sent}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#5A6E85] dark:text-slate-400">Failed / Undelivered</span>
                <div className="text-xl font-bold text-[#9E4A4A] mt-0.5">
                  {stats.failed}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#9E4A4A]/10 text-[#9E4A4A] flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-[#1E2B42] overflow-hidden">
            {isLoading ? (
              <div className="p-8 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/40 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-16">
                <Megaphone className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-medium text-[#1E2A38] dark:text-slate-200">
                  No broadcast campaigns created yet
                </p>
                <p className="text-xs text-[#5A6E85] dark:text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                  Configure mass messages to send WhatsApp tax reminders, GSTR alerts, or welcome communications.
                </p>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white text-xs"
                >
                  Create First Campaign
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] text-[#5A6E85] dark:text-slate-400 font-semibold">
                      <th className="py-3 px-4">Campaign Title</th>
                      <th className="py-3 px-4">Channel & Template</th>
                      <th className="py-3 px-4">Target Audience</th>
                      <th className="py-3 px-4">Progress / Delivered</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {campaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                        <td className="py-3 px-4 font-semibold text-[#1E2A38] dark:text-slate-200">
                          {camp.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#1E2A38] dark:text-slate-300 block">
                            {camp.template?.name || 'Linked Template'}
                          </span>
                          <span className="text-[11px] text-[#5A6E85] dark:text-slate-400">
                            {camp.template?.channel || 'WHATSAPP'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#5A6E85] dark:text-slate-400">
                            {camp.targetAudience?.clientGroup
                              ? `Group: ${camp.targetAudience.clientGroup}`
                              : camp.targetAudience?.type
                              ? `Type: ${camp.targetAudience.type}`
                              : 'All Active Clients'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#1E2A38] dark:text-slate-200">
                            {camp.sentCount} / {camp.totalRecipients || '—'}
                          </span>
                          {camp.failedCount > 0 && (
                            <span className="text-[11px] text-[#9E4A4A] ml-1.5">
                              ({camp.failedCount} failed)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(camp.status)}</td>
                        <td className="py-3 px-4 text-[#5A6E85] dark:text-slate-400">
                          {new Date(camp.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {camp.status !== 'COMPLETED' && camp.status !== 'IN_PROGRESS' && (
                              <Button
                                size="sm"
                                onClick={() => handleBroadcast(camp)}
                                disabled={isSending}
                                className="h-7 px-2.5 bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white text-[11px] flex items-center space-x-1"
                              >
                                <Send className="w-3 h-3" />
                                <span>Broadcast Now</span>
                              </Button>
                            )}
                            <button
                              onClick={() => handleDelete(camp.id, camp.name)}
                              className="p-1 text-slate-400 hover:text-[#9E4A4A] transition"
                              title="Delete campaign"
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
          </div>

          <CreateCampaignModal
            isOpen={isCreateOpen}
            onClose={() => {
              setIsCreateOpen(false);
              refetch();
            }}
          />
        </>
      )}
    </div>
  );
}
