'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateKVP } from '@/lib/utils/retirementCalculators';

export function KvpCalculator() {
  const [principalAmount, setPrincipalAmount] = useState(100000); // 1 Lakh
  const [interestRate, setInterestRate] = useState(7.5); // Current 7.5%

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const { maturityAmount, doublingPeriodYears, doublingPeriodMonths } = useMemo(() => {
    return calculateKVP(principalAmount, interestRate);
  }, [principalAmount, interestRate]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Principal Investment Amount"
            value={principalAmount}
            min={1000}
            max={5000000}
            step={5000}
            onChange={setPrincipalAmount}
            formatValue={formatAmount}
            minLabel="₹1K"
            maxLabel="₹50 Lakhs"
          />

          <div
            className="p-4 rounded-xl mb-6 flex justify-between items-center text-sm"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>Guaranteed Doubling Tenure:</span>
            <span className="font-bold text-base text-[#00C2B3]">{doublingPeriodYears} ({doublingPeriodMonths} mo)</span>
          </div>

          <div
            className="rounded-2xl p-6 shadow-sm mt-2"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-on-card)' }}>
              Kisan Vikas Patra (KVP) Details
            </h2>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Guaranteed 2X Return:</strong> Doubles your principal investment in 115 months (9 yrs 7 months) at 7.5% compound interest.</li>
              <li><strong>No Maximum Limit:</strong> Available in denominations from ₹1,000 upwards with no upper limit.</li>
              <li><strong>Collateral Loan:</strong> KVP certificates can be pledged as security to avail bank loans.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <InvestmentResultsPanel
            type="SIP"
            amount1Label="Principal invested"
            amount1Value={principalAmount}
            amount2Label="Guaranteed interest profit"
            amount2Value={principalAmount}
            totalLabel="Guaranteed 2X maturity value"
            totalValue={maturityAmount}
          />
        </div>
      </div>
    </div>
  );
}
