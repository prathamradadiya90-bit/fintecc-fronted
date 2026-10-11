'use client';

import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Download,
  CheckCircle2,
  FileCheck,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useComputeTdsTaxMutation,
  useValidateChallanMutation,
  useGenerateNsdlFvuFileMutation,
} from '@/lib/store/api/tdsApi';
import type {
  ComputeTdsResult,
  ValidateChallanResult,
  GenerateFvuResult,
} from '@/lib/types/tds.types';

const TDS_SECTIONS = [
  { value: '194C', label: '194C - Payment to Contractors (1% Indiv / 2% Co)' },
  { value: '194J', label: '194J - Professional (10%) or Technical Services (2%)' },
  { value: '194I_BUILDING', label: '194I - Rent on Land/Building/Furniture (10%)' },
  { value: '194I_PLANT', label: '194I - Rent on Plant & Machinery (2%)' },
  { value: '194H', label: '194H - Commission or Brokerage (5%)' },
  { value: '194A', label: '194A - Interest other than Securities (10%)' },
  { value: '194Q', label: '194Q - Purchase of Goods > ₹50L (0.1%)' },
];

export function TdsEngineFvuCard() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'calculator' | 'challan' | 'fvu'>('calculator');

  // --- Calculator State ---
  const [computeTds, { isLoading: isComputing }] = useComputeTdsTaxMutation();
  const [section, setSection] = useState('194C');
  const [amount, setAmount] = useState<number>(50000);
  const [ytdAmount, setYtdAmount] = useState<number>(80000);
  const [deducteeType, setDeducteeType] = useState<'INDIVIDUAL' | 'COMPANY'>('INDIVIDUAL');
  const [deducteePan, setDeducteePan] = useState('');
  const [hasLowerCert, setHasLowerCert] = useState(false);
  const [certRate, setCertRate] = useState<number>(0.5);
  const [calcResult, setCalcResult] = useState<ComputeTdsResult | null>(null);

  // --- Challan 281 Validator State ---
  const [validateChallan, { isLoading: isValidatingChallan }] = useValidateChallanMutation();
  const [bsrCode, setBsrCode] = useState('0210045');
  const [challanDate, setChallanDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [challanNo, setChallanNo] = useState('00142');
  const [challanAmount, setChallanAmount] = useState<number>(12500);
  const [minorHead, setMinorHead] = useState('200'); // 200 = Normal, 400 = Regular assessment
  const [challanResult, setChallanResult] = useState<ValidateChallanResult | null>(null);

  // --- FVU Generator State ---
  const [generateFvu, { isLoading: isGeneratingFvu }] = useGenerateNsdlFvuFileMutation();
  const [tan, setTan] = useState('MUMB12345C');
  const [pan, setPan] = useState('AABCF1234E');
  const [quarter, setQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q2');
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [formType, setFormType] = useState<'24Q' | '26Q' | '27Q' | '27EQ'>('26Q');

  const handleCalculateTds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await computeTds({
        section,
        transactionAmount: amount,
        cumulativeFinancialYearAmount: ytdAmount,
        deducteeCategory: deducteeType,
        deducteePan: deducteePan.trim() || undefined,
        hasLowerDeductionCert: hasLowerCert,
        certificateRate: hasLowerCert ? certRate : undefined,
      }).unwrap();

      if (res.data) {
        setCalcResult(res.data);
        if (res.data.isHigherRate206AA) {
          showToast('Section 206AA applied: Flat 20% TDS deducted due to invalid/missing PAN', 'info');
        } else {
          showToast('TDS calculated successfully', 'success');
        }
      }
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to compute TDS', 'error');
    }
  };

  const handleValidateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await validateChallan({
        bsrCode: bsrCode.trim(),
        challanDate,
        challanNo: challanNo.trim(),
        amount: challanAmount,
        minorHead,
      }).unwrap();

      if (res.data) {
        setChallanResult(res.data);
        showToast(res.message || 'Challan verified', res.data.isValid ? 'success' : 'error');
      }
    } catch (err: any) {
      showToast(err?.data?.message || 'Validation request failed', 'error');
    }
  };

  const handleGenerateFvu = async () => {
    try {
      const res = await generateFvu({
        tan: tan.trim().toUpperCase(),
        pan: pan.trim().toUpperCase(),
        quarter,
        financialYear,
        formType,
        challans: [
          {
            bsrCode: '0210045',
            challanDate: '2024-09-07',
            challanNo: '00142',
            totalAmount: 12500,
          },
        ],
        deductees: [
          {
            pan: 'AAAPA1234K',
            name: 'Sample Deductee Ltd',
            amountPaid: 125000,
            tdsAmount: 12500,
            dateOfPayment: '2024-09-02',
            section: '194C',
          },
        ],
      }).unwrap();

      if (res.data) {
        const blob = new Blob([res.data.fvuText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.data.fileName || `NSDL_${formType}_${financialYear}_${quarter}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('NSDL e-TDS FVU text file generated & downloaded', 'success');
      }
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to generate FVU file', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-[#1E2A38] dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#4A6FA5]" />
            TDS Statutory Engine & NSDL FVU Generator
          </h3>
          <p className="text-xs text-[#5A6E85] dark:text-slate-400 mt-0.5">
            Instant section rate calculator, Section 206AA non-PAN compliance checks, Challan 281 verification, and FVU file preparation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F7F9FB] dark:bg-[#0C131F] border border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'calculator'
                ? 'bg-[#4A6FA5] text-white shadow-sm'
                : 'text-[#5A6E85] dark:text-slate-400 hover:text-[#1E2A38]'
            }`}
          >
            TDS Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('challan')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'challan'
                ? 'bg-[#4A6FA5] text-white shadow-sm'
                : 'text-[#5A6E85] dark:text-slate-400 hover:text-[#1E2A38]'
            }`}
          >
            Challan 281 Validator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fvu')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'fvu'
                ? 'bg-[#4A6FA5] text-white shadow-sm'
                : 'text-[#5A6E85] dark:text-slate-400 hover:text-[#1E2A38]'
            }`}
          >
            NSDL FVU Generator
          </button>
        </div>
      </div>

      {/* 1. TDS Calculator Tab */}
      {activeTab === 'calculator' && (
        <form onSubmit={handleCalculateTds} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                TDS Statutory Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              >
                {TDS_SECTIONS.map((sec) => (
                  <option key={sec.value} value={sec.value}>
                    {sec.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Bill / Transaction Amount (₹)
              </label>
              <input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Cumulative FY Amount (YTD) (₹)
              </label>
              <input
                type="number"
                min={0}
                value={ytdAmount}
                onChange={(e) => setYtdAmount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Deductee Entity Type
              </label>
              <select
                value={deducteeType}
                onChange={(e) => setDeducteeType(e.target.value as 'INDIVIDUAL' | 'COMPANY')}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              >
                <option value="INDIVIDUAL">Individual / Proprietor / HUF</option>
                <option value="COMPANY">Company / Partnership Firm / LLP</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Deductee PAN (Section 206AA Verification)
              </label>
              <input
                type="text"
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                value={deducteePan}
                onChange={(e) => setDeducteePan(e.target.value.toUpperCase())}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
              <span className="text-[10px] text-[#5A6E85] mt-0.5 block">
                Leave empty or invalid to test 20% Section 206AA higher deduction.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Lower Deduction Certificate u/s 197
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="lowerCert"
                  checked={hasLowerCert}
                  onChange={(e) => setHasLowerCert(e.target.checked)}
                  className="rounded border-slate-300 text-[#4A6FA5] focus:ring-[#4A6FA5]"
                />
                <label htmlFor="lowerCert" className="text-xs cursor-pointer">
                  Has Lower Rate Certificate
                </label>
              </div>
              {hasLowerCert && (
                <input
                  type="number"
                  step="0.01"
                  placeholder="Rate %"
                  value={certRate}
                  onChange={(e) => setCertRate(Number(e.target.value))}
                  className="w-full mt-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F] text-xs"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={isComputing}
              className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white flex items-center gap-1.5 text-xs"
            >
              <Calculator className="w-3.5 h-3.5" />
              {isComputing ? 'Calculating...' : 'Compute TDS Liability'}
            </Button>
          </div>

          {/* Calculator Output */}
          {calcResult && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] space-y-3 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3D7A64]" />
                  <span className="font-semibold text-xs text-[#1E2A38] dark:text-white">
                    TDS Deduction Summary: Section {calcResult.section}
                  </span>
                </div>

                {calcResult.isHigherRate206AA ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#9E4A4A]/10 text-[#9E4A4A] border border-[#9E4A4A]/20">
                    Section 206AA Penalty Rate (20%)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#3D7A64]/10 text-[#3D7A64] border border-[#3D7A64]/20">
                    Compliant PAN on Record
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#5A6E85] text-[11px]">Bill Amount</span>
                  <div className="font-bold text-[#1E2A38] dark:text-white mt-0.5">
                    ₹{calcResult.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span className="text-[#5A6E85] text-[11px]">TDS Rate Applied</span>
                  <div className="font-bold text-[#4A6FA5] mt-0.5">
                    {calcResult.rateApplied}%
                  </div>
                </div>

                <div>
                  <span className="text-[#5A6E85] text-[11px]">TDS to Deduct</span>
                  <div className="font-bold text-base text-[#9E6B42] mt-0.5">
                    ₹{calcResult.tdsAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span className="text-[#5A6E85] text-[11px]">Net Payable to Vendor</span>
                  <div className="font-bold text-base text-[#3D7A64] mt-0.5">
                    ₹{(calcResult.amount - calcResult.tdsAmount).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {calcResult.statutoryNote && (
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 text-[11px] text-[#5A6E85]">
                  <span className="font-semibold text-[#1E2A38] dark:text-slate-200">Statutory Notice: </span>
                  {calcResult.statutoryNote}
                </div>
              )}
            </div>
          )}
        </form>
      )}

      {/* 2. Challan 281 Validator Tab */}
      {activeTab === 'challan' && (
        <form onSubmit={handleValidateChallan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                BSR Code (7 Digits)
              </label>
              <input
                type="text"
                required
                maxLength={7}
                value={bsrCode}
                onChange={(e) => setBsrCode(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Tender Date
              </label>
              <input
                type="date"
                required
                value={challanDate}
                onChange={(e) => setChallanDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Challan Serial Number (5 Digits)
              </label>
              <input
                type="text"
                required
                maxLength={5}
                value={challanNo}
                onChange={(e) => setChallanNo(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Challan Amount Deposited (₹)
              </label>
              <input
                type="number"
                required
                min={1}
                value={challanAmount}
                onChange={(e) => setChallanAmount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Minor Head
              </label>
              <select
                value={minorHead}
                onChange={(e) => setMinorHead(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              >
                <option value="200">200 - TDS / TCS Payable by Taxpayer (Normal)</option>
                <option value="400">400 - TDS / TCS Regular Assessment (Demand)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={isValidatingChallan}
              className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white flex items-center gap-1.5 text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isValidatingChallan ? 'Verifying...' : 'Validate Challan 281'}
            </Button>
          </div>

          {challanResult && (
            <div className={`p-4 rounded-xl border ${challanResult.isValid ? 'bg-[#3D7A64]/5 border-[#3D7A64]/30' : 'bg-[#9E4A4A]/5 border-[#9E4A4A]/30'} space-y-2 animate-fadeIn text-xs`}>
              <div className="flex items-center gap-2">
                {challanResult.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-[#3D7A64]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#9E4A4A]" />
                )}
                <span className="font-semibold text-[#1E2A38] dark:text-white">
                  {challanResult.isValid ? 'Challan 281 Verified & Ready for Return Mapping' : 'Challan Validation Failed'}
                </span>
              </div>

              {challanResult.cin && (
                <div className="p-2 rounded bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                  Generated CIN: <span className="font-bold text-[#4A6FA5]">{challanResult.cin}</span>
                </div>
              )}

              {challanResult.errors && challanResult.errors.length > 0 && (
                <ul className="list-disc pl-5 text-[11px] text-[#9E4A4A] space-y-0.5">
                  {challanResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </form>
      )}

      {/* 3. NSDL FVU Generator Tab */}
      {activeTab === 'fvu' && (
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 flex items-start gap-3">
            <FileText className="w-5 h-5 text-[#4A6FA5] shrink-0 mt-0.5" />
            <div className="text-xs text-[#5A6E85] dark:text-slate-300 leading-relaxed">
              Generate standardized official NSDL FVU raw text files adhering to CBDT e-TDS File Validation Utility format specifications for quarterly returns.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Deductor TAN
              </label>
              <input
                type="text"
                maxLength={10}
                value={tan}
                onChange={(e) => setTan(e.target.value.toUpperCase())}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Deductor PAN
              </label>
              <input
                type="text"
                maxLength={10}
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Return Form Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
              >
                <option value="26Q">Form 26Q (Non-Salary Resident)</option>
                <option value="24Q">Form 24Q (Salary TDS)</option>
                <option value="27Q">Form 27Q (Non-Resident Payments)</option>
                <option value="27EQ">Form 27EQ (TCS Collection)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6E85] dark:text-slate-400 mb-1">
                Quarter & Financial Year
              </label>
              <div className="flex gap-2">
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value as any)}
                  className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
                >
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0C131F]"
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              type="button"
              size="sm"
              disabled={isGeneratingFvu}
              onClick={handleGenerateFvu}
              className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white flex items-center gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              {isGeneratingFvu ? 'Generating FVU...' : `Generate NSDL ${formType} FVU Text File`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
