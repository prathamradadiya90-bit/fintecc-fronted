import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  colorClass?: string;
}

export function StatCard({ title, value, icon: Icon, trend, subtitle, colorClass = 'text-[#00C2B3] bg-[#00C2B3]/10' }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
          <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text-heading)' }}>{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {(trend || subtitle) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span className={`text-[12px] font-medium px-2 py-0.5 rounded-md ${trend.isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
