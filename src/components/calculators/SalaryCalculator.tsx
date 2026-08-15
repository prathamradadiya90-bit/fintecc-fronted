'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { calculateSalary } from '@/lib/utils/taxCalculators';
import { formatCurrencyExact, formatCurrency } from '@/lib/utils/loanCalculator';
import { Wallet } from 'lucide-react';

export function SalaryCalculator() {
  const [annualCTC, setAnnualCTC] = useState(1200000); // 12 LPA
  const [basicPercent, setBasicPercent] = useState(50); // 50%
  const [hraPercent, setHraPercent] = useState(20); // 20%

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatPercent = (val: number) => `${val}%`;

  const results = useMemo(() => {
    return calculateSalary(annualCTC, basicPercent, hraPercent, 200);
  }, [annualCTC, basicPercent, hraPercent]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Annual Cost to Company (CTC)"
            value={annualCTC}
            min={200000}
            max={10000000}
            step={25000}
            onChange={setAnnualCTC}
            formatValue={formatAmount}
            minLabel="₹2L"
            maxLabel="₹1Cr"
          />

          <SliderInput
            label="Basic Salary (% of CTC)"
            value={basicPercent}
            min={30}
            max={60}
            step={5}
            onChange={setBasicPercent}
            formatValue={formatPercent}
            minLabel="30%"
            maxLabel="60%"
          />

          <SliderInput
            label="HRA Component (% of CTC)"
            value={hraPercent}
            min={10}
            max={30}
            step={5}
            onChange={setHraPercent}
            formatValue={formatPercent}
            minLabel="10%"
            maxLabel="30%"
          />

          <div
            className="rounded-2xl p-4 shadow-sm mt-4"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-on-card)' }}>
              Salary Structure Insights
            </h2>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>EPF Deduction:</strong> 12% of Basic salary deducted each month toward retirement savings.</li>
              <li><strong>Professional Tax (PT):</strong> Statutory state deduction capped at ₹200/month (₹2,500/year).</li>
              <li><strong>TDS:</strong> Estimated based on New Tax Regime slab rates with ₹75K standard deduction.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-[#00C2B3]" />
              <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                ESTIMATED MONTHLY IN-HAND (TAKE HOME)
              </h3>
            </div>

            <div className="text-4xl font-extrabold text-[#00C2B3] mb-6">
              {formatCurrencyExact(results.netInHandMonthly)}
              <span className="text-sm text-slate-400 font-normal ml-2">/ month</span>
            </div>

            <div className="space-y-2.5 border-t border-slate-700/50 pt-5 text-sm">
              <div className="flex justify-between items-center text-slate-300">
                <span>Monthly Gross CTC</span>
                <span className="font-semibold">{formatCurrencyExact(annualCTC / 12)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 pl-3">
                <span>• Basic Salary</span>
                <span>{formatCurrencyExact(results.basicSalaryMonthly)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 pl-3">
                <span>• HRA Allowance</span>
                <span>{formatCurrencyExact(results.hraMonthly)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 pl-3">
                <span>• Special Allowance</span>
                <span>{formatCurrencyExact(results.specialAllowanceMonthly)}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-slate-300">
                <span>Monthly Deductions</span>
                <span className="font-semibold text-rose-400">
                  -{formatCurrencyExact(results.employeeEPFMonthly + results.professionalTaxMonthly + results.estimatedTDSMonthly)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 pl-3">
                <span>• Employee EPF (12%)</span>
                <span>-{formatCurrencyExact(results.employeeEPFMonthly)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 pl-3">
                <span>• Professional Tax</span>
                <span>-₹{results.professionalTaxMonthly}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 pl-3">
                <span>• Estimated Monthly TDS</span>
                <span>-{formatCurrencyExact(results.estimatedTDSMonthly)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
