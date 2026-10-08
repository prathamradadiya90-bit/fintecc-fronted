'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Mail,
  IndianRupee,
  LayoutGrid,
  List,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetLeadsQuery, useUpdateLeadStatusMutation } from '@/lib/store/api/leadsApi';
import { CreateLeadModal } from '@/components/leads/CreateLeadModal';
import { LeadDetailsModal } from '@/components/leads/LeadDetailsModal';
import { useToast } from '@/components/ui/Toast';
import type { Lead, LeadStatus } from '@/lib/types/lead.types';

const statusBadgeStyles: Record<LeadStatus, { label: string; badge: string; border: string }> = {
  NEW: {
    label: 'New Lead',
    badge: 'text-[#4A6FA5] bg-[#A8C5DA]/25 border-[#A8C5DA]/40',
    border: 'border-[#A8C5DA]/50',
  },
  CONTACTED: {
    label: 'Contacted',
    badge: 'text-[#9E6B42] bg-[rgba(158,107,66,0.08)] border-[rgba(158,107,66,0.2)]',
    border: 'border-[rgba(158,107,66,0.3)]',
  },
  PROPOSAL_SENT: {
    label: 'Proposal Sent',
    badge: 'text-[#4A6FA5] bg-[#4A6FA5]/10 border-[#4A6FA5]/25',
    border: 'border-[#4A6FA5]/30',
  },
  WON: {
    label: 'Won (Client)',
    badge: 'text-[#3D7A64] bg-[rgba(61,122,100,0.08)] border-[rgba(61,122,100,0.2)]',
    border: 'border-[rgba(61,122,100,0.3)]',
  },
  LOST: {
    label: 'Lost',
    badge: 'text-[#9E4A4A] bg-[rgba(158,74,74,0.08)] border-[rgba(158,74,74,0.2)]',
    border: 'border-[rgba(158,74,74,0.3)]',
  },
};

export default function LeadsCrmPage() {
  const { showToast } = useToast();
  const { data: leadsResponse, isLoading } = useGetLeadsQuery();
  const [updateLeadStatus] = useUpdateLeadStatusMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeadStatus>('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const leads = useMemo(() => leadsResponse?.data || [], [leadsResponse]);

  // Metrics
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    let totalPipelineValue = 0;
    let wonCount = 0;
    let wonValue = 0;

    leads.forEach((l) => {
      const val = Number(l.dealValue || l.estimatedValue || 0);
      if (l.status !== 'LOST') {
        totalPipelineValue += val;
      }
      if (l.status === 'WON') {
        wonCount += 1;
        wonValue += val;
      }
    });

    const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;
    const avgDealSize = totalLeads > 0 ? Math.round(totalPipelineValue / totalLeads) : 0;

    return {
      totalLeads,
      totalPipelineValue,
      wonCount,
      wonValue,
      conversionRate,
      avgDealSize,
    };
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        searchQuery === '' ||
        lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.contactPerson && lead.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  const handleQuickStatus = async (lead: Lead, newStatus: LeadStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateLeadStatus({ id: lead.id, status: newStatus }).unwrap();
      if (newStatus === 'WON') {
        showToast('Lead marked WON! Converted to Client & triggered automated onboarding workflow.', 'success');
      } else {
        showToast(`Lead status updated to ${newStatus}`, 'success');
      }
    } catch (err: unknown) {
      console.error('Quick status error:', err);
      const apiErr = err as { data?: { message?: string } };
      showToast(apiErr?.data?.message || 'Failed to update status', 'error');
    }
  };

  const openLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Client Onboarding & CRM Pipeline
            </h1>
            <span 
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border text-[#4A6FA5] dark:text-[#A8C5DA] bg-[#A8C5DA]/20 dark:bg-[#A8C5DA]/15 border-[#A8C5DA]/40 dark:border-[#A8C5DA]/40 shadow-xs"
            >
              Enterprise Workflow
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Track prospective client retainers, proposals, and trigger automated onboarding upon closing deals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add Prospective Lead
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-2xl border space-y-2"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Active Pipeline Leads
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#A8C5DA]/25 dark:bg-[#A8C5DA]/15 text-[#4A6FA5] dark:text-[#A8C5DA] border border-[#A8C5DA]/30 dark:border-[#A8C5DA]/30 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {metrics.totalLeads}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">In CRM funnel</span>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border space-y-2"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Total Pipeline Value
            </span>
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(61, 122, 100, 0.1)',
                color: '#3D7A64',
              }}
            >
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: '#3D7A64' }}>
              ₹{metrics.totalPipelineValue.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Estimated retainers</span>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border space-y-2"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Converted Deals (Won)
            </span>
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(61, 122, 100, 0.1)',
                color: '#3D7A64',
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {metrics.wonCount}
            </div>
            <span className="text-[11px] font-semibold" style={{ color: '#3D7A64' }}>
              ₹{metrics.wonValue.toLocaleString('en-IN')} signed
            </span>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border space-y-2"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Conversion Win Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#A8C5DA]/25 dark:bg-[#A8C5DA]/15 text-[#4A6FA5] dark:text-[#A8C5DA] border border-[#A8C5DA]/30 dark:border-[#A8C5DA]/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {metrics.conversionRate}%
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Proposal to Client ratio</span>
          </div>
        </div>
      </div>

      {/* Automated Onboarding Feature Callout */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: 'rgba(74, 111, 165, 0.05)',
          borderColor: 'rgba(74, 111, 165, 0.2)',
        }}
      >
        <div className="flex items-start gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border text-[#4A6FA5] dark:text-[#A8C5DA] bg-[#A8C5DA]/25 dark:bg-[#A8C5DA]/15 border-[#A8C5DA]/40 dark:border-[#A8C5DA]/40"
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text-heading)' }}>
              Automated Client Onboarding Engine
            </h2>
            <p className="text-xs mt-0.5 leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-secondary)' }}>
              When a lead&apos;s status transitions to <strong className="font-bold" style={{ color: '#3D7A64' }}>WON</strong>, the backend instantly converts the lead into an active <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Client profile</span>, generates an <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Onboarding Work Task</span>, dispatches a branded <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Welcome Email</span> via your custom SMTP, and initiates a <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Digital Signature Request</span>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-[#4A6FA5] dark:text-[#A8C5DA]">
          <span>Zero manual handoffs</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Filter and View Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by company, person or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#4A6FA5] font-medium"
              style={{
                background: 'var(--color-bg-subtle)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div className="hidden sm:flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'NEW', 'CONTACTED', 'PROPOSAL_SENT', 'WON', 'LOST'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-[#4A6FA5] text-white font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <div
            className="flex items-center p-0.5 rounded-xl border"
            style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-800 text-[#4A6FA5] shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Pipeline Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-[#4A6FA5] shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl border animate-pulse"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            />
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div
          className="p-12 text-center rounded-2xl border space-y-3"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              No Prospective Leads Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filter tags.'
                : 'Start tracking new prospective CA clients to automate onboarding workflows.'}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Create First Lead
          </Button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Pipeline Board */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {(['NEW', 'CONTACTED', 'PROPOSAL_SENT', 'WON', 'LOST'] as LeadStatus[]).map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage);
            const stageTotalVal = stageLeads.reduce(
              (acc, l) => acc + Number(l.dealValue || l.estimatedValue || 0),
              0
            );

            return (
              <div
                key={stage}
                className="rounded-2xl border p-3 space-y-3 flex flex-col min-h-[300px]"
                style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <div>
                    <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {statusBadgeStyles[stage].label}
                    </span>
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {stageLeads.length}
                    </span>
                  </div>
                  {stageTotalVal > 0 && (
                    <span className="text-[11px] font-bold" style={{ color: '#3D7A64' }}>
                      ₹{stageTotalVal.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 flex-1">
                  {stageLeads.map((lead) => {
                    const dealVal = Number(lead.dealValue || lead.estimatedValue || 0);

                    return (
                      <div
                        key={lead.id}
                        onClick={() => openLeadDetails(lead)}
                        className="p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-md hover:border-[#4A6FA5]/40 space-y-2.5 group"
                        style={{
                          background: 'var(--color-bg-subtle)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold leading-tight group-hover:text-[#4A6FA5] transition-colors" style={{ color: 'var(--color-text-primary)' }}>
                            {lead.companyName}
                          </h4>
                          {dealVal > 0 && (
                            <span className="text-[11px] font-bold shrink-0" style={{ color: '#3D7A64' }}>
                              ₹{dealVal.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {lead.contactPerson && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                              {lead.contactPerson}
                            </span>
                          </p>
                        )}

                        {lead.email && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                        )}

                        {/* Quick action footer */}
                        <div className="pt-2 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--color-border-subtle)' }}>
                          <span className="text-[10px] text-slate-400">
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>

                          {lead.status !== 'WON' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickStatus(lead, 'WON', e)}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                              style={{
                                background: 'rgba(61, 122, 100, 0.08)',
                                color: '#3D7A64',
                              }}
                              title="Mark WON to auto-onboard client"
                            >
                              Win 🤝
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-subtle)' }}>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Company Name</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Contact Person</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Email & Phone</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Estimated Value</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Pipeline Stage</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {filteredLeads.map((lead) => {
                  const dealVal = Number(lead.dealValue || lead.estimatedValue || 0);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => openLeadDetails(lead)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {lead.companyName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Added {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {lead.contactPerson || '—'}
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        <div>{lead.email || '—'}</div>
                        <div className="text-[11px] text-slate-400">{lead.phone || ''}</div>
                      </td>

                      <td className="py-3 px-4 font-bold" style={{ color: '#3D7A64' }}>
                        {dealVal > 0 ? `₹${dealVal.toLocaleString('en-IN')}` : '—'}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadgeStyles[lead.status].badge}`}>
                          {statusBadgeStyles[lead.status].label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {lead.status !== 'WON' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleQuickStatus(lead, 'WON', e)}
                            className="text-xs"
                            style={{
                              color: '#3D7A64',
                              borderColor: 'rgba(61, 122, 100, 0.3)',
                              background: 'rgba(61, 122, 100, 0.05)',
                            }}
                          >
                            Mark WON 🤝
                          </Button>
                        ) : (
                          <span className="text-[11px] font-semibold flex items-center justify-end gap-1" style={{ color: '#3D7A64' }}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Client Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <LeadDetailsModal
        lead={selectedLead}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}
