import React from 'react';
import { Users, FileCheck2, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface ItrOverviewStatsProps {
  totalClients: number;
  totalReturns: number;
  preparedReturns: number;
  validatedReturns: number;
  filedReturns: number;
  isLoading?: boolean;
}

export const ItrOverviewStats: React.FC<ItrOverviewStatsProps> = ({
  totalClients,
  totalReturns,
  preparedReturns,
  validatedReturns,
  filedReturns,
  isLoading = false,
}) => {
  const stats = [
    {
      title: 'ITR Taxpayers',
      value: totalClients,
      subtitle: 'Active PAN accounts',
      icon: Users,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40',
      borderColor: 'border-teal-100 dark:border-teal-900/40',
    },
    {
      title: 'Total Filings',
      value: totalReturns,
      subtitle: 'Returns in workflow',
      icon: FileCheck2,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-100 dark:border-indigo-900/40',
    },
    {
      title: 'Prepared / Drafts',
      value: preparedReturns,
      subtitle: 'Awaiting validation',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-100 dark:border-amber-900/40',
    },
    {
      title: 'Validated Returns',
      value: validatedReturns,
      subtitle: 'Ready for ITD submit',
      icon: ShieldCheck,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      borderColor: 'border-purple-100 dark:border-purple-900/40',
    },
    {
      title: 'Successfully Filed',
      value: filedReturns,
      subtitle: 'Acknowledged / Verified',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-100 dark:border-emerald-900/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className={`p-3.5 rounded-2xl border transition-all duration-200 ${stat.borderColor}`}
            style={{
              background: 'var(--color-bg-card)',
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className="text-xs font-semibold truncate"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {stat.title}
              </span>
              <div className={`p-2 rounded-xl shrink-0 ${stat.bgColor} ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-0.5">
              {isLoading ? (
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
              ) : (
                <div
                  className="text-xl font-bold tracking-tight"
                  style={{ color: 'var(--color-text-heading)' }}
                >
                  {stat.value}
                </div>
              )}
              <p
                className="text-[11px] truncate"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {stat.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
