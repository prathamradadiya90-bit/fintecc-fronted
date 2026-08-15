'use client';

import React, { useState, useMemo } from 'react';
import { SliderInput } from '@/components/calculators/SliderInput';
import { InvestmentResultsPanel } from '@/components/calculators/InvestmentResultsPanel';
import { calculateLTCG } from '@/lib/utils/taxCalculators';
import { formatCurrencyExact } from '@/lib/utils/loanCalculator';

export function LtcgCalculator() {
  const [assetType, setAssetType] = useState<'equity' | 'debt' | 'real_estate'>('equity');
  const [purchaseValue, setPurchaseValue] = useState(500000); // 5 Lakhs
  const [saleValue, setSaleValue] = useState(850000); // 8.5 Lakhs

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const { totalGain, exemptionLimit, taxableGain, ltcgTaxAmount } = useMemo(() => {
    return calculateLTCG(purchaseValue, saleValue, assetType);
  }, [purchaseValue, saleValue, assetType]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm mb-6"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      {/* Asset Type Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
        <button
          type="button"
          onClick={() => setAssetType('equity')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            assetType === 'equity'
              ? 'bg-[#00C2B3] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Equity / MFs (12.5%)
        </button>
        <button
          type="button"
          onClick={() => setAssetType('real_estate')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            assetType === 'real_estate'
              ? 'bg-[#00C2B3] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Real Estate (12.5%)
        </button>
        <button
          type="button"
          onClick={() => setAssetType('debt')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            assetType === 'debt'
              ? 'bg-[#00C2B3] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Debt Funds (Slab Rate)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Left Column: Inputs */}
        <div className="flex flex-col">
          <SliderInput
            label="Total Purchase / Buying Cost"
            value={purchaseValue}
            min={10000}
            max={20000000}
            step={25000}
            onChange={(val) => {
              setPurchaseValue(val);
              if (val > saleValue) setSaleValue(Math.round(val * 1.5));
            }}
            formatValue={formatAmount}
            minLabel="₹10K"
            maxLabel="₹2Cr"
          />

          <SliderInput
            label="Total Sale / Redemption Value"
            value={saleValue}
            min={purchaseValue}
            max={50000000}
            step={25000}
            onChange={setSaleValue}
            formatValue={formatAmount}
            minLabel={formatAmount(purchaseValue)}
            maxLabel="₹5Cr"
          />

          <div
            className="rounded-2xl p-6 shadow-sm mt-4"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                BUDGET 2024 UPDATE
              </span>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-on-card)' }}>
                New LTCG Tax Rules
              </h2>
            </div>
            <ul className="list-disc list-inside text-xs space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>₹1.25 Lakh Exemption:</strong> Annual LTCG on listed equities/equity funds up to ₹1.25L is 100% tax-free.</li>
              <li><strong>Flat 12.5% Tax:</strong> Gains above ₹1.25 Lakhs taxed at 12.5% (increased from 10%).</li>
              <li><strong>Indexation Benefit Removed:</strong> Real estate and unlisted assets LTCG rationalized to 12.5% without indexation.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-md">
            <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-2">
              LTCG TAX PAYABLE (INCL. 4% CESS)
            </h3>
            <div className="text-4xl font-extrabold text-[#00C2B3] mb-6">
              {formatCurrencyExact(ltcgTaxAmount)}
            </div>

            <div className="space-y-3 border-t border-slate-700/50 pt-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Capital Gain</span>
                <span className="font-semibold">{formatCurrencyExact(totalGain)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Statutory Exemption</span>
                <span className="font-semibold text-emerald-400">-{formatCurrencyExact(exemptionLimit)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Taxable Capital Gain</span>
                <span className="font-semibold">{formatCurrencyExact(taxableGain)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Net Profit in Hand (Post Tax)</span>
                <span className="font-bold text-[#00C2B3]">{formatCurrencyExact(totalGain - ltcgTaxAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
