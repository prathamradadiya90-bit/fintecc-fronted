'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { ResultsPanel } from '@/components/calculators/ResultsPanel';
import { AmortizationSchedule } from '@/components/calculators/AmortizationSchedule';
import { calculateEMI, generateAmortizationSchedule } from '@/lib/utils/loanCalculator';

export function EmiCalculator() {
  const activeTab = 'Home Loan';
  
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
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {/* Left Column: Inputs */}
          <div className="flex flex-col">
            <SliderInput 
              label="Principal Amount"
              value={principal}
              min={10000}
              max={50000000} // 1Cr
              step={10000}
              onChange={setPrincipal}
              formatValue={formatPrincipal}
              minLabel="₹10K"
              maxLabel="₹5Cr"
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
            <div className=" bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-sm font-semibold text-slate-700">About EMI Calculator</h2>
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-2 leading-relaxed">
                <li><strong>Accurate EMI Calculation:</strong> Instantly determine your Equated Monthly Installment (EMI) based on the principal, interest rate, and tenure.</li>
                <li><strong>Comprehensive Amortization Schedule:</strong> View a detailed month-by-month breakdown of your principal and interest payments.</li>
                <li><strong>Easy Planning:</strong> Adjust sliders to see how different loan amounts, interest rates, or tenures affect your monthly budget.</li>
              </ul>
            </div>
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
    </>
  );
}
