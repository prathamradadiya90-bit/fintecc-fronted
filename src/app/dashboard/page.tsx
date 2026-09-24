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
  ShieldCheck, Calendar, Database, Clock, UploadCloud, FolderOpen, 
  Download, KeyRound, Cpu, Check, AlertTriangle, Cable, ArrowUpRight 
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

  // Dropzone local UI state for prototype interaction
  const [selectedFormat, setSelectedFormat] = useState<'Tally XML' | 'Excel' | 'CSV'>('Tally XML');
  const [autoContra, setAutoContra] = useState(true);
  const [autoNarration, setAutoNarration] = useState(true);

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
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
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
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2
                className="text-base font-bold group-hover:text-emerald-400 transition-colors"
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
            <div className="flex items-center gap-2 pt-6 font-semibold text-xs text-emerald-400">
              Open Secure Chat
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent" />
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
    <div className="max-w-[1440px] mx-auto space-y-6 pb-12">
      <AnnouncementBanner />
      
      {/* Welcome Header Banner */}
      <section
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: 'var(--color-text-heading)' }}
            >
              Good morning, {user?.name?.split(' ')[0] || 'Partner'}
            </h1>
            <span className="text-xl">👋</span>
            <span
              className="px-2 py-0.5 rounded text-[11px] font-semibold"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {firmName}
            </span>
          </div>
          <p
            className="text-xs mt-1 flex flex-wrap items-center gap-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {stats?.pdfsConverted || 48} bank statements converted this week
            </span>
            <span>·</span>
            <span>99.4% OCR accuracy</span>
            <span>·</span>
            <span className="font-medium" style={{ color: 'var(--color-text-muted)' }}>Zero data retention on server</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            FY 2024-25 (Q4)
          </span>
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Tally XML v9.2 Ready
          </span>
        </div>
      </section>

      {/* Expiring DSC Alert Widget */}
      <DscExpiringWidget />

      {/* AI Insights Banner (if available) */}
      {stats?.aiInsights && stats.aiInsights.length > 0 && (
        <div
          className="rounded-xl p-4 flex items-start gap-3 shadow-lg border border-emerald-500/20"
          style={{ background: 'var(--color-bg-card)' }}
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-emerald-400">Fintecc AI Statutory Insight</h3>
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
            value={stats?.totalClients || 86} 
            icon={Users} 
            trend={{ value: '18.4%', isPositive: true }}
            subtitle="Active entity portfolios"
            colorClass="text-emerald-400 bg-emerald-500/10"
            accentGradient="from-emerald-500/50"
          />
          {/* Stat 2: Statements Converted */}
          <StatCard 
            title="Statements Converted" 
            value={stats?.pdfsConverted || 1428} 
            icon={FileText} 
            trend={{ value: '99.4% OCR', isPositive: true }}
            subtitle="From 34 partner bank formats"
            colorClass="text-cyan-400 bg-cyan-500/10"
            accentGradient="from-cyan-500/50"
          />
          {/* Stat 3: Hours Saved */}
          <StatCard 
            title="Hours Saved (Manual Entry)" 
            value="~340 Hrs" 
            icon={Clock} 
            subtitle="≈ ₹1,80,000 billable value"
            colorClass="text-emerald-400 bg-emerald-500/10"
            accentGradient="from-emerald-500/50"
          />
          {/* Stat 4: Staff Members */}
          <StatCard 
            title="Active CA Team Members" 
            value={stats?.staffCount || 12} 
            icon={UserCheck} 
            subtitle="Audit managers & associates"
            colorClass="text-indigo-400 bg-indigo-500/10"
            accentGradient="from-indigo-500/50"
          />
        </section>
      )}

      {/* Quick Conversion Hero Dropzone Widget */}
      <section
        className="rounded-xl p-5 relative overflow-hidden shadow-2xl"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Radial decorative ambient glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-stretch gap-5 relative z-10">
          {/* Dropzone Left Area */}
          <div 
            onClick={() => router.push('/dashboard/converters')}
            className="flex-1 border-2 border-dashed transition-colors duration-200 rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-subtle)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-all duration-200 mb-2.5"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3
              className="text-sm font-semibold mb-1"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Select Bank Statement PDF or Drag & Drop Here
            </h3>
            <p
              className="text-xs max-w-md mb-3.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Automated parsing for <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>HDFC, SBI, ICICI, Axis, Kotak, PNB</span> & 1000+ Indian co-op and regional banks.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button 
                type="button"
                className="bg-emerald-500 text-[#003824] font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-emerald-400 transition-colors shadow-lg active:scale-95"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Browse Files</span>
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/dashboard/converters');
                }}
                className="text-xs transition-colors underline underline-offset-4 flex items-center gap-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Statement</span>
              </button>
            </div>
            {/* Trust Micro-pills */}
            <div
              className="flex flex-wrap items-center justify-center gap-3 mt-4 text-[11px] font-mono"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <span className="flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-emerald-400" />
                Auto-decrypt with client password vault
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                Multi-column scan OCR
              </span>
            </div>
          </div>

          {/* Dropzone Right Configuration Options */}
          <div
            className="w-full lg:w-80 flex flex-col justify-between rounded-xl p-4"
            style={{
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div
                className="flex items-center justify-between mb-3 pb-2"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Conversion Preset
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Standard CA Ledger
                </span>
              </div>
              {/* Format Select */}
              <div className="space-y-3">
                <div>
                  <label
                    className="block text-[11px] font-semibold mb-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Target Output Format
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Tally XML', 'Excel', 'CSV'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setSelectedFormat(fmt)}
                        className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                          selectedFormat === fmt
                            ? 'border border-emerald-500 text-emerald-400 shadow-sm'
                            : ''
                        }`}
                        style={{
                          background: 'var(--color-bg-card)',
                          border: selectedFormat === fmt ? undefined : '1px solid var(--color-border)',
                          color: selectedFormat !== fmt ? 'var(--color-text-secondary)' : undefined,
                        }}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Client Selector */}
                <div>
                  <label
                    className="block text-[11px] font-semibold mb-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Assign to Client Folder
                  </label>
                  <select 
                    aria-label="Assign to Client Folder"
                    className="w-full rounded text-xs px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
                    style={{
                      background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {clients.length > 0 ? (
                      clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.pan ? `(${c.pan})` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option>Reliance Retail Dist. (GST-27AABCR12)</option>
                        <option>Apex Infra Buildcon Pvt Ltd</option>
                        <option>Kothari Textiles LLP</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Smart Flags */}
                <div className="space-y-1.5 pt-1">
                  <label
                    className="flex items-center gap-2 cursor-pointer text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <input 
                      type="checkbox"
                      checked={autoContra}
                      onChange={(e) => setAutoContra(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-0"
                      style={{
                        background: 'var(--color-bg-subtle)',
                        borderColor: 'var(--color-border)',
                      }}
                    />
                    <span>Auto-categorize GST Contra/Cash txns</span>
                  </label>
                  <label
                    className="flex items-center gap-2 cursor-pointer text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <input 
                      type="checkbox"
                      checked={autoNarration}
                      onChange={(e) => setAutoNarration(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-0"
                      style={{
                        background: 'var(--color-bg-subtle)',
                        borderColor: 'var(--color-border)',
                      }}
                    />
                    <span>Generate Narration for BRS Audit trail</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Instant Status Note */}
            <div
              className="mt-3 pt-2.5 flex items-center justify-between text-[11px]"
              style={{
                borderTop: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Engine: Online
              </span>
              <span className="text-emerald-400 font-mono">Avg: 1.8s / 500 txns</span>
            </div>
          </div>
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
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Statutory Tax Deadlines</span>
                </h3>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Ministry of Finance & GSTN Timeline
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
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
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
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
                  <div className="text-[11px] text-amber-400 font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>12 clients pending 2B reconciliation</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[11px] font-bold font-mono">
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
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
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
                  <div className="text-[11px] text-emerald-400 font-medium mt-1">
                    28 challans ready for e-payment
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[11px] font-bold font-mono">
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
                  <Cable className="w-4 h-4 text-emerald-400" />
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
                  <div className="w-7 h-7 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    TP
                  </div>
                  <div>
                    <div
                      className="text-xs font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Tally Prime (Server 9)
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
