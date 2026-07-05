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
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-[13px] font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-[#091124] mt-1">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {(trend || subtitle) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span className={`text-[12px] font-medium px-2 py-0.5 rounded-md ${trend.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-[12px] text-slate-400">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
