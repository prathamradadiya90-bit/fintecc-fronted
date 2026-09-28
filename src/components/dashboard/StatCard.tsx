import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

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
  accentGradient?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  subtitle, 
  colorClass = 'text-[#4A6FA5] dark:text-[#A8C5DA] bg-[#A8C5DA]/25 dark:bg-[#A8C5DA]/15 border border-[#A8C5DA]/30 dark:border-[#A8C5DA]/30 shadow-xs',
  accentGradient = 'from-[#4A6FA5]/30'
}: StatCardProps) {
  return (
    <div
      className="rounded-xl p-4 relative overflow-hidden group hover:border-[#4A6FA5]/40 transition-all duration-200 shadow-sm"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-200"
        >
          {title}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span
          className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          {value}
        </span>
        {trend && (
          <span 
            className="inline-flex items-center gap-1 text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded border"
            style={{
              background: trend.isPositive 
                ? 'var(--color-status-success-bg, rgba(61, 122, 100, 0.08))' 
                : 'var(--color-status-danger-bg, rgba(158, 74, 74, 0.08))',
              color: trend.isPositive 
                ? 'var(--color-status-success-text, #3D7A64)' 
                : 'var(--color-status-danger-text, #9E4A4A)',
              borderColor: trend.isPositive 
                ? 'var(--color-status-success-border, rgba(61, 122, 100, 0.2))' 
                : 'var(--color-status-danger-border, rgba(158, 74, 74, 0.2))',
            }}
          >
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <div
          className="text-[11px] mt-1 truncate text-slate-500 dark:text-slate-300 font-medium"
        >
          {subtitle}
        </div>
      )}

      {/* Hairline subtle accent bottom glow */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accentGradient} to-transparent opacity-80`} />
    </div>
  );
}
