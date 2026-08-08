import React, { useState } from 'react';
import { formatCurrency, formatCurrencyExact } from '@/lib/utils/loanCalculator';

interface ResultsPanelProps {
  emi: number;
  principal: number;
  totalInterest: number;
  totalPayable: number;
  loanType: string;
}

export function ResultsPanel({ emi, principal, totalInterest, totalPayable, loanType }: ResultsPanelProps) {
  const [hoveredSection, setHoveredSection] = useState<'principal' | 'interest' | null>(null);
  
  // Calculate stroke-dasharray for donut chart
  const principalPercentage = (principal / totalPayable) * 100 || 0;
  const interestPercentage = (totalInterest / totalPayable) * 100 || 0;
  
  // Circle geometry for SVG
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  // Dash offset for Interest segment (it starts after the principal segment)
  const principalDash = (principalPercentage / 100) * circumference;
  const interestDash = (interestPercentage / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Top Card: EMI Results */}
      <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-md">
        <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-2">
          MONTHLY EMI — {loanType.toUpperCase()}
        </h3>
        <div className="text-5xl font-bold text-[#00C2B3] mb-5">
          {formatCurrencyExact(emi)}
        </div>
        
        <div className="grid grid-cols-3 gap-4 border-t border-slate-700/50 pt-5">
          <div>
            <p className="text-slate-400 text-xs mb-1">Principal</p>
            <p className="text-lg font-semibold">{formatCurrency(principal)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Total Interest</p>
            <p className="text-lg font-semibold text-[#00C2B3]">{formatCurrency(totalInterest)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Total Payable</p>
            <p className="text-lg font-semibold text-amber-500">{formatCurrency(totalPayable)}</p>
          </div>
        </div>
      </div>

      {/* Bottom Card: Breakup Chart */}
      <div
        className="rounded-2xl p-6 shadow-sm flex flex-col items-center"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h3 className="text-sm font-bold self-start mb-6" style={{ color: 'var(--color-text-primary)' }}>Principal vs Interest Breakup</h3>
        
        <div className="relative w-36 h-36 mb-5">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background circle (Interest) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#0f172a"
              strokeWidth="24"
              strokeDasharray={`${interestDash} ${circumference}`}
              strokeDashoffset={-principalDash}
              className="transition-all duration-300 cursor-pointer hover:opacity-80"
              onMouseEnter={() => setHoveredSection('interest')}
              onMouseLeave={() => setHoveredSection(null)}
            />
            {/* Foreground circle (Principal) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#00C2B3"
              strokeWidth="24"
              strokeDasharray={`${principalDash} ${circumference}`}
              className="transition-all duration-300 cursor-pointer hover:opacity-80"
              onMouseEnter={() => setHoveredSection('principal')}
              onMouseLeave={() => setHoveredSection(null)}
            />
          </svg>
          
          {/* Centered Tooltip */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-200">
            {hoveredSection ? (
              <>
                <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  {hoveredSection}
                </span>
                <span className="text-xs font-bold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                  {hoveredSection === 'principal' 
                    ? formatCurrency(principal) 
                    : formatCurrency(totalInterest)}
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00C2B3]" />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Principal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0f172a]" />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Interest</span>
          </div>
        </div>
      </div>
    </div>
  );
}
