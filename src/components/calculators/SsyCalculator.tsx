'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateSSY } from '@/lib/utils/retirementCalculators';

export function SsyCalculator() {
  const [yearlyInvestment, setYearlyInvestment] = useState(100000); // 1 Lakh/year
  const [girlAge, setGirlAge] = useState(2); // 2 years old
  const [interestRate, setInterestRate] = useState(8.2); // Current 8.2% SSY rate

  const formatAmount = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatAge = (val: number) => `${val} yrs`;
  const formatRate = (val: number) => `${val.toFixed(1)}%`;

  const { totalInvested, interestEarned, maturityAmount } = useMemo(() => {
    return calculateSSY(yearlyInvestment, girlAge, interestRate);
  }, [yearlyInvestment, girlAge, interestRate]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Yearly Deposit (Max ₹1.5 Lakhs)"
            value={yearlyInvestment}
            min={250}
            max={150000}
            step={500}
            onChange={setYearlyInvestment}
            formatValue={formatAmount}
            minLabel="₹250"
            maxLabel="₹1.5 Lakhs"
          />

          <SliderInput
            label="Girl Child Age"
            value={girlAge}
            min={0}
            max={10}
            step={1}
            onChange={setGirlAge}
            formatValue={formatAge}
            minLabel="0 yr (Infant)"
            maxLabel="10 yrs (Max entry age)"
          />

          <SliderInput
            label="SSY Government Interest Rate (% p.a.)"
            value={interestRate}
            min={7.0}
            max={9.5}
            step={0.1}
            onChange={setInterestRate}
            formatValue={formatRate}
            minLabel="7.0%"
            maxLabel="9.5%"
          />

          <div
            className="rounded-2xl p-6 shadow-sm mt-4"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300">
                8.2% HIGHEST GUARANTEED RATE
              </span>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-on-card)' }}>
                SSY Scheme Rules
              </h2>
            </div>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Deposit Period:</strong> Mandatory for first 15 years from account opening.</li>
              <li><strong>Maturity Period:</strong> Account matures 21 years from the date of opening.</li>
              <li><strong>EEE Tax Status:</strong> 100% tax-free under 80C, interest is tax-exempt, maturity is tax-free.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <InvestmentResultsPanel
            type="SIP"
            amount1Label="Total deposits (15 years)"
            amount1Value={totalInvested}
            amount2Label="Total guaranteed interest"
            amount2Value={interestEarned}
            totalLabel="Maturity amount at 21 years"
            totalValue={maturityAmount}
          />
        </div>
      </div>
    </div>
  );
}
