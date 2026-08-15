'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculatePostOfficeMIS } from '@/lib/utils/retirementCalculators';
import { formatCurrencyExact } from '@/lib/utils/loanCalculator';

export function PostOfficeMisCalculator() {
  const [accountType, setAccountType] = useState<'single' | 'joint'>('single');
  const [investmentAmount, setInvestmentAmount] = useState(500000); // 5 Lakhs
  const [interestRate, setInterestRate] = useState(7.4); // Current 7.4%

  const maxLimit = accountType === 'single' ? 900000 : 1500000; // Single ₹9L, Joint ₹15L

  const formatAmount = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatRate = (val: number) => `${val.toFixed(1)}%`;

  const { monthlyInterestIncome, annualInterestIncome, totalInterest5Years } = useMemo(() => {
    return calculatePostOfficeMIS(Math.min(investmentAmount, maxLimit), interestRate);
  }, [investmentAmount, maxLimit, interestRate]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      {/* Account Type Toggle */}
      <div className="flex items-center gap-2 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
        <button
          type="button"
          onClick={() => {
            setAccountType('single');
            if (investmentAmount > 900000) setInvestmentAmount(900000);
          }}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            accountType === 'single'
              ? 'bg-[#00C2B3] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Single Account (Max ₹9L)
        </button>
        <button
          type="button"
          onClick={() => setAccountType('joint')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            accountType === 'joint'
              ? 'bg-[#00C2B3] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Joint Account (Max ₹15L)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label={`Deposit Amount (Max ${accountType === 'single' ? '₹9 Lakhs' : '₹15 Lakhs'})`}
            value={investmentAmount}
            min={1000}
            max={maxLimit}
            step={5000}
            onChange={setInvestmentAmount}
            formatValue={formatAmount}
            minLabel="₹1K"
            maxLabel={formatAmount(maxLimit)}
          />

          <SliderInput
            label="Post Office MIS Interest Rate (% p.a.)"
            value={interestRate}
            min={6.5}
            max={9.0}
            step={0.1}
            onChange={setInterestRate}
            formatValue={formatRate}
            minLabel="6.5%"
            maxLabel="9.0%"
          />

          <div
            className="rounded-2xl p-6 shadow-sm mt-4"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-on-card)' }}>
              POMIS Scheme Features
            </h2>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>5-Year Lock-in:</strong> Principal returned in full after 5-year tenure.</li>
              <li><strong>Monthly Interest Payout:</strong> Interest is directly credited monthly to your linked savings bank account.</li>
              <li><strong>Sovereign Safety:</strong> Backed by the Ministry of Finance, Government of India.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-md">
            <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-2">
              GUARANTEED MONTHLY INCOME
            </h3>
            <div className="text-4xl font-extrabold text-[#00C2B3] mb-6">
              {formatCurrencyExact(monthlyInterestIncome)}
              <span className="text-sm text-slate-400 font-normal ml-2">/ month</span>
            </div>

            <div className="space-y-3 border-t border-slate-700/50 pt-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Principal Deposit</span>
                <span className="font-semibold">{formatCurrencyExact(investmentAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Annual Income</span>
                <span className="font-semibold">{formatCurrencyExact(annualInterestIncome)}/yr</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Interest (5 Years)</span>
                <span className="font-semibold text-emerald-400">{formatCurrencyExact(totalInterest5Years)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
