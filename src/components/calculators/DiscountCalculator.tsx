'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { calculateDiscount } from '@/lib/utils/taxCalculators';
import { formatCurrencyExact } from '@/lib/utils/loanCalculator';
import { Tag } from 'lucide-react';

export function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState(5000); // 5K
  const [discountPercent, setDiscountPercent] = useState(25); // 25%

  const formatAmount = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatPercent = (val: number) => `${val}%`;

  const { savingsAmount, finalPrice } = useMemo(() => {
    return calculateDiscount(originalPrice, discountPercent);
  }, [originalPrice, discountPercent]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Original Price / MRP"
            value={originalPrice}
            min={100}
            max={500000}
            step={100}
            onChange={setOriginalPrice}
            formatValue={formatAmount}
            minLabel="₹100"
            maxLabel="₹5 Lakhs"
          />

          <SliderInput
            label="Discount Percentage"
            value={discountPercent}
            min={1}
            max={90}
            step={1}
            onChange={setDiscountPercent}
            formatValue={formatPercent}
            minLabel="1%"
            maxLabel="90%"
          />

          {/* Quick preset discount buttons */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--color-text-primary)' }}>
              Quick Preset Discounts
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[10, 20, 30, 50, 70].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountPercent(pct)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    discountPercent === pct
                      ? 'bg-[#00C2B3] text-white border-[#00C2B3]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {pct}% OFF
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-on-card)' }}>
              Discount Formula
            </h2>
            <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-1">
              Final Price = Original Price - [Original Price × (Discount % / 100)]
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Quickly verify vendor invoice discounts and special promotional reductions.
            </p>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-5 h-5 text-[#00C2B3]" />
              <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                FINAL DISCOUNTED PRICE
              </h3>
            </div>

            <div className="text-4xl font-extrabold text-[#00C2B3] mb-6">
              {formatCurrencyExact(finalPrice)}
            </div>

            <div className="space-y-3 border-t border-slate-700/50 pt-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Original MRP</span>
                <span className="font-semibold">{formatCurrencyExact(originalPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Discount ({discountPercent}%)</span>
                <span className="font-semibold text-emerald-400">-{formatCurrencyExact(savingsAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-800">
                <span className="text-slate-300 font-semibold">Total Savings</span>
                <span className="font-bold text-emerald-400 text-lg">{formatCurrencyExact(savingsAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
