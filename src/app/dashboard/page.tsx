'use client';

import React from 'react';
import Link from 'next/link';
import { useGetDashboardStatsQuery } from '@/lib/store/api/dashboardApi';
import { useGetDocumentsByClientIdQuery } from '@/lib/store/api/clientDocumentsApi';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentClientsTable } from '@/components/dashboard/RecentClientsTable';
import { Users, FileText, Calculator, Briefcase, Sparkles, MessageSquare, ArrowRight, UploadCloud, ShieldCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isClient = user?.role === 'CLIENT';
  const clientId = user?.clientId;

  const { data, isLoading, error } = useGetDashboardStatsQuery(undefined, {
    skip: isClient,
  });

  const { data: clientDocsData } = useGetDocumentsByClientIdQuery(clientId || '', {
    skip: !isClient || !clientId,
  });

  const stats = data?.data;
  const clientDocs = clientDocsData?.data || [];

  // Format date for the header
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Client Portal Home
  if (isClient) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Client'} 👋
            </h1>
            <p className="mt-1 text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
              Manage your CA communications and documents in one secure place.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-semibold w-fit">
            <ShieldCheck className="w-4 h-4 text-[#00C2B3]" />
            Client Portal Verified
          </div>
        </div>

        {/* Quick Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Chat Card */}
          <Link
            href="/dashboard/chat"
            className="rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 group border"
            style={{
              background: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#00C2B3]/10 text-[#00C2B3] flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-heading)' }}>
                Chat with Your CA
              </h2>
              <p className="text-xs sm:text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Have questions or need assistance with GST, tax filings, or accounts? Message your CA firm directly with real-time updates.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 font-semibold text-xs text-[#00C2B3]">
              Open Chat
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Documents Card */}
          <Link
            href="/dashboard/documents"
            className="rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 group border"
            style={{
              background: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-heading)' }}>
                  Documents & Uploads
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  {clientDocs.length} {clientDocs.length === 1 ? 'file' : 'files'}
                </span>
              </div>
              <p className="text-xs sm:text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Upload requested proofs, invoices, bank statements, and tax receipts. Download certified returns uploaded by your CA.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 font-semibold text-xs text-indigo-600 dark:text-indigo-400">
              View All Documents
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
            Good morning, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
            Here is what's happening today, {today}.
          </p>
        </div>
      </div>

      {/* AI Insights Banner (if available) */}
      {stats?.aiInsights && stats.aiInsights.length > 0 && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="p-2 rounded-full shadow-sm text-[#00C2B3] shrink-0 mt-0.5" style={{ background: 'var(--color-bg-elevated)' }}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[14px]" style={{ color: 'var(--color-text-primary)' }}>AI Insight</h3>
            <p className="text-[13px] leading-relaxed mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {stats.aiInsights[0]}
            </p>
          </div>
        </div>
      )}

      {/* Loading State for Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl h-28 animate-pulse" style={{ background: 'var(--color-bg-skeleton)' }} />
          ))}
        </div>
      ) : (
        /* Stats Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Clients" 
            value={stats?.totalClients || 0} 
            icon={Users} 
            trend={{ value: '2 this week', isPositive: true }}
          />
          <StatCard 
            title="Active GST Clients" 
            value={stats?.pendingCompliances?.gst || 0} 
            icon={Briefcase}
            colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400" 
          />
          <StatCard 
            title="Loans Calculated" 
            value="12" // Placeholder since it's not explicitly in the backend API yet
            icon={Calculator} 
            colorClass="text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400"
          />
          <StatCard 
            title="PDFs Converted" 
            value={stats?.pdfsConverted || 0} 
            icon={FileText} 
            colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400"
          />
        </div>
      )}

      {/* Main Content Layout */}
      <div className="space-y-6">
        <QuickActions />
        <RecentClientsTable />
      </div>
    </div>
  );
}
