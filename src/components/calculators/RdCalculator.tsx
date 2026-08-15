'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateRD } from '@/lib/utils/bankingCalculators';

export function RdCalculator() {
  const [monthlyDeposit, setMonthlyDeposit] = useState(5000); // 5K
  const [rateOfInterest, setRateOfInterest] = useState(6.8); // 6.8%
  const [timePeriodYears, setTimePeriodYears] = useState(3); // 3 years

  const formatDeposit = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatRate = (val: number) => `${val.toFixed(1)}%`;
  const formatTime = (val: number) => `${val} yr`;

  const { totalInvestment, estimatedInterest, maturityValue } = useMemo(() => {
    return calculateRD(monthlyDeposit, rateOfInterest, timePeriodYears);
  }, [monthlyDeposit, rateOfInterest, timePeriodYears]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Monthly Deposit"
            value={monthlyDeposit}
            min={500}
            max={200000}
            step={500}
            onChange={setMonthlyDeposit}
            formatValue={formatDeposit}
            minLabel="₹500"
            maxLabel="₹2L"
          />

          <SliderInput
            label="Rate of Interest (% p.a.)"
            value={rateOfInterest}
            min={3}
            max={12}
            step={0.1}
            onChange={setRateOfInterest}
            formatValue={formatRate}
            minLabel="3%"
            maxLabel="12%"
          />

          <SliderInput
            label="Time Period"
            value={timePeriodYears}
            min={1}
            max={10}
            step={1}
            onChange={setTimePeriodYears}
            formatValue={formatTime}
            minLabel="1 yr"
            maxLabel="10 yrs"
          />

          <div
            className="rounded-2xl p-6 shadow-sm mt-4"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-on-card)' }}>
              Recurring Deposit (RD) Overview
            </h2>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Disciplined Savings:</strong> Deposit a fixed sum every month with quarterly compounded interest.</li>
              <li><strong>Safe & Secure:</strong> Ideal for short to medium term risk-free financial goals.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <InvestmentResultsPanel
            type="SIP"
            amount1Label="Total deposited"
            amount1Value={totalInvestment}
            amount2Label="Estimated interest"
            amount2Value={estimatedInterest}
            totalLabel="Maturity value"
            totalValue={maturityValue}
          />
        </div>
      </div>
    </div>
  );
}
