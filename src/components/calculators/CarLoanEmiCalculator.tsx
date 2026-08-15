'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { ResultsPanel } from '@/components/calculators/ResultsPanel';
import { AmortizationSchedule } from '@/components/calculators/AmortizationSchedule';
import { calculateEMI, generateAmortizationSchedule, formatCurrency } from '@/lib/utils/loanCalculator';

export function CarLoanEmiCalculator() {
  const [carPrice, setCarPrice] = useState(1200000); // 12 Lakhs
  const [downPayment, setDownPayment] = useState(200000); // 2 Lakhs
  const [interestRate, setInterestRate] = useState(8.8); // 8.8%
  const [tenureYears, setTenureYears] = useState(5); // 5 years

  const loanPrincipal = Math.max(0, carPrice - downPayment);

  const formatPrice = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatRate = (val: number) => `${val.toFixed(1)}%`;
  const formatTenure = (val: number) => `${val} yrs`;

  const { emi, totalInterest, totalPayable, schedule } = useMemo(() => {
    const monthlyEMI = calculateEMI(loanPrincipal, interestRate, tenureYears);
    const months = tenureYears * 12;
    const payable = monthlyEMI * months;
    const interest = payable - loanPrincipal;
    const amortSchedule = generateAmortizationSchedule(loanPrincipal, interestRate, tenureYears);

    return {
      emi: monthlyEMI,
      totalInterest: Math.max(0, interest),
      totalPayable: Math.max(0, payable),
      schedule: amortSchedule,
    };
  }, [loanPrincipal, interestRate, tenureYears]);

  return (
    <>
      <div
        className="rounded-2xl p-6 shadow-sm mb-6"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
          {/* Left Column: Inputs */}
          <div className="flex flex-col">
            <SliderInput
              label="On-Road Car Price"
              value={carPrice}
              min={100000}
              max={10000000}
              step={25000}
              onChange={(val) => {
                setCarPrice(val);
                if (downPayment > val) setDownPayment(Math.round(val * 0.2));
              }}
              formatValue={formatPrice}
              minLabel="₹1L"
              maxLabel="₹1Cr"
            />

            <SliderInput
              label="Down Payment"
              value={downPayment}
              min={0}
              max={carPrice}
              step={10000}
              onChange={setDownPayment}
              formatValue={formatPrice}
              minLabel="₹0"
              maxLabel={formatPrice(carPrice)}
            />

            <div
              className="p-3.5 rounded-xl mb-6 flex justify-between items-center text-sm"
              style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
            >
              <span style={{ color: 'var(--color-text-secondary)' }}>Net Loan Amount:</span>
              <span className="font-bold text-base text-[#00C2B3]">{formatPrice(loanPrincipal)}</span>
            </div>

            <SliderInput
              label="Interest Rate (% p.a.)"
              value={interestRate}
              min={6}
              max={18}
              step={0.1}
              onChange={setInterestRate}
              formatValue={formatRate}
              minLabel="6%"
              maxLabel="18%"
            />

            <SliderInput
              label="Loan Tenure"
              value={tenureYears}
              min={1}
              max={7}
              step={1}
              onChange={setTenureYears}
              formatValue={formatTenure}
              minLabel="1 yr"
              maxLabel="7 yrs"
            />

            <div
              className="rounded-2xl p-6 shadow-sm mt-2"
              style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
            >
              <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-on-card)' }}>
                About Car Loan Calculator
              </h2>
              <ul className="list-disc list-inside text-xs space-y-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                <li><strong>Down Payment Impact:</strong> Higher down payment drastically reduces your total interest burden and monthly EMI.</li>
                <li><strong>Tenure Recommendation:</strong> Car loans are typically optimal for 3-5 years to avoid owing more than the depreciating vehicle value.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Results */}
          <div>
            <ResultsPanel
              loanType="Car Loan"
              emi={emi}
              principal={loanPrincipal}
              totalInterest={totalInterest}
              totalPayable={totalPayable}
            />
          </div>
        </div>
      </div>

      {/* Amortization Schedule */}
      <AmortizationSchedule schedule={schedule} />
    </>
  );
}
