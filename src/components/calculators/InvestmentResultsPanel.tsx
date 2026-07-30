import React from 'react';
import { formatCurrencyExact } from '@/lib/utils/loanCalculator';

interface InvestmentResultsPanelProps {
  type: 'SIP' | 'SWP';
  amount1Label: string;
  amount1Value: number;
  amount2Label: string;
  amount2Value: number;
  totalLabel: string;
  totalValue: number;
}

export function InvestmentResultsPanel({ 
  type,
  amount1Label,
  amount1Value,
  amount2Label,
  amount2Value,
  totalLabel,
  totalValue
}: InvestmentResultsPanelProps) {
  
  // Calculate percentages for a simple visual bar (similar to Groww)
  const total = amount1Value + amount2Value;
  const p1 = total > 0 ? (amount1Value / total) * 100 : 0;
  const p2 = total > 0 ? (amount2Value / total) * 100 : 0;

  return (
    <div className="bg-slate-50 rounded-2xl p-6 h-full border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-[#00C2B3]/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col gap-6">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <span className="text-slate-500 font-medium text-sm">{amount1Label}</span>
          <span className="text-[#091124] font-bold text-base">{formatCurrencyExact(amount1Value)}</span>
        </div>
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <span className="text-slate-500 font-medium text-sm">{amount2Label}</span>
          <span className="text-[#091124] font-bold text-base">{formatCurrencyExact(amount2Value)}</span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-700 font-semibold text-sm">{totalLabel}</span>
          <span className="text-[#00C2B3] font-bold text-xl">{formatCurrencyExact(totalValue)}</span>
        </div>

        {/* Visual Chart */}
        <div className="mt-6 flex flex-col items-center">
          <div className="relative w-36 h-36 mb-5">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Secondary amount circle */}
              <circle
                cx="80"
                cy="80"
                r={60}
                fill="transparent"
                stroke={type === 'SIP' ? '#00C2B3' : '#091124'}
                strokeWidth="24"
                strokeDasharray={`${(p2 / 100) * (2 * Math.PI * 60)} ${2 * Math.PI * 60}`}
                strokeDashoffset={-((p1 / 100) * (2 * Math.PI * 60))}
                className="transition-all duration-500"
              />
              {/* Primary amount circle */}
              <circle
                cx="80"
                cy="80"
                r={60}
                fill="transparent"
                stroke={type === 'SIP' ? '#091124' : '#00C2B3'}
                strokeWidth="24"
                strokeDasharray={`${(p1 / 100) * (2 * Math.PI * 60)} ${2 * Math.PI * 60}`}
                className="transition-all duration-500"
              />
            </svg>
          </div>
          
          <div className="flex justify-center gap-6 text-[12px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${type === 'SIP' ? 'bg-[#091124]' : 'bg-[#00C2B3]'}`}></span>
              <span>{amount1Label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${type === 'SIP' ? 'bg-[#00C2B3]' : 'bg-[#091124]'}`}></span>
              <span>{amount2Label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
