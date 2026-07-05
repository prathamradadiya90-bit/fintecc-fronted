'use client';

import React from 'react';
import { useGetDashboardStatsQuery } from '@/lib/store/api/dashboardApi';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentClientsTable } from '@/components/dashboard/RecentClientsTable';
import { Users, FileText, Calculator, Briefcase, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

export default function DashboardPage() {
  const { data, isLoading, error } = useGetDashboardStatsQuery();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const stats = data?.data;

  // Format date for the header
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#091124]">
            Good morning, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-[14px]">
            Here is what's happening today, {today}.
          </p>
        </div>
      </div>

      {/* AI Insights Banner (if available) */}
      {stats?.aiInsights && stats.aiInsights.length > 0 && (
        <div className="bg-gradient-to-r from-[#00C2B3]/10 to-indigo-50 border border-[#00C2B3]/20 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2 bg-white rounded-full shadow-sm text-[#00C2B3] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-[14px]">AI Insight</h3>
            <p className="text-slate-600 text-[13px] leading-relaxed mt-0.5">
              {stats.aiInsights[0]}
            </p>
          </div>
        </div>
      )}

      {/* Loading State for Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-100 rounded-2xl h-28 animate-pulse"></div>
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
            colorClass="text-indigo-600 bg-indigo-50" 
          />
          <StatCard 
            title="Loans Calculated" 
            value="12" // Placeholder since it's not explicitly in the backend API yet
            icon={Calculator} 
            colorClass="text-amber-600 bg-amber-50"
          />
          <StatCard 
            title="PDFs Converted" 
            value={stats?.pdfsConverted || 0} 
            icon={FileText} 
            colorClass="text-emerald-600 bg-emerald-50"
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
