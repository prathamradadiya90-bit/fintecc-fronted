'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { calculateGST } from '@/lib/utils/taxCalculators';
import { formatCurrencyExact } from '@/lib/utils/loanCalculator';

export function GstCalculator() {
  const [amount, setAmount] = useState(25000); // 25K
  const [gstRate, setGstRate] = useState(18); // 18% standard
  const [calculationType, setCalculationType] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [isInterState, setIsInterState] = useState(false);

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const { baseAmount, gstAmount, totalAmount, cgst, sgst, igst } = useMemo(() => {
    return calculateGST(amount, gstRate, calculationType, isInterState);
  }, [amount, gstRate, calculationType, isInterState]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      {/* Calculation Type Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 p-1 rounded-xl w-fit" style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={() => setCalculationType('exclusive')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              calculationType === 'exclusive'
                ? 'bg-[#00C2B3] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            GST Exclusive (Add GST)
          </button>
          <button
            type="button"
            onClick={() => setCalculationType('inclusive')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              calculationType === 'inclusive'
                ? 'bg-[#00C2B3] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            GST Inclusive (Remove GST)
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
          <input
            type="checkbox"
            checked={isInterState}
            onChange={(e) => setIsInterState(e.target.checked)}
            className="w-4 h-4 rounded text-[#00C2B3] focus:ring-[#00C2B3]"
          />
          <span>Inter-State Supply (IGST only)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label={calculationType === 'exclusive' ? 'Base / Net Amount' : 'Total Invoice Amount (Gross)'}
            value={amount}
            min={100}
            max={5000000}
            step={500}
            onChange={setAmount}
            formatValue={formatAmount}
            minLabel="₹100"
            maxLabel="₹50 Lakhs"
          />

          {/* GST Slabs */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--color-text-primary)' }}>
              GST Rate Slab
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 5, 12, 18, 28].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setGstRate(rate)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    gstRate === rate
                      ? 'bg-[#00C2B3] text-white border-[#00C2B3]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-on-card)' }}>
              GST Tax Split Architecture
            </h2>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Intra-State:</strong> Tax is equally split 50:50 into CGST (Central GST) and SGST (State GST).</li>
              <li><strong>Inter-State:</strong> 100% of tax collected is classified as IGST (Integrated GST).</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-md">
            <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-2">
              TOTAL INVOICE AMOUNT
            </h3>
            <div className="text-4xl font-extrabold text-[#00C2B3] mb-6">
              {formatCurrencyExact(totalAmount)}
            </div>

            <div className="space-y-3 border-t border-slate-700/50 pt-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Net Base Price</span>
                <span className="font-semibold">{formatCurrencyExact(baseAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total GST ({gstRate}%)</span>
                <span className="font-semibold text-emerald-400">+{formatCurrencyExact(gstAmount)}</span>
              </div>

              {!isInterState ? (
                <>
                  <div className="flex justify-between items-center text-xs text-slate-400 pl-4">
                    <span>CGST ({gstRate / 2}%)</span>
                    <span>{formatCurrencyExact(cgst)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400 pl-4">
                    <span>SGST ({gstRate / 2}%)</span>
                    <span>{formatCurrencyExact(sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center text-xs text-slate-400 pl-4">
                  <span>IGST ({gstRate}%)</span>
                  <span>{formatCurrencyExact(igst)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
