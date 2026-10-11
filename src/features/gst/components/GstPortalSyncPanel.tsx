'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  FileCheck2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useGetPortalStatusByGstinQuery,
  useGetClientPortalStatusQuery,
  useSyncClientPortalStatusMutation,
  useSyncAllClientsPortalStatusMutation,
} from '@/lib/store/api/gstApi';
import type { ClientPortalStatusResult, PortalStatusReturn } from '@/lib/types/gst.types';

interface GstPortalSyncPanelProps {
  clientId?: string;
  defaultGstin?: string;
}

export function GstPortalSyncPanel({ clientId, defaultGstin = '' }: GstPortalSyncPanelProps) {
  const { showToast } = useToast();
  const [searchGstin, setSearchGstin] = useState(defaultGstin);
  const [activeGstin, setActiveGstin] = useState(defaultGstin);
  const [financialYear, setFinancialYear] = useState('2026-27');

  const { data: gstinData, isLoading: isLoadingGstin, refetch: refetchGstin } =
    useGetPortalStatusByGstinQuery(
      { gstin: activeGstin, financialYear },
      { skip: !activeGstin }
    );

  const { data: clientData, isLoading: isLoadingClient, refetch: refetchClient } =
    useGetClientPortalStatusQuery(
      { clientId: clientId || '', financialYear },
      { skip: !clientId }
    );

  const [syncClientStatus, { isLoading: isSyncingClient }] = useSyncClientPortalStatusMutation();
  const [syncAllStatus, { isLoading: isSyncingAll }] = useSyncAllClientsPortalStatusMutation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchGstin.trim()) return;
    setActiveGstin(searchGstin.trim().toUpperCase());
  };

  const handleSyncClient = async () => {
    if (!clientId) {
      showToast('Please select a client from the top dropdown', 'info');
      return;
    }
    try {
      await syncClientStatus({ clientId, financialYear }).unwrap();
      showToast('Client GST filing status synced with portal', 'success');
      refetchClient();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to sync client filing status', 'error');
    }
  };

  const handleSyncAll = async () => {
    try {
      const res = await syncAllStatus({ financialYear }).unwrap();
      showToast(
        `Synchronized portal status for ${res.data?.syncedCount || 'all'} clients!`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.data?.message || 'Bulk sync failed', 'error');
    }
  };

  const currentResult: ClientPortalStatusResult | undefined =
    activeGstin ? gstinData?.data : clientData?.data;

  const returnsList = currentResult?.returns || [];

  return (
    <div className="space-y-4">
      {/* Top Controls & Sync Triggers */}
      <div
        className="p-5 rounded-2xl border shadow-xs space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <ShieldCheck className="w-5 h-5 text-[#4A6FA5]" />
              GST Portal Real-Time Status & Synchronization
            </h3>
            <p className="text-xs mt-0.5 text-[#5A6E85]">
              Fetch statutory return filing history and ARNs directly from the GST Portal without manual logins.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {clientId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncClient}
                isLoading={isSyncingClient}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncingClient ? 'animate-spin' : ''}`} />}
                className="text-xs"
              >
                Sync Client
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleSyncAll}
              isLoading={isSyncingAll}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />}
              className="text-xs bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
            >
              Bulk Sync All Firm Clients
            </Button>
          </div>
        </div>

        {/* GSTIN Search Bar & Year selector */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-[var(--color-border)]">
          <form onSubmit={handleSearch} className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchGstin}
              onChange={(e) => setSearchGstin(e.target.value.toUpperCase())}
              placeholder="Query any GSTIN (e.g. 27AABCU9603R1ZM)..."
              maxLength={15}
              className="w-full text-xs pl-9 pr-24 py-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-[#4A6FA5]"
            />
            <button
              type="submit"
              disabled={isLoadingGstin || !searchGstin.trim()}
              className="absolute right-1 top-1 px-3 py-1 text-xs font-semibold rounded-lg bg-[#4A6FA5] text-white hover:bg-[#3D5C8A] transition-colors disabled:opacity-50"
            >
              Check Portal
            </button>
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[#5A6E85] shrink-0">Financial Year:</span>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
            >
              <option value="2026-27">2026-27</option>
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results View */}
      {isLoadingGstin || isLoadingClient ? (
        <div className="py-16 text-center text-xs text-[#5A6E85]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#4A6FA5] mb-2" />
          Querying GST Portal registry...
        </div>
      ) : currentResult ? (
        <div
          className="rounded-2xl border shadow-xs overflow-hidden"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          {/* Header Card */}
          <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/40" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <div className="text-xs font-bold font-mono text-[#4A6FA5] flex items-center gap-2">
                <span>{currentResult.gstin}</span>
                {currentResult.legalName && (
                  <span className="text-slate-600 dark:text-slate-300 font-sans">
                    — {currentResult.legalName}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#5A6E85] mt-0.5">
                Financial Year: {financialYear} · Returns Tracked: {returnsList.length}
              </div>
            </div>

            {currentResult.lastSyncedAt && (
              <span className="text-[11px] text-[#5A6E85]">
                Last synced: {new Date(currentResult.lastSyncedAt).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b bg-[var(--color-bg-subtle)] text-[#5A6E85]" style={{ borderColor: 'var(--color-border)' }}>
                  <th className="py-2.5 px-4 font-semibold">Return Type</th>
                  <th className="py-2.5 px-4 font-semibold">Tax Period</th>
                  <th className="py-2.5 px-4 font-semibold">Portal Status</th>
                  <th className="py-2.5 px-4 font-semibold">Date of Filing</th>
                  <th className="py-2.5 px-4 font-semibold">ARN</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Filing Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {returnsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#8E9FAA]">
                      No returns recorded on the portal for this financial year
                    </td>
                  </tr>
                ) : (
                  returnsList.map((ret, i) => {
                    const isFiled = ret.status === 'Filed' || ret.status === 'FILED';

                    return (
                      <tr key={i} className="hover:bg-slate-500/5 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#1E2A38] dark:text-slate-200">
                          {ret.returnType}
                        </td>
                        <td className="py-3 px-4 text-[#5A6E85] font-mono">
                          {ret.taxPeriod}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isFiled
                                ? 'bg-[rgba(61,122,100,0.1)] text-[#3D7A64]'
                                : 'bg-[rgba(158,107,66,0.1)] text-[#9E6B42]'
                            }`}
                          >
                            {isFiled ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {ret.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#5A6E85]">
                          {ret.dateOfFiling
                            ? new Date(ret.dateOfFiling).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                          {ret.arn || '—'}
                        </td>
                        <td className="py-3 px-4 text-right text-[11px] text-[#5A6E85]">
                          {ret.modeOfFiling || 'ONLINE'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="p-10 rounded-2xl border text-center space-y-2 shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <ShieldCheck className="w-8 h-8 text-[#4A6FA5] mx-auto opacity-70" />
          <h4 className="text-sm font-bold text-[#1E2A38] dark:text-slate-200">
            Check Any GSTIN or Sync Client Records
          </h4>
          <p className="text-xs text-[#5A6E85] max-w-sm mx-auto">
            Search a GSTIN above or select a client to view official return filing status, ARNs, and filing dates pulled from GSTN.
          </p>
        </div>
      )}
    </div>
  );
}
