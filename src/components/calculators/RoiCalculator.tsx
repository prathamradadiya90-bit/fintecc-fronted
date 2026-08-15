'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateROI } from '@/lib/utils/bankingCalculators';
import { formatCurrencyExact } from '@/lib/utils/loanCalculator';

export function RoiCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(100000); // 1 Lakh
  const [finalValue, setFinalValue] = useState(165000); // 1.65 Lakhs
  const [investmentPeriodYears, setInvestmentPeriodYears] = useState(3); // 3 years

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatTime = (val: number) => `${val} yr`;

  const { investedAmount, returnedAmount, absoluteReturn, roiPercentage, annualizedRoiPercentage } =
    useMemo(() => {
      return calculateROI(initialInvestment, finalValue, investmentPeriodYears);
    }, [initialInvestment, finalValue, investmentPeriodYears]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Initial Amount Invested"
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
            label="Final Amount Returned / Sold"
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
            label="Investment Holding Period"
            value={investmentPeriodYears}
            min={1}
            max={30}
            step={1}
            onChange={setInvestmentPeriodYears}
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
                Absolute ROI
              </div>
              <div className={`text-xl font-bold mt-1 ${roiPercentage >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {roiPercentage >= 0 ? `+${roiPercentage}%` : `${roiPercentage}%`}
              </div>
            </div>

            <div
              className="p-4 rounded-xl text-center"
              style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
            >
              <div className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Annualized ROI (CAGR)
              </div>
              <div className={`text-xl font-bold mt-1 ${annualizedRoiPercentage >= 0 ? 'text-[#00C2B3]' : 'text-rose-500'}`}>
                {annualizedRoiPercentage >= 0 ? `+${annualizedRoiPercentage}%` : `${annualizedRoiPercentage}%`}
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-on-card)' }}>
              How ROI is calculated
            </h2>
            <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-1">
              ROI % = [(Final Value - Initial Cost) / Initial Cost] × 100
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Annualized ROI accounts for time value of money across multi-year holding periods.
            </p>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <InvestmentResultsPanel
            type="SIP"
            amount1Label="Invested amount"
            amount1Value={investedAmount}
            amount2Label="Total net profit / loss"
            amount2Value={Math.max(0, absoluteReturn)}
            totalLabel="Final returned value"
            totalValue={returnedAmount}
          />
        </div>
      </div>
    </div>
  );
}
