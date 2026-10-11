'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Calendar,
  AlertCircle,
  IndianRupee,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useCalculateInterestLateFeeMutation } from '@/lib/store/api/gstApi';
import type { GstInterestLateFeeResult } from '@/lib/types/gst.types';

export function GstInterestLateFeeCalculatorCard() {
  const { showToast } = useToast();
  const [returnType, setReturnType] = useState('GSTR-3B');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(20);
    return d.toISOString().slice(0, 10);
  });
  const [filingDate, setFilingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [taxLiability, setTaxLiability] = useState('25000');
  const [annualTurnover, setAnnualTurnover] = useState('10000000'); // 1 Cr
  const [isNilReturn, setIsNilReturn] = useState(false);

  const [calculateLateFee, { isLoading }] = useCalculateInterestLateFeeMutation();
  const [result, setResult] = useState<GstInterestLateFeeResult | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await calculateLateFee({
        returnType,
        dueDate,
        filingDate,
        taxLiability: isNilReturn ? 0 : parseFloat(taxLiability) || 0,
        annualTurnover: parseFloat(annualTurnover) || 0,
        isNilReturn,
      }).unwrap();

      setResult(res.data);
      showToast('Calculated statutory late fee & interest', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to calculate late fee', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Calculator Inputs Card */}
      <div
        className="lg:col-span-5 p-5 rounded-2xl border shadow-xs space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--color-border)]">
          <div className="p-2 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5]">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E2A38] dark:text-slate-100">
              Section 47 & 50 Calculator
            </h3>
            <p className="text-xs text-[#5A6E85]">
              Statutory interest & rationalized late fee computations.
            </p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-3.5">
          {/* Return Type */}
          <div>
            <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-300 mb-1">
              Return Type
            </label>
            <select
              value={returnType}
              onChange={(e) => setReturnType(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
            >
              <option value="GSTR-3B">GSTR-3B (Summary Return)</option>
              <option value="GSTR-1">GSTR-1 (Outward Supplies)</option>
              <option value="GSTR-4">GSTR-4 (Composition Annual)</option>
              <option value="CMP-08">CMP-08 (Composition Statement)</option>
              <option value="GSTR-9">GSTR-9 (Annual Return)</option>
            </select>
          </div>

          {/* Due Date & Filing Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-300 mb-1">
                Prescribed Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-300 mb-1">
                Actual Filing Date
              </label>
              <input
                type="date"
                required
                value={filingDate}
                onChange={(e) => setFilingDate(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
              />
            </div>
          </div>

          {/* NIL Return switch */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            <span className="text-xs font-semibold text-[#1E2A38] dark:text-slate-200">
              Declare as NIL Return?
            </span>
            <input
              type="checkbox"
              checked={isNilReturn}
              onChange={(e) => setIsNilReturn(e.target.checked)}
              className="w-4 h-4 rounded text-[#4A6FA5] accent-[#4A6FA5] cursor-pointer"
            />
          </div>

          {/* Net Cash Tax Liability */}
          {!isNilReturn && (
            <div>
              <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-300 mb-1">
                Net Tax Liability Payable in Cash (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={taxLiability}
                onChange={(e) => setTaxLiability(e.target.value)}
                placeholder="Net cash liability payable"
                className="w-full text-xs p-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
              />
            </div>
          )}

          {/* Turnover Bracket */}
          <div>
            <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-300 mb-1">
              Annual Aggregate Turnover
            </label>
            <select
              value={annualTurnover}
              onChange={(e) => setAnnualTurnover(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
            >
              <option value="10000000">Up to ₹1.5 Crore (Cap: ₹2,000)</option>
              <option value="30000000">Between ₹1.5 Cr and ₹5 Crore (Cap: ₹5,000)</option>
              <option value="100000000">Above ₹5 Crore (Cap: ₹10,000)</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full text-xs py-2.5 bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
          >
            Compute Statutory Liability
          </Button>
        </form>
      </div>

      {/* Results Breakdown Card */}
      <div
        className="lg:col-span-7 p-5 rounded-2xl border shadow-xs space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <h3 className="text-sm font-bold text-[#1E2A38] dark:text-slate-100 flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#4A6FA5]" />
            Calculation Breakdown & Statutory Notice
          </h3>
          {result && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                result.isOverdue
                  ? 'bg-[rgba(158,74,74,0.1)] text-[#9E4A4A]'
                  : 'bg-[rgba(61,122,100,0.1)] text-[#3D7A64]'
              }`}
            >
              {result.delayDays} Days Delay
            </span>
          )}
        </div>

        {result ? (
          <div className="space-y-4">
            {/* Grand Total Highlight */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A6FA5]/10 via-[#4A6FA5]/5 to-transparent border border-[#4A6FA5]/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#5A6E85] font-medium">Grand Total Payable</span>
                <div className="text-2xl font-bold text-[#1E2A38] dark:text-slate-100 mt-0.5">
                  ₹{result.summary.grandTotalPayable.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right text-xs text-[#5A6E85]">
                <div>Net Tax: ₹{result.summary.netTax.toLocaleString('en-IN')}</div>
                <div className="text-[#9E6B42] font-semibold">
                  Penalties: ₹{(result.summary.totalLateFee + result.summary.totalInterest).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Section 47 Late Fee Box */}
            <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1E2A38] dark:text-slate-200">
                  1. Section 47 Late Fee
                </span>
                <span className="text-xs font-bold text-[#9E6B42]">
                  ₹{result.lateFee.total.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-[11px] text-[#5A6E85] flex items-center justify-between">
                <span>Daily rate applied: ₹{result.lateFee.perDayRateTotal}/day</span>
                <span>CGST: ₹{result.lateFee.cgst} · SGST: ₹{result.lateFee.sgst}</span>
              </div>
              {result.lateFee.cappedApplied && (
                <div className="text-[10px] font-semibold text-[#3D7A64] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Statutory rationalized ceiling cap applied (NN 19/2021-CT).
                </div>
              )}
              <div className="text-[10px] text-[#8E9FAA] italic">
                {result.lateFee.statutorySection}
              </div>
            </div>

            {/* Section 50 Interest Box */}
            <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1E2A38] dark:text-slate-200">
                  2. Section 50(1) Interest @ 18% p.a.
                </span>
                <span className="text-xs font-bold text-[#9E4A4A]">
                  ₹{result.interest.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-[11px] text-[#5A6E85] flex items-center justify-between">
                <span>Delayed Period: {result.interest.daysCalculated} days</span>
                <span>Calculated on Net Cash Liability</span>
              </div>
              <div className="text-[10px] text-[#8E9FAA] italic">
                {result.interest.statutorySection}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center space-y-2 text-[#5A6E85]">
            <Calculator className="w-8 h-8 text-[#4A6FA5] mx-auto opacity-70" />
            <p className="text-xs">
              Enter filing dates and net tax liability on the left to compute late fees and interest.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
