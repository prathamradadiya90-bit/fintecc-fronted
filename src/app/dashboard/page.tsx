'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetDashboardStatsQuery } from '@/lib/store/api/dashboardApi';
import { useGetDocumentsByClientIdQuery } from '@/lib/store/api/clientDocumentsApi';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentClientsTable } from '@/components/dashboard/RecentClientsTable';
import { DscExpiringWidget } from '@/components/dsc/DscExpiringWidget';
import { AnnouncementBanner } from '@/components/common/AnnouncementBanner';
import { 
  Users, FileText, UserCheck, Sparkles, MessageSquare, ArrowRight, 
  ShieldCheck, Calendar, Database, Clock, UploadCloud, 
  Check, AlertTriangle, Cable, ArrowUpRight 
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

export default function DashboardPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const isClient = user?.role === 'CLIENT';
  const clientId = user?.clientId;

  const { data, isLoading } = useGetDashboardStatsQuery(undefined, {
    skip: isClient,
  });

  const { data: clientsData } = useGetClientsQuery(undefined, {
    skip: isClient,
  });

  const { data: clientDocsData } = useGetDocumentsByClientIdQuery(clientId || '', {
    skip: !isClient || !clientId,
  });

  const stats = data?.data;
  const clients = clientsData?.data || [];
  const clientDocs = clientDocsData?.data || [];

  // Format date for the header
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const firmName = (user as any)?.firmName || (user?.name ? `${user.name}'s Practice` : 'Sharma & Associates CA');

  // Client Portal Home View
  if (isClient) {
    return (
      <div className="w-full space-y-6 pb-10">
        <AnnouncementBanner />
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: 'var(--color-text-heading)' }}
            >
              Welcome back, {user?.name?.split(' ')[0] || 'Client'} 👋
            </h1>
            <p
              className="mt-1 text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Manage your CA communications and documents in one secure institutional vault.
            </p>
          </div>
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold w-fit border"
            style={{
              background: 'var(--color-status-success-bg, rgba(61, 122, 100, 0.08))',
              borderColor: 'var(--color-status-success-border, rgba(61, 122, 100, 0.2))',
              color: 'var(--color-status-success-text, #3D7A64)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3D7A64] animate-pulse" />
            <ShieldCheck className="w-4 h-4 text-[#3D7A64]" />
            Client Portal Verified
          </div>
        </div>

        {/* Quick Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Chat Card */}
          <Link
            href="/dashboard/chat"
            className="rounded-xl p-6 flex flex-col justify-between shadow-xl transition-all duration-200 group relative overflow-hidden"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform border"
                style={{
                  background: 'rgba(74, 111, 165, 0.1)',
                  borderColor: 'rgba(74, 111, 165, 0.25)',
                  color: '#4A6FA5',
                }}
              >
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2
                className="text-base font-bold group-hover:text-[#4A6FA5] transition-colors"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Chat with Your CA
              </h2>
              <p
                className="text-xs mt-1.5 leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Have questions or need assistance with GST, tax filings, or accounts? Message your CA firm directly with real-time updates.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 font-semibold text-xs text-[#4A6FA5]">
              Open Secure Chat
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4A6FA5]/40 to-transparent" />
          </Link>

          {/* Documents Card */}
          <Link
            href="/dashboard/documents"
            className="rounded-xl p-6 flex flex-col justify-between shadow-xl transition-all duration-200 group relative overflow-hidden"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h2
                  className="text-base font-bold group-hover:text-cyan-400 transition-colors"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Documents & Uploads
                </h2>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-semibold font-mono text-cyan-400"
                  style={{
                    background: 'var(--color-bg-card-hover)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {clientDocs.length} {clientDocs.length === 1 ? 'file' : 'files'}
                </span>
              </div>
              <p
                className="text-xs mt-1.5 leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Upload requested proofs, invoices, bank statements, and tax receipts. Download certified returns uploaded by your CA.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 font-semibold text-xs text-cyan-400">
              View All Documents
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent" />
          </Link>
        </div>
      </div>
    );
  }

  // Professional CA Firm Operating System View
  return (
    <div className="w-full space-y-6 pb-12">
      <AnnouncementBanner />
      
      {/* Welcome Header Banner */}
      <section
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: 'var(--color-text-heading)' }}
            >
              Good morning, {user?.name?.split(' ')[0] || 'CA'}
            </h1>
            <span className="text-xl">👋</span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#4A6FA5] dark:text-[#A8C5DA] bg-[#A8C5DA]/20 dark:bg-[#A8C5DA]/15 border border-[#A8C5DA]/40 dark:border-[#A8C5DA]/40 shadow-xs"
            >
              {firmName}
            </span>
          </div>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Practice Overview & Statutory Compliance Command Center
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Calendar className="w-3.5 h-3.5 text-[#4A6FA5] dark:text-[#A8C5DA]" />
            FY 2024-25 (Q4)
          </span>
        </div>
      </section>

      {/* Expiring DSC Alert Widget */}
      <DscExpiringWidget />

      {/* AI Insights Banner (if available) */}
      {stats?.aiInsights && stats.aiInsights.length > 0 && (
        <div
          className="rounded-xl p-4 flex items-start gap-3 shadow-sm border border-[#A8C5DA]/40"
          style={{ background: 'var(--color-bg-card)' }}
        >
          <div className="p-2 rounded-lg bg-[#A8C5DA]/20 border border-[#A8C5DA]/30 text-[#4A6FA5] dark:text-[#A8C5DA] shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-[#4A6FA5] dark:text-[#A8C5DA]">Fintecc AI Statutory Insight</h3>
            <p
              className="text-xs leading-relaxed mt-0.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {stats.aiInsights[0]}
            </p>
          </div>
        </div>
      )}

      {/* Key Operational Metrics Grid (4 Stat Cards) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="rounded-xl h-28 animate-pulse"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
              }}
            />
          ))}
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Total Clients */}
          <StatCard 
            title="Total Clients" 
            value={stats?.totalClients || 1} 
            icon={Users} 
            trend={{ value: '18.4%', isPositive: true }}
            subtitle="Active entity portfolios"
            colorClass="text-[#4A6FA5] dark:text-[#A8C5DA] bg-[#A8C5DA]/25 dark:bg-[#A8C5DA]/15 border border-[#A8C5DA]/30 dark:border-[#A8C5DA]/30 shadow-xs"
            accentGradient="from-[#4A6FA5]/40"
          />
          {/* Stat 2: Statements Converted */}
          <StatCard 
            title="Statements Converted" 
            value={stats?.pdfsConverted || 1428} 
            icon={FileText} 
            trend={{ value: '99.4% OCR', isPositive: true }}
            subtitle="From 34 partner bank formats"
            colorClass="text-[#4A6FA5] dark:text-[#A8C5DA] bg-[#A8C5DA]/25 dark:bg-[#A8C5DA]/15 border border-[#A8C5DA]/30 dark:border-[#A8C5DA]/30 shadow-xs"
            accentGradient="from-[#4A6FA5]/40"
          />
          {/* Stat 3: Hours Saved */}
          <StatCard 
            title="Hours Saved (Manual Entry)" 
            value="~340 Hrs" 
            icon={Clock} 
            subtitle="≈ ₹1,80,000 billable value"
            colorClass="text-[#4A6FA5] dark:text-[#A8C5DA] bg-[#A8C5DA]/25 dark:bg-[#A8C5DA]/15 border border-[#A8C5DA]/30 dark:border-[#A8C5DA]/30 shadow-xs"
            accentGradient="from-[#4A6FA5]/40"
          />
          {/* Stat 4: Staff Members */}
          <StatCard 
            title="Active CA Team Members" 
            value={stats?.staffCount || 6} 
            icon={UserCheck} 
            subtitle="Audit managers & associates"
            colorClass="text-[#4A6FA5] dark:text-[#A8C5DA] bg-[#A8C5DA]/25 dark:bg-[#A8C5DA]/15 border border-[#A8C5DA]/30 dark:border-[#A8C5DA]/30 shadow-xs"
            accentGradient="from-[#4A6FA5]/40"
          />
        </section>
      )}

      {/* Streamlined Statement Automation Banner */}
      <section
        className="rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#4A6FA5]/15 text-[#4A6FA5] dark:text-[#A8C5DA] border border-[#4A6FA5]/25">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                Bank Statement OCR & Tally Sync
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                99.4% OCR
              </span>
            </div>
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Automated parsing for 1000+ Indian banks with one-click export to Tally XML, Excel, and CSV.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Link
            href="/dashboard/converters"
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#4A6FA5] hover:bg-[#3D5D8A] text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer group"
          >
            <span>Convert Statement</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Main Dual-Column Operational Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Conversion Pipeline & Clients (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <RecentClientsTable />
          <QuickActions />
        </div>

        {/* Right Column: Statutory Deadlines & Connected Integrations (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Statutory Tax Deadlines Widget */}
          <div
            className="rounded-xl p-5 shadow-xl"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="flex items-center justify-between mb-3 pb-2"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div>
                <h3
                  className="text-xs font-semibold flex items-center gap-1.5"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <Calendar className="w-4 h-4" style={{ color: 'var(--color-status-warning-text, #9E6B42)' }} />
                  <span>Statutory Tax Deadlines</span>
                </h3>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Ministry of Finance & GSTN Timeline
                </p>
              </div>
              <span 
                className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border"
                style={{
                  background: 'var(--color-status-danger-bg, rgba(158, 74, 74, 0.08))',
                  color: 'var(--color-status-danger-text, #9E4A4A)',
                  borderColor: 'var(--color-status-danger-border, rgba(158, 74, 74, 0.2))',
                }}
              >
                URGENT
              </span>
            </div>

            {/* Deadlines List */}
            <div className="space-y-2.5">
              {/* Item 1: GSTR-3B */}
              <div
                className="p-3 rounded-lg flex items-start justify-between transition-colors"
                style={{
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-1.5 h-1.5 rounded-full animate-pulse" 
                      style={{ background: 'var(--color-status-danger-text, #9E4A4A)' }}
                    />
                    <h4
                      className="text-xs font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      GSTR-3B Filing
                    </h4>
                  </div>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Regular Taxpayers (&gt; ₹5 Cr TO)
                  </p>
                  <div 
                    className="text-[11px] font-semibold mt-1 flex items-center gap-1"
                    style={{ color: 'var(--color-status-warning-text, #9E6B42)' }}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>12 clients pending 2B reconciliation</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span 
                    className="px-2 py-0.5 rounded text-[11px] font-bold font-mono border"
                    style={{
                      background: 'var(--color-status-danger-bg, rgba(158, 74, 74, 0.08))',
                      color: 'var(--color-status-danger-text, #9E4A4A)',
                      borderColor: 'var(--color-status-danger-border, rgba(158, 74, 74, 0.2))',
                    }}
                  >
                    Due in 3d
                  </span>
                  <div className="text-[10px] mt-1 font-mono" style={{ color: 'var(--color-text-muted)' }}>Dec 20</div>
                </div>
              </div>

              {/* Item 2: TDS Challan 281 */}
              <div
                className="p-3 rounded-lg flex items-start justify-between transition-colors"
                style={{
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ background: 'var(--color-status-warning-text, #9E6B42)' }}
                    />
                    <h4
                      className="text-xs font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      TDS Deposit (Challan 281)
                    </h4>
                  </div>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Tax Deducted for Current Month
                  </p>
                  <div 
                    className="text-[11px] font-medium mt-1"
                    style={{ color: 'var(--color-status-success-text, #3D7A64)' }}
                  >
                    28 challans ready for e-payment
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span 
                    className="px-2 py-0.5 rounded text-[11px] font-bold font-mono border"
                    style={{
                      background: 'var(--color-status-warning-bg, rgba(158, 107, 66, 0.08))',
                      color: 'var(--color-status-warning-text, #9E6B42)',
                      borderColor: 'var(--color-status-warning-border, rgba(158, 107, 66, 0.2))',
                    }}
                  >
                    Due in 9d
                  </span>
                  <div className="text-[10px] mt-1 font-mono" style={{ color: 'var(--color-text-muted)' }}>Dec 07</div>
                </div>
              </div>

              {/* Item 3: Advance Tax Q3 */}
              <div
                className="p-3 rounded-lg flex items-start justify-between transition-colors"
                style={{
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <h4
                      className="text-xs font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Advance Tax (Instalment 3)
                    </h4>
                  </div>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    75% cumulative liability cutoff
                  </p>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Estimated computations generated
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[11px] font-bold font-mono">
                    Due in 15d
                  </span>
                  <div className="text-[10px] mt-1 font-mono" style={{ color: 'var(--color-text-muted)' }}>Dec 15</div>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <Link
              href="/dashboard/compliance"
              className="w-full mt-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              style={{
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Open CA Statutory Calendar</span>
            </Link>
          </div>

          {/* Connected Accounting Integrations Card */}
          <div
            className="rounded-xl p-5 shadow-xl"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="flex items-center justify-between mb-3 pb-2"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div>
                <h3
                  className="text-xs font-semibold flex items-center gap-1.5"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <Cable className="w-4 h-4" style={{ color: '#3D7A64' }} />
                  <span>Ledger Sync & ERP Bridges</span>
                </h3>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Direct XML & API data pipeline
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {/* Tally Prime */}
              <div
                className="flex items-center justify-between p-2.5 rounded-lg"
                style={{
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-7 h-7 rounded border flex items-center justify-center font-bold text-xs"
                    style={{
                      background: 'rgba(61, 122, 100, 0.1)',
                      borderColor: 'rgba(61, 122, 100, 0.25)',
                      color: '#3D7A64',
                    }}
                  >
                    TP
                  </div>
                  <div>
                    <div
                      className="text-xs font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Tally Prime (Server 9)
                    </div>
                    <div 
                      className="text-[10px] flex items-center gap-1 font-medium"
                      style={{ color: '#3D7A64' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3D7A64] animate-pulse" />
                      Connected · Synced 12m ago
                    </div>
                  </div>
                </div>
                <Link 
                  href="/dashboard/tally-sync"
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{
                    color: 'var(--color-text-secondary)',
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  Sync
                </Link>
              </div>

              {/* Busy Accounting */}
              <div
                className="flex items-center justify-between p-2.5 rounded-lg"
                style={{
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    BZ
                  </div>
                  <div>
                    <div
                      className="text-xs font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Busy Accounting ERP
                    </div>
                    <div className="text-[10px] flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Standby · Auto-sync at 21:00
                    </div>
                  </div>
                </div>
                <Link 
                  href="/dashboard/tally-sync"
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{
                    color: 'var(--color-text-secondary)',
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  Sync
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
