'use client';

import React, { useState, useMemo } from 'react';
import { LoanTabs } from '@/components/loan-calculator/LoanTabs';
import { SliderInput } from '@/components/loan-calculator/SliderInput';
import { ResultsPanel } from '@/components/loan-calculator/ResultsPanel';
import { AmortizationSchedule } from '@/components/loan-calculator/AmortizationSchedule';
import { calculateEMI, generateAmortizationSchedule, formatCurrency } from '@/lib/utils/loanCalculator';

export default function LoanCalculatorPage() {
  const [activeTab, setActiveTab] = useState('Home Loan');
  
  // Default values matching Figma design
  const [principal, setPrincipal] = useState(1000000); // 10L
  const [interestRate, setInterestRate] = useState(8.5); // 8.5%
  const [tenureYears, setTenureYears] = useState(20); // 20 years

  // Format functions for sliders
  const formatPrincipal = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val}`;
  };

  const formatRate = (val: number) => `${val.toFixed(1)}%`;
  const formatTenure = (val: number) => `${val} years`;

  // Calculations
  const { emi, totalInterest, totalPayable, schedule } = useMemo(() => {
    const monthlyEMI = calculateEMI(principal, interestRate, tenureYears);
    const months = tenureYears * 12;
    const payable = monthlyEMI * months;
    const interest = payable - principal;
    const amortSchedule = generateAmortizationSchedule(principal, interestRate, tenureYears);
    
    return {
      emi: monthlyEMI,
      totalInterest: Math.max(0, interest),
      totalPayable: Math.max(0, payable),
      schedule: amortSchedule
    };
  }, [principal, interestRate, tenureYears]);

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#091124]">Loan Calculator</h1>
        <p className="text-slate-500 mt-1 text-[14px]">Calculate EMI, total interest, and full amortization schedule.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
        <LoanTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {/* Left Column: Inputs */}
          <div className="flex flex-col">
            <SliderInput 
              label="Principal Amount"
              value={principal}
              min={10000}
              max={10000000} // 1Cr
              step={10000}
              onChange={setPrincipal}
              formatValue={formatPrincipal}
              minLabel="₹10K"
              maxLabel="₹1Cr"
            />
            
            <SliderInput 
              label="Interest Rate (% p.a.)"
              value={interestRate}
              min={1}
              max={36}
              step={0.1}
              onChange={setInterestRate}
              formatValue={formatRate}
              minLabel="1%"
              maxLabel="36%"
            />
            
            <SliderInput 
              label="Loan Tenure"
              value={tenureYears}
              min={1}
              max={30}
              step={1}
              onChange={setTenureYears}
              formatValue={formatTenure}
              minLabel="1 yr"
              maxLabel="30 yrs"
            />
          </div>

          {/* Right Column: Results */}
          <div>
            <ResultsPanel 
              loanType={activeTab}
              emi={emi}
              principal={principal}
              totalInterest={totalInterest}
              totalPayable={totalPayable}
            />
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <AmortizationSchedule schedule={schedule} />

    </div>
  );
}
