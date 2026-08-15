'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateLumpsum } from '@/lib/utils/investmentCalculators';

export function LumpsumCalculator() {
  const [totalInvestment, setTotalInvestment] = useState(100000); // 1 Lakh
  const [expectedReturnRate, setExpectedReturnRate] = useState(12); // 12%
  const [timePeriodYears, setTimePeriodYears] = useState(10); // 10 years

  const formatInvestment = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatRate = (val: number) => `${val.toFixed(1)}%`;
  const formatTime = (val: number) => `${val} yr`;

  const { investedAmount, estimatedReturns, totalValue } = useMemo(() => {
    return calculateLumpsum(totalInvestment, expectedReturnRate, timePeriodYears);
  }, [totalInvestment, expectedReturnRate, timePeriodYears]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Total One-Time Investment"
            value={totalInvestment}
            min={5000}
            max={10000000}
            step={5000}
            onChange={setTotalInvestment}
            formatValue={formatInvestment}
            minLabel="₹5K"
            maxLabel="₹1Cr"
          />

          <SliderInput
            label="Expected Return Rate (p.a.)"
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
            maxLabel="40 yrs"
          />

          <div
            className="rounded-2xl p-6 shadow-sm mt-4"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-on-card)' }}>
              About Lumpsum Investment
            </h2>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>One-Time Allocation:</strong> Invest surplus capital upfront to maximize compounding over longer horizons.</li>
              <li><strong>Market Timing:</strong> Unlike SIPs, lumpsum returns can be sensitive to entry valuations.</li>
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
            totalLabel="Total wealth accumulated"
            totalValue={totalValue}
          />
        </div>
      </div>
    </div>
  );
}
