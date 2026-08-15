'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { calculateIncomeTax } from '@/lib/utils/taxCalculators';
import { formatCurrencyExact, formatCurrency } from '@/lib/utils/loanCalculator';
import { CheckCircle2, Zap, ArrowRight } from 'lucide-react';

export function IncomeTaxCalculator() {
  const [annualIncome, setAnnualIncome] = useState(1200000); // 12 Lakhs
  const [deductions80C, setDeductions80C] = useState(150000); // 1.5 Lakhs
  const [deductions80D, setDeductions80D] = useState(25000); // 25K health insurance
  const [hraExemption, setHraExemption] = useState(100000); // 1 Lakh HRA
  const [homeLoanInterest, setHomeLoanInterest] = useState(0); // Home loan

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const results = useMemo(() => {
    return calculateIncomeTax(
      annualIncome,
      deductions80C,
      deductions80D,
      hraExemption,
      homeLoanInterest,
      0
    );
  }, [annualIncome, deductions80C, deductions80D, hraExemption, homeLoanInterest]);

  return (
    <div className="space-y-6">
      {/* Recommended Regime Banner */}
      <div
        className="p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: results.betterRegime === 'NEW' ? 'rgba(0, 194, 179, 0.1)' : 'rgba(99, 102, 241, 0.1)',
          border: `1px solid ${results.betterRegime === 'NEW' ? '#00C2B3' : '#6366f1'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00C2B3] text-white flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {results.betterRegime === 'NEW' ? 'New Tax Regime is Better for You!' : 'Old Tax Regime Saves You More!'}
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              You save <strong className="text-emerald-500 font-bold">{formatCurrencyExact(results.taxDifference)}</strong> by choosing the{' '}
              {results.betterRegime === 'NEW' ? 'New' : 'Old'} Regime.
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#00C2B3] text-white">
          Budget 2024-25 Updated
        </span>
      </div>

      {/* Main Grid */}
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Sliders & Deductions (7 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Income & Deductions
            </h2>

            <SliderInput
              label="Annual Gross Salary / Income"
              value={annualIncome}
              min={300000}
              max={10000000}
              step={25000}
              onChange={setAnnualIncome}
              formatValue={formatAmount}
              minLabel="₹3L"
              maxLabel="₹1Cr"
            />

            <SliderInput
              label="Section 80C Deductions (ELSS, PPF, EPF)"
              value={deductions80C}
              min={0}
              max={150000}
              step={5000}
              onChange={setDeductions80C}
              formatValue={formatAmount}
              minLabel="₹0"
              maxLabel="₹1.5L Max"
            />

            <SliderInput
              label="Section 80D (Health Insurance Premium)"
              value={deductions80D}
              min={0}
              max={100000}
              step={2500}
              onChange={setDeductions80D}
              formatValue={formatAmount}
              minLabel="₹0"
              maxLabel="₹1 Lakh"
            />

            <SliderInput
              label="HRA Exemption Claimed"
              value={hraExemption}
              min={0}
              max={500000}
              step={10000}
              onChange={setHraExemption}
              formatValue={formatAmount}
              minLabel="₹0"
              maxLabel="₹5 Lakhs"
            />

            <SliderInput
              label="Home Loan Interest (Section 24b)"
              value={homeLoanInterest}
              min={0}
              max={200000}
              step={10000}
              onChange={setHomeLoanInterest}
              formatValue={formatAmount}
              minLabel="₹0"
              maxLabel="₹2L Max"
            />
          </div>

          {/* Right Column: Side-by-Side Comparison Cards (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Regime Comparison
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Regime Card */}
              <div
                className={`p-5 rounded-2xl flex flex-col justify-between transition-all ${
                  results.betterRegime === 'NEW'
                    ? 'ring-2 ring-[#00C2B3] bg-gradient-to-b from-[#00C2B3]/5 to-transparent'
                    : ''
                }`}
                style={{
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>New Regime</span>
                    {results.betterRegime === 'NEW' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-extrabold text-[#00C2B3] mb-4">
                    {formatCurrencyExact(results.totalTaxNew)}
                  </div>

                  <div className="space-y-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <div className="flex justify-between">
                      <span>Std Deduction:</span>
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>₹75,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxable Income:</span>
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatCurrencyExact(results.taxableIncomeNew)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4% Health & Edu Cess:</span>
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatCurrencyExact(results.cessNew)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 text-[11px] text-slate-500" style={{ borderTop: '1px solid var(--color-border)' }}>
                  Zero tax up to ₹7.75 Lakhs with standard deduction & 87A rebate.
                </div>
              </div>

              {/* Old Regime Card */}
              <div
                className={`p-5 rounded-2xl flex flex-col justify-between transition-all ${
                  results.betterRegime === 'OLD'
                    ? 'ring-2 ring-indigo-500 bg-gradient-to-b from-indigo-500/5 to-transparent'
                    : ''
                }`}
                style={{
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>Old Regime</span>
                    {results.betterRegime === 'OLD' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-extrabold text-indigo-500 mb-4">
                    {formatCurrencyExact(results.totalTaxOld)}
                  </div>

                  <div className="space-y-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <div className="flex justify-between">
                      <span>Std Deduction:</span>
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>₹50,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxable Income:</span>
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatCurrencyExact(results.taxableIncomeOld)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4% Health & Edu Cess:</span>
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatCurrencyExact(results.cessOld)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 text-[11px] text-slate-500" style={{ borderTop: '1px solid var(--color-border)' }}>
                  Allows 80C, 80D, HRA, home loan interest, and other chapter VI-A deductions.
                </div>
              </div>
            </div>

            {/* Quick Slabs Reference */}
            <div
              className="p-4 rounded-xl text-xs space-y-1.5"
              style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              <div className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>Budget 2024 New Regime Slabs:</div>
              <div>• ₹0 - ₹3L: Nil</div>
              <div>• ₹3L - ₹7L: 5% | ₹7L - ₹10L: 10%</div>
              <div>• ₹10L - ₹12L: 15% | ₹12L - ₹15L: 20% | &gt;₹15L: 30%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
