'use client';

import React from 'react';
import { EcommerceSalesSummary } from '@/lib/types/ecommerce.types';
import {
  ShoppingBag,
  TrendingUp,
  RotateCcw,
  Receipt,
  Percent,
  CreditCard,
  Building2,
} from 'lucide-react';

interface SalesSummaryCardsProps {
  summary: EcommerceSalesSummary;
  platformName?: string;
}

const formatCurrency = (val: number = 0) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val);
};

export function SalesSummaryCards({ summary, platformName }: SalesSummaryCardsProps) {
  const safeSummary = summary || ({} as any);
  const totalOrders = Number(safeSummary.totalOrders ?? safeSummary.rowCount ?? 0);
  const grossSales = Number(safeSummary.grossSales ?? safeSummary.totalTaxable ?? 0);
  const returns = Number(safeSummary.returns ?? 0);
  const netTaxableValue = Number(safeSummary.netTaxableValue ?? safeSummary.totalTaxable ?? (grossSales - returns));
  const totalIgst = Number(safeSummary.totalIgst ?? 0);
  const totalCgst = Number(safeSummary.totalCgst ?? 0);
  const totalSgst = Number(safeSummary.totalSgst ?? 0);
  const totalTax = Number(safeSummary.totalTax ?? (totalIgst + totalCgst + totalSgst));
  const totalTcs = Number(safeSummary.totalTcs ?? 0);
  const grandTotal = Number(safeSummary.grandTotal ?? (netTaxableValue + totalTax));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-heading)' }}>
            Sales & Tax Aggregation {platformName && `(${platformName})`}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Consolidated B2C sales, returns, state tax liabilities, and TCS deductions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Orders */}
        <div
          className="p-4 rounded-xl border shadow-sm flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-[#00C2B3] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              {totalOrders.toLocaleString('en-IN')}
            </p>
            <p className="text-xs mt-0.5 text-teal-600 dark:text-teal-400 font-medium">
              Vouchers to Generate
            </p>
          </div>
        </div>

        {/* Gross Sales */}
        <div
          className="p-4 rounded-xl border shadow-sm flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Gross Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              {formatCurrency(grossSales)}
            </p>
            <p className="text-xs mt-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
              Positive Sales Value
            </p>
          </div>
        </div>

        {/* Returns */}
        <div
          className="p-4 rounded-xl border shadow-sm flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Returns / Credit Notes
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-rose-500">
              {formatCurrency(returns)}
            </p>
            <p className="text-xs mt-0.5 text-rose-500/80 font-medium">
              Adjusted in GSTR-1
            </p>
          </div>
        </div>

        {/* Net Taxable Value */}
        <div
          className="p-4 rounded-xl border shadow-sm flex flex-col justify-between"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Net Taxable Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(netTaxableValue)}
            </p>
            <p className="text-xs mt-0.5 text-[var(--color-text-secondary)]">
              Gross - Returns
            </p>
          </div>
        </div>
      </div>

      {/* Tax Breakdown Strip */}
      <div
        className="p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div>
          <span className="text-xs text-[var(--color-text-secondary)] block">IGST (Inter-State)</span>
          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
            {formatCurrency(totalIgst)}
          </p>
        </div>

        <div>
          <span className="text-xs text-[var(--color-text-secondary)] block">CGST (Central)</span>
          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
            {formatCurrency(totalCgst)}
          </p>
        </div>

        <div>
          <span className="text-xs text-[var(--color-text-secondary)] block">SGST (State)</span>
          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
            {formatCurrency(totalSgst)}
          </p>
        </div>

        <div>
          <span className="text-xs text-[var(--color-text-secondary)] block">Total Tax Liability</span>
          <p className="text-sm font-semibold mt-0.5 text-teal-600 dark:text-teal-400">
            {formatCurrency(totalTax)}
          </p>
        </div>

        <div>
          <span className="text-xs text-[var(--color-text-secondary)] block">TCS Deducted</span>
          <p className="text-sm font-semibold mt-0.5 text-amber-600 dark:text-amber-400">
            {formatCurrency(totalTcs)}
          </p>
        </div>

        <div>
          <span className="text-xs text-[var(--color-text-secondary)] block">Invoice Grand Total</span>
          <p className="text-sm font-bold mt-0.5 text-[#00C2B3]">
            {formatCurrency(grandTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
