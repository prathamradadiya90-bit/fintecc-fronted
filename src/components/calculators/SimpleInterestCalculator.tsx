'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateSimpleInterest } from '@/lib/utils/bankingCalculators';

export function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState(100000); // 1 Lakh
  const [rate, setRate] = useState(6.5); // 6.5%
  const [timeYears, setTimeYears] = useState(3); // 3 years

  const formatPrincipal = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatRate = (val: number) => `${val.toFixed(1)}%`;
  const formatTime = (val: number) => `${val} yr`;

  const { totalInterest, totalAmount } = useMemo(() => {
    return calculateSimpleInterest(principal, rate, timeYears);
  }, [principal, rate, timeYears]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Principal Amount"
            value={principal}
            min={1000}
            max={10000000}
            step={1000}
            onChange={setPrincipal}
            formatValue={formatPrincipal}
            minLabel="₹1K"
            maxLabel="₹1Cr"
          />

          <SliderInput
            label="Rate of Interest (% p.a.)"
            value={rate}
            min={1}
            max={30}
            step={0.1}
            onChange={setRate}
            formatValue={formatRate}
            minLabel="1%"
            maxLabel="30%"
          />

          <SliderInput
            label="Time Period"
            value={timeYears}
            min={1}
            max={30}
            step={1}
            onChange={setTimeYears}
            formatValue={formatTime}
            minLabel="1 yr"
            maxLabel="30 yrs"
          />

          <div
            className="rounded-2xl p-6 shadow-sm mt-4"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-on-card)' }}>
              Simple Interest Formula
            </h2>
            <p className="text-xs font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mb-3 text-emerald-600 dark:text-emerald-400">
              SI = (Principal × Rate × Time) / 100
            </p>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li>Interest earned remains constant each year on the base principal.</li>
              <li>Widely used for short-term personal lending and simple promissory loans.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <InvestmentResultsPanel
            type="SIP"
            amount1Label="Principal amount"
            amount1Value={principal}
            amount2Label="Total interest"
            amount2Value={totalInterest}
            totalLabel="Total amount"
            totalValue={totalAmount}
          />
        </div>
      </div>
    </div>
  );
}
