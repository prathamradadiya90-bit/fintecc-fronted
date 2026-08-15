'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { calculateGratuity } from '@/lib/utils/retirementCalculators';
import { formatCurrencyExact, formatCurrency } from '@/lib/utils/loanCalculator';
import { Award, CheckCircle2, AlertCircle } from 'lucide-react';

export function GratuityCalculator() {
  const [basicSalary, setBasicSalary] = useState(60000); // 60K basic + DA
  const [tenureYears, setTenureYears] = useState(7); // 7 years

  const formatAmount = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatTenure = (val: number) => `${val} yrs`;

  const { gratuityAmount, taxExemptLimit, isTaxFree } = useMemo(() => {
    return calculateGratuity(basicSalary, tenureYears);
  }, [basicSalary, tenureYears]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Last Drawn Monthly Basic Salary (+ DA)"
            value={basicSalary}
            min={5000}
            max={500000}
            step={2500}
            onChange={setBasicSalary}
            formatValue={formatAmount}
            minLabel="₹5K"
            maxLabel="₹5L"
          />

          <SliderInput
            label="Years of Continuous Service"
            value={tenureYears}
            min={1}
            max={40}
            step={1}
            onChange={setTenureYears}
            formatValue={formatTenure}
            minLabel="1 yr"
            maxLabel="40 yrs"
          />

          {tenureYears < 5 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="text-xs text-amber-800 dark:text-amber-300">
                Minimum 5 years of continuous service is legally mandatory to receive gratuity under the Payment of Gratuity Act, 1972.
              </span>
            </div>
          )}

          <div
            className="rounded-2xl p-6 shadow-sm mt-2"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-on-card)' }}>
              Gratuity Formula
            </h2>
            <p className="text-xs font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mb-3 text-emerald-600 dark:text-emerald-400">
              Gratuity = (15 × Last Drawn Basic Salary × Years of Service) / 26
            </p>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li>26 represents working days per month (excluding 4 Sundays).</li>
              <li>15 represents half-month wages per completed year of service.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results Card */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-[#00C2B3]" />
              <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                ESTIMATED GRATUITY PAYOUT
              </h3>
            </div>

            <div className="text-4xl font-extrabold text-[#00C2B3] mb-6">
              {formatCurrencyExact(gratuityAmount)}
            </div>

            <div className="space-y-3 border-t border-slate-700/50 pt-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Monthly Basic Salary</span>
                <span className="font-semibold">{formatCurrencyExact(basicSalary)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Completed Service</span>
                <span className="font-semibold">{tenureYears} Years</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Tax-Free Exemption Limit</span>
                <span className="font-semibold">{formatCurrency(taxExemptLimit)}</span>
              </div>
            </div>
          </div>

          <div
            className="p-5 rounded-2xl flex items-center gap-3"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="font-bold block text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {isTaxFree ? '100% Tax-Free Gratuity' : 'Partially Taxable'}
              </span>
              Under Section 10(10) of the Income Tax Act, gratuity up to ₹20 Lakhs is completely exempt from income tax.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
