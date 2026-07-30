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
    <div className="bg-slate-50 rounded-2xl p-6 h-full border border-slate-100 flex flex-col relative overflow-hidden">
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

        {/* Visual Bar */}
        <div className="mt-6">
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
            {type === 'SIP' ? (
              <>
                <div style={{ width: `${p1}%` }} className="h-full bg-[#091124] transition-all duration-500"></div>
                <div style={{ width: `${p2}%` }} className="h-full bg-[#00C2B3] transition-all duration-500"></div>
              </>
            ) : (
              <>
                {/* For SWP visual might be different, but keeping it simple: */}
                <div style={{ width: `50%` }} className="h-full bg-[#00C2B3] transition-all duration-500"></div>
                <div style={{ width: `50%` }} className="h-full bg-[#091124] transition-all duration-500"></div>
              </>
            )}
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${type === 'SIP' ? 'bg-[#091124]' : 'bg-[#00C2B3]'}`}></span>
              <span>{amount1Label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${type === 'SIP' ? 'bg-[#00C2B3]' : 'bg-[#091124]'}`}></span>
              <span>{amount2Label}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
