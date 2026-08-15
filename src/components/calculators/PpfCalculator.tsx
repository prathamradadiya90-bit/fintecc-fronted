'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculatePPF } from '@/lib/utils/retirementCalculators';
import { formatCurrencyExact } from '@/lib/utils/loanCalculator';

export function PpfCalculator() {
  const [yearlyInvestment, setYearlyInvestment] = useState(150000); // 1.5 Lakhs (max allowed)
  const [timePeriodYears, setTimePeriodYears] = useState(15); // 15 years standard
  const [rateOfInterest, setRateOfInterest] = useState(7.1); // Current PPF rate 7.1%

  const formatYearly = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatRate = (val: number) => `${val.toFixed(1)}%`;
  const formatTime = (val: number) => `${val} yrs`;

  const { totalInvested, totalInterest, maturityAmount, yearlyBreakup } = useMemo(() => {
    return calculatePPF(yearlyInvestment, timePeriodYears, rateOfInterest);
  }, [yearlyInvestment, timePeriodYears, rateOfInterest]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Yearly Investment (Max ₹1.5L / year)"
            value={yearlyInvestment}
            min={500}
            max={150000}
            step={500}
            onChange={setYearlyInvestment}
            formatValue={formatYearly}
            minLabel="₹500"
            maxLabel="₹1.5 Lakhs"
          />

          <SliderInput
            label="Time Period (Years)"
            value={timePeriodYears}
            min={15}
            max={30}
            step={5}
            onChange={setTimePeriodYears}
            formatValue={formatTime}
            minLabel="15 yrs"
            maxLabel="30 yrs (5-yr blocks)"
          />

          <SliderInput
            label="Current PPF Interest Rate (% p.a.)"
            value={rateOfInterest}
            min={6.5}
            max={9.0}
            step={0.1}
            onChange={setRateOfInterest}
            formatValue={formatRate}
            minLabel="6.5%"
            maxLabel="9.0%"
          />

          <div
            className="rounded-2xl p-6 shadow-sm mt-4"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                EEE TAX STATUS
              </span>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-on-card)' }}>
                PPF Key Highlights
              </h2>
            </div>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Exempt-Exempt-Exempt (EEE):</strong> Deposit qualifies under 80C, interest earned is tax-free, and maturity amount is 100% tax-free.</li>
              <li><strong>Government Backed:</strong> Zero default risk with sovereign guarantee.</li>
              <li><strong>Extension Option:</strong> Can be extended in blocks of 5 years indefinitely after initial 15-year maturity.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <InvestmentResultsPanel
            type="SIP"
            amount1Label="Total amount invested"
            amount1Value={totalInvested}
            amount2Label="Total tax-free interest"
            amount2Value={totalInterest}
            totalLabel="Maturity corpus"
            totalValue={maturityAmount}
          />
        </div>
      </div>
    </div>
  );
}
