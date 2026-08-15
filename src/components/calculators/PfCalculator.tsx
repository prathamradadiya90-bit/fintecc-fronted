'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateEPF } from '@/lib/utils/retirementCalculators';

export function PfCalculator() {
  const [basicSalary, setBasicSalary] = useState(50000); // 50K basic
  const [currentAge, setCurrentAge] = useState(25); // 25 yrs
  const [retirementAge, setRetirementAge] = useState(58); // 58 yrs
  const [salaryGrowth, setSalaryGrowth] = useState(5); // 5% annual hike
  const [epfRate, setEpfRate] = useState(8.25); // 8.25% EPFO rate

  const formatAmount = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatAge = (val: number) => `${val} yrs`;
  const formatPercent = (val: number) => `${val.toFixed(1)}%`;

  const { employeeTotalContribution, employerTotalContribution, totalInterestEarned, totalMaturityCorpus } =
    useMemo(() => {
      return calculateEPF(
        basicSalary,
        currentAge,
        retirementAge,
        12,
        3.67,
        salaryGrowth,
        epfRate
      );
    }, [basicSalary, currentAge, retirementAge, salaryGrowth, epfRate]);

  const totalInvested = employeeTotalContribution + employerTotalContribution;

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Monthly Basic Salary (+ DA)"
            value={basicSalary}
            min={10000}
            max={500000}
            step={2500}
            onChange={setBasicSalary}
            formatValue={formatAmount}
            minLabel="₹10K"
            maxLabel="₹5L"
          />

          <div className="grid grid-cols-2 gap-4">
            <SliderInput
              label="Your Current Age"
              value={currentAge}
              min={18}
              max={55}
              step={1}
              onChange={(val) => {
                setCurrentAge(val);
                if (val >= retirementAge) setRetirementAge(val + 1);
              }}
              formatValue={formatAge}
              minLabel="18 yr"
              maxLabel="55 yr"
            />

            <SliderInput
              label="Retirement Age"
              value={retirementAge}
              min={Math.max(50, currentAge + 1)}
              max={65}
              step={1}
              onChange={setRetirementAge}
              formatValue={formatAge}
              minLabel="50 yr"
              maxLabel="65 yr"
            />
          </div>

          <SliderInput
            label="Expected Annual Salary Growth (% p.a.)"
            value={salaryGrowth}
            min={0}
            max={15}
            step={0.5}
            onChange={setSalaryGrowth}
            formatValue={formatPercent}
            minLabel="0%"
            maxLabel="15%"
          />

          <SliderInput
            label="Current EPF Interest Rate (% p.a.)"
            value={epfRate}
            min={7.5}
            max={9.0}
            step={0.05}
            onChange={setEpfRate}
            formatValue={formatPercent}
            minLabel="7.5%"
            maxLabel="9.0%"
          />

          <div
            className="rounded-2xl p-6 shadow-sm mt-2"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-on-card)' }}>
              EPF Structure (EPFO India)
            </h2>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Employee Contribution:</strong> 12% of Basic + DA goes entirely to EPF.</li>
              <li><strong>Employer Contribution:</strong> 3.67% goes to EPF, 8.33% diverted to EPS (Pension Scheme).</li>
              <li><strong>Compounding:</strong> Interest is calculated monthly and credited annually to your EPFO passbook.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <InvestmentResultsPanel
            type="SIP"
            amount1Label="Total employee + employer deposits"
            amount1Value={totalInvested}
            amount2Label="Total interest earned"
            amount2Value={totalInterestEarned}
            totalLabel="Accumulated EPF corpus"
            totalValue={totalMaturityCorpus}
          />
        </div>
      </div>
    </div>
  );
}
