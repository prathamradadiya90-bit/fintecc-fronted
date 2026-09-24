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
  colorClass = 'text-emerald-400 bg-emerald-500/10',
  accentGradient = 'from-emerald-500/50'
}: StatCardProps) {
  return (
    <div
      className="rounded-xl p-4 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-200 shadow-lg"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] uppercase tracking-wider font-semibold"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {title}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {value}
        </span>
        {trend && (
          <span 
            className={`inline-flex items-center gap-1 text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded ${
              trend.isPositive 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <div
          className="text-[11px] mt-1 truncate"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {subtitle}
        </div>
      )}

      {/* Hairline subtle accent bottom glow */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accentGradient} to-transparent`} />
    </div>
  );
}
