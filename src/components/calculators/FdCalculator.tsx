'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateFD } from '@/lib/utils/bankingCalculators';

export function FdCalculator() {
  const [totalInvestment, setTotalInvestment] = useState(200000); // 2 Lakhs
  const [rateOfInterest, setRateOfInterest] = useState(7.0); // 7.0%
  const [timePeriodYears, setTimePeriodYears] = useState(5); // 5 years
  const [frequency, setFrequency] = useState<'quarterly' | 'monthly' | 'half-yearly' | 'yearly'>('quarterly');

  const formatInvestment = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatRate = (val: number) => `${val.toFixed(1)}%`;
  const formatTime = (val: number) => `${val} yr`;

  const { estimatedInterest, maturityValue } = useMemo(() => {
    return calculateFD(totalInvestment, rateOfInterest, timePeriodYears, frequency);
  }, [totalInvestment, rateOfInterest, timePeriodYears, frequency]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Total Investment"
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

          {/* Compounding Frequency */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--color-text-primary)' }}>
              Compounding Frequency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['quarterly', 'monthly', 'half-yearly', 'yearly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                    frequency === freq
                      ? 'bg-[#00C2B3] text-white border-[#00C2B3]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-6 shadow-sm"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-on-card)' }}>
              Bank FD Key Features
            </h2>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Guaranteed Returns:</strong> Capital safe investment insured up to ₹5 Lakhs per bank via DICGC.</li>
              <li><strong>Senior Citizens:</strong> Banks typically offer 0.50% higher interest rates for senior citizens.</li>
              <li><strong>Tax-Saving FDs:</strong> 5-year lock-in FDs qualify for Section 80C tax deduction up to ₹1.5 Lakhs.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <InvestmentResultsPanel
            type="SIP"
            amount1Label="Total investment"
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
