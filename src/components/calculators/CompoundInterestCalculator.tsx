'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateCompoundInterest } from '@/lib/utils/bankingCalculators';

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(100000); // 1 Lakh
  const [rate, setRate] = useState(8.5); // 8.5%
  const [timeYears, setTimeYears] = useState(5); // 5 years
  const [frequency, setFrequency] = useState<number>(4); // Quarterly (4)

  const formatPrincipal = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatRate = (val: number) => `${val.toFixed(1)}%`;
  const formatTime = (val: number) => `${val} yr`;

  const { totalInterest, totalAmount } = useMemo(() => {
    return calculateCompoundInterest(principal, rate, timeYears, frequency);
  }, [principal, rate, timeYears, frequency]);

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
            label="Annual Interest Rate (% p.a.)"
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

          {/* Compounding Frequency Selector */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--color-text-primary)' }}>
              Compounding Frequency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Annually', val: 1 },
                { label: 'Half-Yearly', val: 2 },
                { label: 'Quarterly', val: 4 },
                { label: 'Monthly', val: 12 },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setFrequency(item.val)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                    frequency === item.val
                      ? 'bg-[#00C2B3] text-white border-[#00C2B3]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-6 shadow-sm mt-2"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-on-card)' }}>
              Compound Interest Formula
            </h2>
            <p className="text-xs font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mb-3 text-emerald-600 dark:text-emerald-400">
              A = P × (1 + r/n)^(n×t)
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Interest earns interest! More frequent compounding generates higher overall returns over time.
            </p>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <InvestmentResultsPanel
            type="SIP"
            amount1Label="Principal amount"
            amount1Value={principal}
            amount2Label="Compound interest"
            amount2Value={totalInterest}
            totalLabel="Total maturity amount"
            totalValue={totalAmount}
          />
        </div>
      </div>
    </div>
  );
}
