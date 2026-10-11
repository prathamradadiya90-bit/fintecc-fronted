'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Users,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useGetComplianceAnalyticsQuery } from '@/lib/store/api/tasksApi';

interface TaskComplianceAnalyticsProps {
  branchId?: string;
  returnType?: string;
}

export function TaskComplianceAnalytics({ branchId, returnType }: TaskComplianceAnalyticsProps) {
  const { data: response, isLoading } = useGetComplianceAnalyticsQuery(
    branchId || returnType ? { branchId, returnType } : undefined
  );

  const analytics = response?.data;
  const summary = analytics?.summary;
  const byReturnType = analytics?.byReturnType || {};
  const bottlenecks = analytics?.bottlenecks || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
          />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-4 mb-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Tasks */}
        <div
          className="p-4 rounded-2xl border shadow-xs transition-all"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Total Tasks
            </span>
            <div className="p-1.5 rounded-lg bg-[#4A6FA5]/10 text-[#4A6FA5]">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
            {summary.total}
          </div>
          <p className="text-xs mt-0.5 text-[#5A6E85]">Compliance items</p>
        </div>

        {/* Completion Rate */}
        <div
          className="p-4 rounded-2xl border shadow-xs transition-all"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Completion Rate
            </span>
            <div className="p-1.5 rounded-lg bg-[rgba(61,122,100,0.08)] text-[#3D7A64]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-[#3D7A64]">
            {summary.completionRate}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#3D7A64] h-full rounded-full transition-all"
              style={{ width: `${Math.min(summary.completionRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Pending Review (Maker-Checker) */}
        <div
          className="p-4 rounded-2xl border shadow-xs transition-all"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              In Review
            </span>
            <div className="p-1.5 rounded-lg bg-[#4A6FA5]/10 text-[#4A6FA5]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-[#4A6FA5]">
            {summary.inReview}
          </div>
          <p className="text-xs mt-0.5 text-[#5A6E85]">Maker-checker queue</p>
        </div>

        {/* In Progress / Pending */}
        <div
          className="p-4 rounded-2xl border shadow-xs transition-all"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              In Progress
            </span>
            <div className="p-1.5 rounded-lg bg-[rgba(158,107,66,0.08)] text-[#9E6B42]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-[#9E6B42]">
            {summary.pending}
          </div>
          <p className="text-xs mt-0.5 text-[#5A6E85]">Active workflows</p>
        </div>

        {/* Overdue (SLA Breach) */}
        <div
          className="p-4 rounded-2xl border shadow-xs transition-all"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Overdue / SLA Risk
            </span>
            <div className="p-1.5 rounded-lg bg-[rgba(158,74,74,0.08)] text-[#9E4A4A]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-[#9E4A4A]">
            {summary.overdue}
          </div>
          <p className="text-xs mt-0.5 text-[#5A6E85]">Passed due deadline</p>
        </div>
      </div>

      {/* Return Type Compliance Badges & Staff SLA */}
      {Object.keys(byReturnType).length > 0 && (
        <div
          className="p-4 rounded-2xl border shadow-xs"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Building className="w-4 h-4 text-[#4A6FA5]" />
              Compliance Breakdown by Statutory Type
            </h3>
            <span className="text-xs text-[#5A6E85]">Real-time firm metrics</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {Object.entries(byReturnType).map(([type, stats]) => (
              <div
                key={type}
                className="p-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800"
              >
                <div className="text-xs font-semibold truncate text-[#1E2A38] dark:text-slate-200">
                  {type}
                </div>
                <div className="flex items-center justify-between mt-1.5 text-xs">
                  <span className="text-[#3D7A64] font-medium">{stats.completed} done</span>
                  {stats.overdue > 0 ? (
                    <span className="text-[#9E4A4A] font-semibold">{stats.overdue} overdue</span>
                  ) : (
                    <span className="text-[#5A6E85]">{stats.pending} left</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
