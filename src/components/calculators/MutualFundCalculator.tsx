'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateMutualFund } from '@/lib/utils/investmentCalculators';

export function MutualFundCalculator() {
  const [investmentType, setInvestmentType] = useState<'SIP' | 'Lumpsum'>('SIP');
  const [amount, setAmount] = useState(10000); // 10K/mo for SIP or 10K lumpsum
  const [expectedReturnRate, setExpectedReturnRate] = useState(12); // 12%
  const [timePeriodYears, setTimePeriodYears] = useState(10); // 10 years

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatRate = (val: number) => `${val.toFixed(1)}%`;
  const formatTime = (val: number) => `${val} yr`;

  const { investedAmount, estimatedReturns, totalValue } = useMemo(() => {
    return calculateMutualFund(investmentType, amount, expectedReturnRate, timePeriodYears);
  }, [investmentType, amount, expectedReturnRate, timePeriodYears]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
        <button
          type="button"
          onClick={() => {
            setInvestmentType('SIP');
            if (amount < 500) setAmount(5000);
          }}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            investmentType === 'SIP'
              ? 'bg-[#00C2B3] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          SIP (Monthly)
        </button>
        <button
          type="button"
          onClick={() => {
            setInvestmentType('Lumpsum');
            if (amount < 5000) setAmount(100000);
          }}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            investmentType === 'Lumpsum'
              ? 'bg-[#00C2B3] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Lumpsum (One-Time)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label={investmentType === 'SIP' ? 'Monthly Investment' : 'Total Investment'}
            value={amount}
            min={investmentType === 'SIP' ? 500 : 5000}
            max={investmentType === 'SIP' ? 500000 : 10000000}
            step={investmentType === 'SIP' ? 500 : 5000}
            onChange={setAmount}
            formatValue={formatAmount}
            minLabel={investmentType === 'SIP' ? '₹500' : '₹5K'}
            maxLabel={investmentType === 'SIP' ? '₹5L' : '₹1Cr'}
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
              Mutual Funds in India
            </h2>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Equity Funds:</strong> Typically generate 12-15% historic CAGR over 7+ year horizons.</li>
              <li><strong>Taxation:</strong> LTCG over ₹1.25 Lakhs taxed at 12.5% without indexation (Budget 2024).</li>
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
