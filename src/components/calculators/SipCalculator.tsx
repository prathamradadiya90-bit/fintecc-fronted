'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateSIP } from '@/lib/utils/investmentCalculators';

export function SipCalculator() {
  // Default values matching standard SIP Calculator (Groww style)
  const [monthlyInvestment, setMonthlyInvestment] = useState(25000); // 25K
  const [expectedReturnRate, setExpectedReturnRate] = useState(12); // 12%
  const [timePeriodYears, setTimePeriodYears] = useState(10); // 10 years

  // Format functions for sliders
  const formatInvestment = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatRate = (val: number) => `${val.toFixed(1)}%`;
  const formatTime = (val: number) => `${val} yr`;

  // Calculations
  const { investedAmount, estimatedReturns, totalValue } = useMemo(() => {
    return calculateSIP(monthlyInvestment, expectedReturnRate, timePeriodYears);
  }, [monthlyInvestment, expectedReturnRate, timePeriodYears]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput 
            label="Monthly Investment"
            value={monthlyInvestment}
            min={500}
            max={1000000} // 10L
            step={500}
            onChange={setMonthlyInvestment}
            formatValue={formatInvestment}
            minLabel="₹500"
            maxLabel="₹10L"
          />
          
          <SliderInput 
            label="Expected Return Rate (p.a)"
            value={expectedReturnRate}
            min={1}
            max={30}
            step={0.1}
            onChange={setExpectedReturnRate}
            formatValue={formatRate}
            minLabel="1%"
            maxLabel="30%"
          />
          
          <SliderInput 
            label="Time Period"
            value={timePeriodYears}
            min={1}
            max={40}
            step={1}
            onChange={setTimePeriodYears}
            formatValue={formatTime}
            minLabel="1 yr"
            maxLabel="40 yr"
          />
          
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm mt-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-sm font-semibold text-slate-700">About SIP Calculator</h2>
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-2 leading-relaxed">
              <li><strong>Wealth Creation:</strong> Estimate the future value of your monthly SIP investments.</li>
              <li><strong>Power of Compounding:</strong> See how time drastically increases your total returns.</li>
              <li><strong>Easy Planning:</strong> Adjust your monthly investment or duration to align with your financial goals.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <InvestmentResultsPanel 
            type="SIP"
            amount1Label="Invested amount"
            amount1Value={investedAmount}
            amount2Label="Est. returns"
            amount2Value={estimatedReturns}
            totalLabel="Total value"
            totalValue={totalValue}
          />
        </div>
      </div>
    </div>
  );
}
