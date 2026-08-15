'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { calculateRetirementPlanning } from '@/lib/utils/retirementCalculators';
import { formatCurrencyExact, formatCurrency } from '@/lib/utils/loanCalculator';
import { Target, TrendingUp } from 'lucide-react';

export function RetirementPlanningCalculator() {
  const [currentAge, setCurrentAge] = useState(30); // 30
  const [retirementAge, setRetirementAge] = useState(60); // 60
  const [currentExpenses, setCurrentExpenses] = useState(50000); // 50K/month
  const [inflationRate, setInflationRate] = useState(6.0); // 6%
  const [preReturnRate, setPreReturnRate] = useState(12.0); // 12% equity SIP
  const [postReturnRate, setPostReturnRate] = useState(8.0); // 8% conservative debt/FD

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatAge = (val: number) => `${val} yrs`;
  const formatPercent = (val: number) => `${val.toFixed(1)}%`;

  const { futureMonthlyExpensesAtRetirement, targetRetirementCorpus, monthlySavingsNeeded } =
    useMemo(() => {
      return calculateRetirementPlanning(
        currentAge,
        retirementAge,
        85, // 85 years life expectancy
        currentExpenses,
        inflationRate,
        preReturnRate,
        postReturnRate
      );
    }, [currentAge, retirementAge, currentExpenses, inflationRate, preReturnRate, postReturnRate]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Current Monthly Living Expenses"
            value={currentExpenses}
            min={10000}
            max={500000}
            step={5000}
            onChange={setCurrentExpenses}
            formatValue={formatAmount}
            minLabel="₹10K"
            maxLabel="₹5L"
          />

          <div className="grid grid-cols-2 gap-4">
            <SliderInput
              label="Your Current Age"
              value={currentAge}
              min={20}
              max={55}
              step={1}
              onChange={(val) => {
                setCurrentAge(val);
                if (val >= retirementAge) setRetirementAge(val + 1);
              }}
              formatValue={formatAge}
              minLabel="20 yr"
              maxLabel="55 yr"
            />

            <SliderInput
              label="Planned Retirement Age"
              value={retirementAge}
              min={Math.max(45, currentAge + 1)}
              max={70}
              step={1}
              onChange={setRetirementAge}
              formatValue={formatAge}
              minLabel="45 yr"
              maxLabel="70 yr"
            />
          </div>

          <SliderInput
            label="Expected Inflation Rate (% p.a.)"
            value={inflationRate}
            min={4}
            max={10}
            step={0.5}
            onChange={setInflationRate}
            formatValue={formatPercent}
            minLabel="4%"
            maxLabel="10%"
          />

          <SliderInput
            label="Pre-Retirement SIP Return Rate (% p.a.)"
            value={preReturnRate}
            min={8}
            max={18}
            step={0.5}
            onChange={setPreReturnRate}
            formatValue={formatPercent}
            minLabel="8%"
            maxLabel="18%"
          />

          <SliderInput
            label="Post-Retirement Portfolio Return (% p.a.)"
            value={postReturnRate}
            min={5}
            max={10}
            step={0.5}
            onChange={setPostReturnRate}
            formatValue={formatPercent}
            minLabel="5%"
            maxLabel="10%"
          />
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-[#00C2B3]" />
              <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                TARGET RETIREMENT CORPUS
              </h3>
            </div>

            <div className="text-4xl font-extrabold text-[#00C2B3] mb-6">
              {formatCurrencyExact(targetRetirementCorpus)}
            </div>

            <div className="space-y-3 border-t border-slate-700/50 pt-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Current Monthly Expense</span>
                <span className="font-semibold">{formatCurrencyExact(currentExpenses)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Inflation-Adjusted Expense at Age {retirementAge}</span>
                <span className="font-semibold text-amber-400">{formatCurrencyExact(futureMonthlyExpensesAtRetirement)}/mo</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Time Until Retirement</span>
                <span className="font-semibold">{retirementAge - currentAge} Years</span>
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl flex flex-col gap-2"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 text-[#00C2B3]">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Required Monthly SIP</span>
            </div>
            <div className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>
              {formatCurrencyExact(monthlySavingsNeeded)}
              <span className="text-sm font-normal text-slate-500 ml-1">/ month</span>
            </div>
            <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Start an equity mutual fund SIP of this amount today to comfortably achieve your target inflation-adjusted retirement corpus by age {retirementAge}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
