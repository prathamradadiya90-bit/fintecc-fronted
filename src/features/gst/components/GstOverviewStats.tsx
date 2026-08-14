import React from 'react';
import { Building2, FileCheck2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';

interface GstOverviewStatsProps {
  totalProfiles: number;
  totalReturns: number;
  filedReturns: number;
  pendingReturns: number;
  isLoading?: boolean;
}

export const GstOverviewStats: React.FC<GstOverviewStatsProps> = ({
  totalProfiles,
  totalReturns,
  filedReturns,
  pendingReturns,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl h-24 animate-pulse"
            style={{ background: 'var(--color-bg-skeleton)' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Active GST Profiles"
        value={totalProfiles}
        icon={Building2}
        colorClass="text-teal-600 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-400"
      />
      <StatCard
        title="Total Returns Tracked"
        value={totalReturns}
        icon={FileSpreadsheet}
        colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400"
      />
      <StatCard
        title="Successfully Filed"
        value={filedReturns}
        icon={FileCheck2}
        colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400"
      />
      <StatCard
        title="Pending / Draft"
        value={pendingReturns}
        icon={AlertCircle}
        colorClass="text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400"
      />
    </div>
  );
};
