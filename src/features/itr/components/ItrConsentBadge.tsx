import React from 'react';
import type { ItrConsentStatus } from '@/lib/types/itr.types';

interface ItrConsentBadgeProps {
  status?: ItrConsentStatus | string;
  size?: 'sm' | 'md';
}

export const ItrConsentBadge: React.FC<ItrConsentBadgeProps> = ({
  status = 'PENDING',
  size = 'md',
}) => {
  const statusConfigs: Record<string, { label: string; classNames: string }> = {
    GRANTED: {
      label: 'Consent Granted',
      classNames: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    },
    PENDING: {
      label: 'Consent Pending',
      classNames: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    },
    EXPIRED: {
      label: 'Consent Expired',
      classNames: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
    REVOKED: {
      label: 'Consent Revoked',
      classNames: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    },
  };

  const config = statusConfigs[status] || {
    label: status,
    classNames: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClasses} ${config.classNames}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {config.label}
    </span>
  );
};
