'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateSWP } from '@/lib/utils/investmentCalculators';

export function SwpCalculator() {
  // Default values matching standard SWP Calculator (Groww style)
  const [totalInvestment, setTotalInvestment] = useState(500000); // 5L
  const [withdrawalPerMonth, setWithdrawalPerMonth] = useState(10000); // 10K
  const [expectedReturnRate, setExpectedReturnRate] = useState(8); // 8%
  const [timePeriodYears, setTimePeriodYears] = useState(5); // 5 years

  // Format functions for sliders
  const formatInvestment = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatRate = (val: number) => `${val.toFixed(1)}%`;
  const formatTime = (val: number) => `${val} yr`;

  // Calculations
  const { initialInvestment, totalWithdrawal, finalValue } = useMemo(() => {
    return calculateSWP(totalInvestment, withdrawalPerMonth, expectedReturnRate, timePeriodYears);
  }, [totalInvestment, withdrawalPerMonth, expectedReturnRate, timePeriodYears]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput 
            label="Total Investment"
            value={totalInvestment}
            min={10000}
            max={50000000} // 5Cr
            step={10000}
            onChange={setTotalInvestment}
            formatValue={formatInvestment}
            minLabel="₹10K"
            maxLabel="₹5Cr"
          />
          
          <SliderInput 
            label="Withdrawal per month"
            value={withdrawalPerMonth}
            min={500}
            max={500000} // 5L
            step={500}
            onChange={setWithdrawalPerMonth}
            formatValue={formatInvestment}
            minLabel="₹500"
            maxLabel="₹5L"
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
              <h2 className="text-sm font-semibold text-slate-700">About SWP Calculator</h2>
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-2 leading-relaxed">
              <li><strong>Systematic Withdrawal:</strong> Estimate your final portfolio value after regular monthly withdrawals.</li>
              <li><strong>Cash Flow Management:</strong> Perfect for generating a regular income stream post-retirement.</li>
              <li><strong>Capital Appreciation:</strong> See how your remaining balance can still grow while you withdraw.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <InvestmentResultsPanel 
            type="SWP"
            amount1Label="Total Investment"
            amount1Value={initialInvestment}
            amount2Label="Total Withdrawal"
            amount2Value={totalWithdrawal}
            totalLabel="Final Value"
            totalValue={finalValue}
          />
        </div>
      </div>
    </div>
  );
}
