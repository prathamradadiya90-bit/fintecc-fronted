'use client';

import React, { useState } from 'react';
import {
  Calculator,
  ArrowRightLeft,
  CheckCircle2,
  TrendingDown,
  Download,
  AlertCircle,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useCompareRegimesMutation,
  useGenerateCbdtJsonMutation,
} from '@/lib/store/api/itrApi';
import type { RegimeComparisonResult } from '@/lib/types/itr.types';

export function TaxRegimeComparisonCard() {
  const { showToast } = useToast();
  const [compareRegimes, { isLoading: isComparing }] = useCompareRegimesMutation();
  const [generateCbdtJson, { isLoading: isGeneratingJson }] = useGenerateCbdtJsonMutation();

  const [assessmentYear, setAssessmentYear] = useState('2025-26');
  const [salary, setSalary] = useState<number>(1200000);
  const [homeLoanInterest, setHomeLoanInterest] = useState<number>(150000);
  const [otherIncome, setOtherIncome] = useState<number>(50000);
  const [sec80C, setSec80C] = useState<number>(150000);
  const [sec80D, setSec80D] = useState<number>(25000);
  const [sec80CCD1B, setSec80CCD1B] = useState<number>(50000);
  const [advanceTax, setAdvanceTax] = useState<number>(0);
  const [tdsPaid, setTdsPaid] = useState<number>(60000);

  const [result, setResult] = useState<RegimeComparisonResult | null>(null);

  const handleCompute = async () => {
    try {
      const res = await compareRegimes({
        assessmentYear,
        incomeDetails: {
          salary,
          houseProperty: {
            propertyType: 'SELF_OCCUPIED',
            homeLoanInterest,
          },
          otherSources: {
            otherMiscellaneous: otherIncome,
          },
        },
        deductions: {
          section80C: sec80C,
          section80D: sec80D,
          section80CCD1B: sec80CCD1B,
        },
        advanceTaxPaid: advanceTax,
        tdsTcsPaid: tdsPaid,
      }).unwrap();

      if (res.data) {
        setResult(res.data);
        showToast('Tax regimes calculated & compared successfully', 'success');
      }
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to compare tax regimes', 'error');
    }
  };

  const handleDownloadCbdtJson = async () => {
    if (!result) return;
    try {
      const res = await generateCbdtJson({
        assessmentYear,
        itrForm: 'ITR-1',
        computation: result.recommendedRegime === 'NEW_REGIME' ? result.newRegime : result.oldRegime,
      }).unwrap();

      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CBDT_ITR1_${assessmentYear}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('CBDT official e-filing JSON downloaded', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to generate CBDT JSON', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-[#1E2A38] dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#4A6FA5]" />
            Income Tax Computation & Regime Comparison (Section 115BAC)
          </h3>
          <p className="text-xs text-[#5A6E85] dark:text-slate-400 mt-0.5">
            Compare Old vs New Tax Regime with standard deductions, Chapter VI-A deductions, rebate u/s 87A, and generate CBDT JSON.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={assessmentYear}
            onChange={(e) => setAssessmentYear(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F] font-medium"
          >
            <option value="2025-26">AY 2025-26 (FY 2024-25)</option>
            <option value="2024-25">AY 2024-25 (FY 2023-24)</option>
          </select>

          <Button
            size="sm"
            onClick={handleCompute}
            disabled={isComparing}
            className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white flex items-center gap-1.5 text-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            {isComparing ? 'Computing...' : 'Compare Regimes'}
          </Button>
        </div>
      </div>

      {/* Input Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
            Gross Salary Income (₹)
          </label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
            Self-Occupied Home Loan Interest (₹)
          </label>
          <input
            type="number"
            value={homeLoanInterest}
            onChange={(e) => setHomeLoanInterest(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
            Income from Other Sources (₹)
          </label>
          <input
            type="number"
            value={otherIncome}
            onChange={(e) => setOtherIncome(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
            Section 80C Deductions (₹)
          </label>
          <input
            type="number"
            value={sec80C}
            onChange={(e) => setSec80C(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
            Section 80D Mediclaim (₹)
          </label>
          <input
            type="number"
            value={sec80D}
            onChange={(e) => setSec80D(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
            80CCD(1B) NPS Additional (₹)
          </label>
          <input
            type="number"
            value={sec80CCD1B}
            onChange={(e) => setSec80CCD1B(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
            TDS / TCS Already Deducted (₹)
          </label>
          <input
            type="number"
            value={tdsPaid}
            onChange={(e) => setTdsPaid(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
            Advance Tax Paid (₹)
          </label>
          <input
            type="number"
            value={advanceTax}
            onChange={(e) => setAdvanceTax(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
          />
        </div>
      </div>

      {/* Comparison Results */}
      {result && (
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
          {/* Recommendation Banner */}
          <div className="p-3.5 rounded-xl bg-[#3D7A64]/10 border border-[#3D7A64]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#3D7A64] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-xs text-[#3D7A64]">
                  Recommended Regime: {result.recommendedRegime === 'NEW_REGIME' ? 'New Tax Regime (115BAC)' : 'Old Tax Regime'}
                </span>
                <p className="text-xs text-[#1E2A38] dark:text-slate-200 mt-0.5">
                  {result.explanation}
                </p>
              </div>
            </div>

            {result.savings > 0 && (
              <div className="text-right shrink-0">
                <span className="text-[11px] text-[#5A6E85]">Taxpayer Savings</span>
                <div className="text-lg font-bold text-[#3D7A64]">
                  ₹{result.savings.toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>

          {/* Side-by-side Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New Regime Card */}
            <div className={`p-4 rounded-xl border ${result.recommendedRegime === 'NEW_REGIME' ? 'border-[#3D7A64] bg-[#3D7A64]/5 ring-1 ring-[#3D7A64]/30' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C131F]'}`}>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-xs text-[#1E2A38] dark:text-white">
                  New Tax Regime (Section 115BAC)
                </span>
                {result.recommendedRegime === 'NEW_REGIME' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3D7A64] text-white">
                    RECOMMENDED
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-[#5A6E85] dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Gross Total Income:</span>
                  <span className="font-medium text-[#1E2A38] dark:text-slate-200">
                    ₹{result.newRegime.summary.grossTotalIncome.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Deduction:</span>
                  <span className="font-medium text-[#3D7A64]">
                    -₹{(result.newRegime.headsOfIncome?.salary?.standardDeduction || 75000).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chapter VI-A Deductions:</span>
                  <span className="font-medium text-slate-400">
                    ₹{result.newRegime.summary.allowedDeductions.toLocaleString('en-IN')} (Not allowed)
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-semibold text-[#1E2A38] dark:text-white">
                  <span>Net Taxable Income:</span>
                  <span>₹{result.newRegime.summary.netTaxableIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#3D7A64]">
                  <span>Rebate u/s 87A:</span>
                  <span>-₹{result.newRegime.summary.rebate87A.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-200 dark:border-slate-800 text-[#1E2A38] dark:text-white">
                  <span>Net Tax & Cess Payable:</span>
                  <span className="text-[#4A6FA5]">
                    ₹{result.newRegime.summary.totalTaxAndCess.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between pt-1 text-xs">
                  <span>Prepaid Tax (TDS / Advance):</span>
                  <span>-₹{result.newRegime.summary.totalPrepaidTaxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>{result.newRegime.summary.balanceTaxPayable > 0 ? 'Balance Tax Due:' : 'Refund Due:'}</span>
                  <span className={result.newRegime.summary.balanceTaxPayable > 0 ? 'text-[#9E4A4A]' : 'text-[#3D7A64]'}>
                    ₹{(result.newRegime.summary.balanceTaxPayable > 0 ? result.newRegime.summary.balanceTaxPayable : result.newRegime.summary.refundDue).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Old Regime Card */}
            <div className={`p-4 rounded-xl border ${result.recommendedRegime === 'OLD_REGIME' ? 'border-[#3D7A64] bg-[#3D7A64]/5 ring-1 ring-[#3D7A64]/30' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C131F]'}`}>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-xs text-[#1E2A38] dark:text-white">
                  Old Tax Regime
                </span>
                {result.recommendedRegime === 'OLD_REGIME' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3D7A64] text-white">
                    RECOMMENDED
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-[#5A6E85] dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Gross Total Income:</span>
                  <span className="font-medium text-[#1E2A38] dark:text-slate-200">
                    ₹{result.oldRegime.summary.grossTotalIncome.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Deduction:</span>
                  <span className="font-medium text-[#3D7A64]">
                    -₹50,000
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chapter VI-A Deductions:</span>
                  <span className="font-medium text-[#3D7A64]">
                    -₹{result.oldRegime.summary.allowedDeductions.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-semibold text-[#1E2A38] dark:text-white">
                  <span>Net Taxable Income:</span>
                  <span>₹{result.oldRegime.summary.netTaxableIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#3D7A64]">
                  <span>Rebate u/s 87A:</span>
                  <span>-₹{result.oldRegime.summary.rebate87A.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-200 dark:border-slate-800 text-[#1E2A38] dark:text-white">
                  <span>Net Tax & Cess Payable:</span>
                  <span className="text-[#4A6FA5]">
                    ₹{result.oldRegime.summary.totalTaxAndCess.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between pt-1 text-xs">
                  <span>Prepaid Tax (TDS / Advance):</span>
                  <span>-₹{result.oldRegime.summary.totalPrepaidTaxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>{result.oldRegime.summary.balanceTaxPayable > 0 ? 'Balance Tax Due:' : 'Refund Due:'}</span>
                  <span className={result.oldRegime.summary.balanceTaxPayable > 0 ? 'text-[#9E4A4A]' : 'text-[#3D7A64]'}>
                    ₹{(result.oldRegime.summary.balanceTaxPayable > 0 ? result.oldRegime.summary.balanceTaxPayable : result.oldRegime.summary.refundDue).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Export CBDT JSON Action */}
          <div className="flex items-center justify-end pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadCbdtJson}
              disabled={isGeneratingJson}
              className="flex items-center gap-1.5 text-xs text-[#4A6FA5] border-[#4A6FA5]/30 hover:bg-[#4A6FA5]/10"
            >
              <Download className="w-3.5 h-3.5" />
              {isGeneratingJson ? 'Generating CBDT Payload...' : 'Download CBDT Official e-Filing JSON'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
