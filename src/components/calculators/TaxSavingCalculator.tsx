'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { calculateTaxSavings } from '@/lib/utils/taxCalculators';
import { formatCurrencyExact, formatCurrency } from '@/lib/utils/loanCalculator';
import { ShieldCheck } from 'lucide-react';

export function TaxSavingCalculator() {
  const [section80C, setSection80C] = useState(150000); // 1.5L
  const [section80D, setSection80D] = useState(25000); // 25K
  const [section80CCD, setSection80CCD] = useState(50000); // 50K NPS
  const [homeLoanInterest, setHomeLoanInterest] = useState(150000); // 1.5L
  const [taxBracket, setTaxBracket] = useState(30); // 30% slab

  const formatAmount = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const { totalDeductions, totalTaxSaved, breakup } = useMemo(() => {
    return calculateTaxSavings(
      section80C,
      section80D,
      section80CCD,
      homeLoanInterest,
      taxBracket
    );
  }, [section80C, section80D, section80CCD, homeLoanInterest, taxBracket]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          {/* Tax Bracket Selection */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--color-text-primary)' }}>
              Your Income Tax Slab / Bracket
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 30].map((bracket) => (
                <button
                  key={bracket}
                  type="button"
                  onClick={() => setTaxBracket(bracket)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    taxBracket === bracket
                      ? 'bg-[#00C2B3] text-white border-[#00C2B3]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {bracket}% Bracket
                </button>
              ))}
            </div>
          </div>

          <SliderInput
            label="Section 80C (PPF, ELSS, EPF, Life Insurance)"
            value={section80C}
            min={0}
            max={150000}
            step={5000}
            onChange={setSection80C}
            formatValue={formatAmount}
            minLabel="₹0"
            maxLabel="₹1.5 Lakhs"
          />

          <SliderInput
            label="Section 80D (Health Insurance Premium)"
            value={section80D}
            min={0}
            max={100000}
            step={2500}
            onChange={setSection80D}
            formatValue={formatAmount}
            minLabel="₹0"
            maxLabel="₹1 Lakh"
          />

          <SliderInput
            label="Section 80CCD(1B) (NPS Extra Deduction)"
            value={section80CCD}
            min={0}
            max={50000}
            step={2500}
            onChange={setSection80CCD}
            formatValue={formatAmount}
            minLabel="₹0"
            maxLabel="₹50,000"
          />

          <SliderInput
            label="Section 24(b) (Home Loan Self-Occupied Interest)"
            value={homeLoanInterest}
            min={0}
            max={200000}
            step={5000}
            onChange={setHomeLoanInterest}
            formatValue={formatAmount}
            minLabel="₹0"
            maxLabel="₹2 Lakhs"
          />
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-[#00C2B3]" />
              <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                TOTAL TAX SAVED (INCL. 4% CESS)
              </h3>
            </div>

            <div className="text-4xl font-extrabold text-[#00C2B3] mb-6">
              {formatCurrencyExact(totalTaxSaved)}
            </div>

            <div className="space-y-3 border-t border-slate-700/50 pt-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Deductions Claimed</span>
                <span className="font-semibold">{formatCurrencyExact(totalDeductions)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Sec 80C Deduction</span>
                <span className="font-semibold">{formatCurrencyExact(breakup.section80C)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Sec 80D Health Insurance</span>
                <span className="font-semibold">{formatCurrencyExact(breakup.section80D)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Sec 80CCD(1B) NPS</span>
                <span className="font-semibold">{formatCurrencyExact(breakup.section80CCD1B)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Sec 24(b) Home Loan Interest</span>
                <span className="font-semibold">{formatCurrencyExact(breakup.homeLoanInterest)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
