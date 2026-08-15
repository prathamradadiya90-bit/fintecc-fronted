'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateCAGR } from '@/lib/utils/investmentCalculators';

export function CagrCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(100000); // 1 Lakh
  const [finalValue, setFinalValue] = useState(250000); // 2.5 Lakhs
  const [timePeriodYears, setTimePeriodYears] = useState(5); // 5 years

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatTime = (val: number) => `${val} yr`;

  const { cagr, absoluteReturns, totalGain } = useMemo(() => {
    return calculateCAGR(initialInvestment, finalValue, timePeriodYears);
  }, [initialInvestment, finalValue, timePeriodYears]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Initial Investment Value"
            value={initialInvestment}
            min={1000}
            max={10000000}
            step={5000}
            onChange={setInitialInvestment}
            formatValue={formatAmount}
            minLabel="₹1K"
            maxLabel="₹1Cr"
          />

          <SliderInput
            label="Final Investment Value"
            value={finalValue}
            min={1000}
            max={20000000}
            step={5000}
            onChange={setFinalValue}
            formatValue={formatAmount}
            minLabel="₹1K"
            maxLabel="₹2Cr"
          />

          <SliderInput
            label="Duration / Holding Period"
            value={timePeriodYears}
            min={1}
            max={30}
            step={1}
            onChange={setTimePeriodYears}
            formatValue={formatTime}
            minLabel="1 yr"
            maxLabel="30 yrs"
          />

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className="p-4 rounded-xl text-center"
              style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
            >
              <div className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                CAGR (Annualized)
              </div>
              <div className="text-2xl font-bold mt-1 text-[#00C2B3]">
                {cagr}%
              </div>
            </div>

            <div
              className="p-4 rounded-xl text-center"
              style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
            >
              <div className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Absolute Growth
              </div>
              <div className="text-2xl font-bold mt-1 text-emerald-500">
                +{absoluteReturns}%
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-on-card)' }}>
              CAGR Formula
            </h2>
            <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-1">
              CAGR = (Final Value / Initial Value)^(1 / Years) - 1
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              CAGR smooths out year-over-year market fluctuations to reveal your accurate annualized growth rate.
            </p>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <InvestmentResultsPanel
            type="SIP"
            amount1Label="Initial investment"
            amount1Value={initialInvestment}
            amount2Label="Total capital gain"
            amount2Value={Math.max(0, totalGain)}
            totalLabel="Final value"
            totalValue={finalValue}
          />
        </div>
      </div>
    </div>
  );
}
