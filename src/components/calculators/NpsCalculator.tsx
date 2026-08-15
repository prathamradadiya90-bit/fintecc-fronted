'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateNPS } from '@/lib/utils/retirementCalculators';
import { formatCurrencyExact } from '@/lib/utils/loanCalculator';

export function NpsCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000); // 10K/month
  const [currentAge, setCurrentAge] = useState(30); // 30 yrs
  const [retirementAge, setRetirementAge] = useState(60); // 60 yrs
  const [expectedReturnRate, setExpectedReturnRate] = useState(10.0); // 10%
  const [annuityPercent, setAnnuityPercent] = useState(40); // 40% (minimum mandatory)
  const [annuityRate, setAnnuityRate] = useState(6.0); // 6% annuity rate

  const formatAmount = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatAge = (val: number) => `${val} yrs`;
  const formatPercent = (val: number) => `${val.toFixed(1)}%`;

  const { totalInvestment, totalCorpus, lumpSumAmount, annuityCorpus, expectedMonthlyPension } =
    useMemo(() => {
      return calculateNPS(
        monthlyInvestment,
        currentAge,
        retirementAge,
        expectedReturnRate,
        annuityPercent,
        annuityRate
      );
    }, [monthlyInvestment, currentAge, retirementAge, expectedReturnRate, annuityPercent, annuityRate]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Monthly NPS Contribution"
            value={monthlyInvestment}
            min={1000}
            max={200000}
            step={500}
            onChange={setMonthlyInvestment}
            formatValue={formatAmount}
            minLabel="₹1K"
            maxLabel="₹2L"
          />

          <div className="grid grid-cols-2 gap-4">
            <SliderInput
              label="Your Current Age"
              value={currentAge}
              min={18}
              max={59}
              step={1}
              onChange={(val) => {
                setCurrentAge(val);
                if (val >= retirementAge) setRetirementAge(val + 1);
              }}
              formatValue={formatAge}
              minLabel="18 yr"
              maxLabel="59 yr"
            />

            <SliderInput
              label="Retirement Age"
              value={retirementAge}
              min={Math.max(55, currentAge + 1)}
              max={70}
              step={1}
              onChange={setRetirementAge}
              formatValue={formatAge}
              minLabel="55 yr"
              maxLabel="70 yr"
            />
          </div>

          <SliderInput
            label="Expected NPS Return Rate (% p.a.)"
            value={expectedReturnRate}
            min={6}
            max={15}
            step={0.1}
            onChange={setExpectedReturnRate}
            formatValue={formatPercent}
            minLabel="6%"
            maxLabel="15%"
          />

          <SliderInput
            label="Annuity Reinvestment Ratio (Min 40%)"
            value={annuityPercent}
            min={40}
            max={100}
            step={5}
            onChange={setAnnuityPercent}
            formatValue={formatPercent}
            minLabel="40%"
            maxLabel="100%"
          />

          <div
            className="rounded-2xl p-6 shadow-sm mt-2"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                SECTION 80CCD(1B)
              </span>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-on-card)' }}>
                NPS Tax Advantage
              </h2>
            </div>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Extra ₹50,000 Deduction:</strong> Over and above the ₹1.5 Lakh 80C limit under Section 80CCD(1B).</li>
              <li><strong>Tax-Free Lump Sum:</strong> 60% corpus withdrawal at age 60 is 100% tax-free.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-4">
          <InvestmentResultsPanel
            type="SIP"
            amount1Label="Total amount invested"
            amount1Value={totalInvestment}
            amount2Label="Total interest earned"
            amount2Value={Math.max(0, totalCorpus - totalInvestment)}
            totalLabel="Total retirement corpus"
            totalValue={totalCorpus}
          />

          {/* Pension Breakdown Card */}
          <div
            className="p-5 rounded-2xl flex flex-col gap-3"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Post-Retirement Payout Structure
            </div>

            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>Tax-Free Lump Sum ({100 - annuityPercent}%):</span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {formatCurrencyExact(lumpSumAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>Annuity Pension Corpus ({annuityPercent}%):</span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {formatCurrencyExact(annuityCorpus)}
              </span>
            </div>

            <div
              className="pt-3 flex justify-between items-center"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <span className="font-bold text-sm text-[#00C2B3]">Estimated Monthly Pension:</span>
              <span className="font-extrabold text-xl text-[#00C2B3]">
                {formatCurrencyExact(expectedMonthlyPension)}/mo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
