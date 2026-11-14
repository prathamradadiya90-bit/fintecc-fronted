import React from 'react';
import { Building2, FileCheck2, AlertCircle, CalendarClock } from 'lucide-react';
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

  // Calculate next statutory GST deadline dynamically
  const now = new Date();
  const currentDay = now.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthName = monthNames[now.getMonth()];

  let nextCutoff = {
    title: 'GSTR-3B Monthly',
    dateText: `20 ${currentMonthName}`,
    subtitle: `Due in ${Math.max(1, 20 - currentDay)} days`,
  };

  if (currentDay <= 11) {
    const diff = 11 - currentDay;
    nextCutoff = {
      title: 'GSTR-1 Monthly',
      dateText: `11 ${currentMonthName}`,
      subtitle: diff === 0 ? 'Due today' : `Due in ${diff} day${diff > 1 ? 's' : ''}`,
    };
  } else if (currentDay <= 13) {
    const diff = 13 - currentDay;
    nextCutoff = {
      title: 'IFF (QRMP)',
      dateText: `13 ${currentMonthName}`,
      subtitle: diff === 0 ? 'Due today' : `Due in ${diff} day${diff > 1 ? 's' : ''}`,
    };
  } else if (currentDay <= 20) {
    const diff = 20 - currentDay;
    nextCutoff = {
      title: 'GSTR-3B Monthly',
      dateText: `20 ${currentMonthName}`,
      subtitle: diff === 0 ? 'Due today' : `Due in ${diff} day${diff > 1 ? 's' : ''}`,
    };
  } else if (currentDay <= 25) {
    const diff = 25 - currentDay;
    nextCutoff = {
      title: 'PMT-06 Challan',
      dateText: `25 ${currentMonthName}`,
      subtitle: diff === 0 ? 'Due today' : `Due in ${diff} day${diff > 1 ? 's' : ''}`,
    };
  } else {
    const nextMonthIdx = (now.getMonth() + 1) % 12;
    const nextMonthYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
    const nextDate = new Date(nextMonthYear, nextMonthIdx, 11);
    const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    nextCutoff = {
      title: 'GSTR-1 Outward',
      dateText: `11 ${monthNames[nextMonthIdx]}`,
      subtitle: `Due in ${diffDays} days`,
    };
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Active GSTIN Profiles"
        value={totalProfiles}
        subtitle="Registered client taxpayers"
        icon={Building2}
        colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400"
      />
      <StatCard
        title={`Next Due: ${nextCutoff.title}`}
        value={nextCutoff.dateText}
        subtitle={nextCutoff.subtitle}
        icon={CalendarClock}
        colorClass="text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400"
      />
      <StatCard
        title="Pending Returns"
        value={pendingReturns}
        subtitle="Drafts / awaiting filing"
        icon={AlertCircle}
        colorClass="text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400"
      />
      <StatCard
        title="Successfully Filed"
        value={filedReturns}
        subtitle="Returns submitted with ARN"
        icon={FileCheck2}
        colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400"
      />
    </div>
  );
};
