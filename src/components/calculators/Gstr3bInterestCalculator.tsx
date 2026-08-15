'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { calculateGSTR3BInterest } from '@/lib/utils/taxCalculators';
import { formatCurrencyExact } from '@/lib/utils/loanCalculator';
import { AlertTriangle, Clock } from 'lucide-react';

export function Gstr3bInterestCalculator() {
  const [netTaxLiability, setNetTaxLiability] = useState(50000); // 50K tax liability
  const [delayDays, setDelayDays] = useState(30); // 30 days delay
  const [interestRate, setInterestRate] = useState(18); // Statutory 18% p.a.

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatDays = (val: number) => `${val} days`;
  const formatRate = (val: number) => `${val}%`;

  const { interestAmount, totalPayableWithInterest } = useMemo(() => {
    return calculateGSTR3BInterest(netTaxLiability, delayDays, interestRate);
  }, [netTaxLiability, delayDays, interestRate]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Net Tax Liability Paid in Cash (PMT-06 / Electronic Cash Ledger)"
            value={netTaxLiability}
            min={1000}
            max={5000000}
            step={5000}
            onChange={setNetTaxLiability}
            formatValue={formatAmount}
            minLabel="₹1K"
            maxLabel="₹50 Lakhs"
          />

          <SliderInput
            label="Number of Days Delayed Beyond Due Date (20th of Month)"
            value={delayDays}
            min={1}
            max={365}
            step={1}
            onChange={setDelayDays}
            formatValue={formatDays}
            minLabel="1 day"
            maxLabel="365 days"
          />

          <SliderInput
            label="Statutory Interest Rate (% p.a.)"
            value={interestRate}
            min={18}
            max={24}
            step={6}
            onChange={setInterestRate}
            formatValue={formatRate}
            minLabel="18% (Sec 50(1))"
            maxLabel="24% (Sec 50(3))"
          />

          <div
            className="rounded-2xl p-4 shadow-sm mt-2"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-on-card)' }}>
                Section 50(1) CGST Act Rules
              </h2>
            </div>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Net Tax Liability:</strong> Interest is payable strictly on net tax paid via cash ledger, NOT on gross liability offset via ITC.</li>
              <li><strong>Calculation Formula:</strong> Interest = Net Cash Tax × 18% × (Delay in Days / 365).</li>
              <li><strong>Section 50(3):</strong> 24% interest applies only on wrongly availed and utilized Input Tax Credit.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-md">
            <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-2">
              INTEREST PAYABLE UNDER SECTION 50
            </h3>
            <div className="text-4xl font-extrabold text-amber-400 mb-6">
              {formatCurrencyExact(interestAmount)}
            </div>

            <div className="space-y-3 border-t border-slate-700/50 pt-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Net Tax Liability</span>
                <span className="font-semibold">{formatCurrencyExact(netTaxLiability)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Delay Period</span>
                <span className="font-semibold">{delayDays} Days</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Annualized Interest Rate</span>
                <span className="font-semibold">{interestRate}% p.a.</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-800">
                <span className="text-slate-300 font-semibold">Total Amount Due</span>
                <span className="font-bold text-[#00C2B3] text-lg">{formatCurrencyExact(totalPayableWithInterest)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
