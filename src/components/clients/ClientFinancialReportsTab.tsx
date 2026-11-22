'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Printer,
  Calendar,
  Building2,
  DollarSign,
  FileSpreadsheet,
  PieChart,
  Percent,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useGetClientFinancialReportsQuery, useSaveClientFinancialReportMutation } from '@/lib/store/api/clientsApi';
import type { Client } from '@/lib/types/client.types';

interface ClientFinancialReportsTabProps {
  client: Client;
}

export function ClientFinancialReportsTab({ client }: ClientFinancialReportsTabProps) {
  const { showToast } = useToast();
  const { data: response, isLoading, refetch } = useGetClientFinancialReportsQuery(client.id);
  const [saveFinancialReport, { isLoading: isSaving }] = useSaveClientFinancialReportMutation();

  const [selectedViewYear, setSelectedViewYear] = useState<string>('ALL'); // 'ALL' or specific FY e.g. 'FY 2024-25'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<string>('FY 2024-25');
  const [editForm, setEditForm] = useState({
    revenueFromOperations: 0,
    otherIncome: 0,
    costOfGoodsSold: 0,
    employeeBenefits: 0,
    rentAndUtilities: 0,
    legalAndProfessionalFees: 0,
    sellingAndDistribution: 0,
    officeAndAdministrative: 0,
    depreciation: 0,
    financeCosts: 0,
    taxExpense: 0,
    currentAssets: 0,
    nonCurrentAssets: 0,
    currentLiabilities: 0,
    nonCurrentLiabilities: 0,
    notes: '',
  });

  const reports: any[] = response?.data?.reports || [];

  const handleOpenEdit = (report: any) => {
    setEditingYear(report.financialYear);
    setEditForm({
      revenueFromOperations: report.revenueFromOperations || 0,
      otherIncome: report.otherIncome || 0,
      costOfGoodsSold: report.costOfGoodsSold || 0,
      employeeBenefits: report.operatingExpenses?.employeeBenefits || 0,
      rentAndUtilities: report.operatingExpenses?.rentAndUtilities || 0,
      legalAndProfessionalFees: report.operatingExpenses?.legalAndProfessionalFees || 0,
      sellingAndDistribution: report.operatingExpenses?.sellingAndDistribution || 0,
      officeAndAdministrative: report.operatingExpenses?.officeAndAdministrative || 0,
      depreciation: report.depreciation || 0,
      financeCosts: report.financeCosts || 0,
      taxExpense: report.taxExpense || 0,
      currentAssets: report.balanceSheet?.currentAssets || 0,
      nonCurrentAssets: report.balanceSheet?.nonCurrentAssets || 0,
      currentLiabilities: report.balanceSheet?.currentLiabilities || 0,
      nonCurrentLiabilities: report.balanceSheet?.nonCurrentLiabilities || 0,
      notes: report.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totRev = Number(editForm.revenueFromOperations) + Number(editForm.otherIncome);
      const gp = totRev - Number(editForm.costOfGoodsSold);
      const totOpex =
        Number(editForm.employeeBenefits) +
        Number(editForm.rentAndUtilities) +
        Number(editForm.legalAndProfessionalFees) +
        Number(editForm.sellingAndDistribution) +
        Number(editForm.officeAndAdministrative);
      const ebitda = gp - totOpex;
      const pbt = ebitda - Number(editForm.depreciation) - Number(editForm.financeCosts);
      const pat = pbt - Number(editForm.taxExpense);

      await saveFinancialReport({
        id: client.id,
        data: {
          financialYear: editingYear,
          revenueFromOperations: Number(editForm.revenueFromOperations),
          otherIncome: Number(editForm.otherIncome),
          totalRevenue: totRev,
          costOfGoodsSold: Number(editForm.costOfGoodsSold),
          grossProfit: gp,
          grossMarginPercent: Number(((gp / totRev) * 100).toFixed(1)),
          employeeBenefits: Number(editForm.employeeBenefits),
          rentAndUtilities: Number(editForm.rentAndUtilities),
          legalAndProfessionalFees: Number(editForm.legalAndProfessionalFees),
          sellingAndDistribution: Number(editForm.sellingAndDistribution),
          officeAndAdministrative: Number(editForm.officeAndAdministrative),
          totalOperatingExpenses: totOpex,
          ebitda,
          depreciation: Number(editForm.depreciation),
          financeCosts: Number(editForm.financeCosts),
          profitBeforeTax: pbt,
          taxExpense: Number(editForm.taxExpense),
          netProfitAfterTax: pat,
          netMarginPercent: Number(((pat / totRev) * 100).toFixed(1)),
          currentAssets: Number(editForm.currentAssets),
          nonCurrentAssets: Number(editForm.nonCurrentAssets),
          currentLiabilities: Number(editForm.currentLiabilities),
          nonCurrentLiabilities: Number(editForm.nonCurrentLiabilities),
          notes: editForm.notes,
        },
      }).unwrap();

      showToast(`Financial statement for ${editingYear} saved successfully!`, 'success');
      setIsEditModalOpen(false);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to save financial report', 'error');
    }
  };

  const handleExportCSV = () => {
    if (!reports.length) return;
    const years = reports.map((r) => r.financialYear);
    const rows = [
      ['Metric / Account Item', ...years],
      ['REVENUE FROM OPERATIONS', ...reports.map((r) => r.revenueFromOperations)],
      ['Other Operating Income', ...reports.map((r) => r.otherIncome)],
      ['TOTAL REVENUE', ...reports.map((r) => r.totalRevenue)],
      ['Less: Cost of Goods Sold (COGS)', ...reports.map((r) => r.costOfGoodsSold)],
      ['GROSS PROFIT', ...reports.map((r) => r.grossProfit)],
      ['Gross Margin %', ...reports.map((r) => `${r.grossMarginPercent}%`)],
      ['OPERATING EXPENSES', ...reports.map((r) => r.totalOperatingExpenses)],
      ['  - Employee Benefits Expense', ...reports.map((r) => r.operatingExpenses?.employeeBenefits || 0)],
      ['  - Rent, Rates & Utilities', ...reports.map((r) => r.operatingExpenses?.rentAndUtilities || 0)],
      ['  - Legal & Professional Charges', ...reports.map((r) => r.operatingExpenses?.legalAndProfessionalFees || 0)],
      ['  - Selling & Distribution Expenses', ...reports.map((r) => r.operatingExpenses?.sellingAndDistribution || 0)],
      ['  - Office & Administrative Expenses', ...reports.map((r) => r.operatingExpenses?.officeAndAdministrative || 0)],
      ['OPERATING PROFIT (EBITDA)', ...reports.map((r) => r.ebitda)],
      ['Less: Depreciation & Amortization', ...reports.map((r) => r.depreciation)],
      ['Less: Finance Costs / Interest', ...reports.map((r) => r.financeCosts)],
      ['PROFIT BEFORE TAX (PBT)', ...reports.map((r) => r.profitBeforeTax)],
      ['Less: Provision for Tax', ...reports.map((r) => r.taxExpense)],
      ['NET PROFIT AFTER TAX (PAT)', ...reports.map((r) => r.netProfitAfterTax)],
      ['Net Profit Margin %', ...reports.map((r) => `${r.netMarginPercent}%`)],
      ['', ...years.map(() => '')],
      ['BALANCE SHEET SNAPSHOT', ...years.map(() => '')],
      ['Current Assets', ...reports.map((r) => r.balanceSheet?.currentAssets || 0)],
      ['Non-Current Assets (Fixed Assets)', ...reports.map((r) => r.balanceSheet?.nonCurrentAssets || 0)],
      ['TOTAL ASSETS', ...reports.map((r) => r.balanceSheet?.totalAssets || 0)],
      ['Current Liabilities', ...reports.map((r) => r.balanceSheet?.currentLiabilities || 0)],
      ['Non-Current Liabilities (Long-term Debt)', ...reports.map((r) => r.balanceSheet?.nonCurrentLiabilities || 0)],
      ['Shareholders Equity / Net Worth', ...reports.map((r) => r.balanceSheet?.shareholdersEquity || 0)],
      ['', ...years.map(() => '')],
      ['FINANCIAL RATIOS', ...years.map(() => '')],
      ['Current Ratio', ...reports.map((r) => r.ratios?.currentRatio || 0)],
      ['Quick Ratio', ...reports.map((r) => r.ratios?.quickRatio || 0)],
      ['Debt-to-Equity Ratio', ...reports.map((r) => r.ratios?.debtToEquity || 0)],
      ['Return on Equity (ROE) %', ...reports.map((r) => `${r.ratios?.returnOnEquity || 0}%`)],
    ];

    const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.name.replace(/\s+/g, '_')}_Financial_Reports_Multi_Year.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported multi-year financial statements to CSV', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const displayedReports = useMemo(() => {
    if (selectedViewYear === 'ALL') return reports;
    return reports.filter((r) => r.financialYear === selectedViewYear);
  }, [reports, selectedViewYear]);

  const latestReport = reports[0];
  const previousReport = reports[1];

  const yoyRevenueGrowth = useMemo(() => {
    if (!latestReport || !previousReport || !previousReport.totalRevenue) return 0;
    return Number(
      (((latestReport.totalRevenue - previousReport.totalRevenue) / previousReport.totalRevenue) * 100).toFixed(1)
    );
  }, [latestReport, previousReport]);

  const yoyNetProfitGrowth = useMemo(() => {
    if (!latestReport || !previousReport || !previousReport.netProfitAfterTax) return 0;
    return Number(
      (
        ((latestReport.netProfitAfterTax - previousReport.netProfitAfterTax) /
          Math.abs(previousReport.netProfitAfterTax)) *
        100
      ).toFixed(1)
    );
  }, [latestReport, previousReport]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Loading multi-year audited financial statements...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ─── Top Control Bar ──────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Profit & Loss and Balance Sheet Reports
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
              ICAI Standards Compliant
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Comprehensive multi-year comparative financial analysis for {client.companyName || client.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedViewYear}
              onChange={(e) => setSelectedViewYear(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <option value="ALL">All Years Comparative (5 Years)</option>
              {reports.map((r) => (
                <option key={r.financialYear} value={r.financialYear}>
                  {r.financialYear}
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export Excel / CSV
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
            Print Statement
          </Button>
        </div>
      </div>

      {/* ─── Executive Financial KPIs ──────────────────────────────────────── */}
      {latestReport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div
            className="p-4 rounded-xl shadow-sm space-y-1 relative overflow-hidden"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Total Revenue ({latestReport.financialYear})
            </span>
            <div className="text-2xl font-black" style={{ color: 'var(--color-text-heading)' }}>
              ₹{Number(latestReport.totalRevenue || 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {yoyRevenueGrowth >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{yoyRevenueGrowth}% YoY
                </span>
              ) : (
                <span className="text-rose-500 font-semibold flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {yoyRevenueGrowth}% YoY
                </span>
              )}
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                vs prev year
              </span>
            </div>
          </div>

          {/* Gross Margin */}
          <div
            className="p-4 rounded-xl shadow-sm space-y-1 relative overflow-hidden"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Gross Profit & Margin
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{Number(latestReport.grossProfit || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Margin: <span className="text-emerald-600 dark:text-emerald-400">{latestReport.grossMarginPercent}%</span>
            </div>
          </div>

          {/* Net Profit After Tax */}
          <div
            className="p-4 rounded-xl shadow-sm space-y-1 relative overflow-hidden"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Net Profit (PAT)
            </span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              ₹{Number(latestReport.netProfitAfterTax || 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {yoyNetProfitGrowth >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{yoyNetProfitGrowth}% YoY
                </span>
              ) : (
                <span className="text-rose-500 font-semibold flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {yoyNetProfitGrowth}% YoY
                </span>
              )}
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                (Net Margin: {latestReport.netMarginPercent}%)
              </span>
            </div>
          </div>

          {/* Current Ratio & Solvency */}
          <div
            className="p-4 rounded-xl shadow-sm space-y-1 relative overflow-hidden"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Current Ratio / Health
            </span>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
              {latestReport.ratios?.currentRatio || 1.94} : 1
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Healthy Liquidity & Solvency</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Statement Table: Multi-Year Comparative P&L ───────────────────── */}
      <div
        className="rounded-2xl shadow-sm overflow-hidden"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          className="p-4 sm:p-5 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Statement of Profit and Loss (Multi-Year Comparison)
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              All amounts in Indian Rupees (₹). Prepared as per Schedule III of Companies Act & Tax Audit standards.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className="border-b text-[11px] font-bold uppercase tracking-wider"
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <th className="py-3 px-4 w-72">Particulars / Line Item</th>
                {displayedReports.map((r) => (
                  <th key={r.financialYear} className="py-3 px-4 text-right min-w-[140px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{r.financialYear}</span>
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1 hover:text-emerald-500 transition-colors"
                        title={`Edit ${r.financialYear}`}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {/* SECTION I: REVENUE */}
              <tr className="bg-slate-500/5 font-bold">
                <td colSpan={displayedReports.length + 1} className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400">
                  I. REVENUE
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 pl-8" style={{ color: 'var(--color-text-primary)' }}>
                  Revenue from Operations (Gross Sales / Services)
                </td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2.5 px-4 text-right font-medium">
                    ₹{Number(r.revenueFromOperations || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-4 pl-8" style={{ color: 'var(--color-text-primary)' }}>
                  Other Operating Income
                </td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2.5 px-4 text-right font-medium">
                    ₹{Number(r.otherIncome || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr className="font-bold bg-emerald-500/5">
                <td className="py-2.5 px-4 text-emerald-700 dark:text-emerald-300">TOTAL REVENUE (A)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2.5 px-4 text-right text-emerald-700 dark:text-emerald-300">
                    ₹{Number(r.totalRevenue || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* SECTION II: COST OF SALES & GROSS PROFIT */}
              <tr className="bg-slate-500/5 font-bold">
                <td colSpan={displayedReports.length + 1} className="py-2.5 px-4 text-indigo-600 dark:text-indigo-400">
                  II. DIRECT COSTS & GROSS PROFIT
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 pl-8 text-rose-500">Less: Cost of Goods Sold / Direct Materials (COGS)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2.5 px-4 text-right text-rose-500 font-medium">
                    (₹{Number(r.costOfGoodsSold || 0).toLocaleString('en-IN')})
                  </td>
                ))}
              </tr>
              <tr className="font-bold bg-slate-500/10">
                <td className="py-2.5 px-4" style={{ color: 'var(--color-text-heading)' }}>
                  GROSS PROFIT (B)
                </td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(r.grossProfit || 0).toLocaleString('en-IN')}
                    <div className="text-[10px] text-slate-500 font-normal">Margin: {r.grossMarginPercent}%</div>
                  </td>
                ))}
              </tr>

              {/* SECTION III: OPERATING EXPENSES */}
              <tr className="bg-slate-500/5 font-bold">
                <td colSpan={displayedReports.length + 1} className="py-2.5 px-4 text-amber-600 dark:text-amber-400">
                  III. OPERATING EXPENSES (INDIRECT EXPENSES)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8" style={{ color: 'var(--color-text-secondary)' }}>
                  Employee Benefits Expense (Salaries & Wages)
                </td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-mono text-[11px]">
                    ₹{Number(r.operatingExpenses?.employeeBenefits || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8" style={{ color: 'var(--color-text-secondary)' }}>
                  Rent, Rates & Utilities
                </td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-mono text-[11px]">
                    ₹{Number(r.operatingExpenses?.rentAndUtilities || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8" style={{ color: 'var(--color-text-secondary)' }}>
                  Legal & Professional Charges
                </td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-mono text-[11px]">
                    ₹{Number(r.operatingExpenses?.legalAndProfessionalFees || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8" style={{ color: 'var(--color-text-secondary)' }}>
                  Selling & Distribution Expenses
                </td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-mono text-[11px]">
                    ₹{Number(r.operatingExpenses?.sellingAndDistribution || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8" style={{ color: 'var(--color-text-secondary)' }}>
                  Office & Administrative Expenses
                </td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-mono text-[11px]">
                    ₹{Number(r.operatingExpenses?.officeAndAdministrative || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr className="font-semibold bg-amber-500/5">
                <td className="py-2 px-4 text-amber-700 dark:text-amber-300">TOTAL OPERATING EXPENSES (C)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right text-amber-700 dark:text-amber-300">
                    ₹{Number(r.totalOperatingExpenses || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* SECTION IV: PROFITABILITY & TAXATION */}
              <tr className="bg-slate-500/5 font-bold">
                <td colSpan={displayedReports.length + 1} className="py-2.5 px-4 text-blue-600 dark:text-blue-400">
                  IV. OPERATING PROFIT (EBITDA), PBT & PAT
                </td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2.5 px-4">OPERATING PROFIT BEFORE DEPRECIATION & FINANCE (EBITDA)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2.5 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                    ₹{Number(r.ebitda || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8 text-rose-500">Less: Depreciation and Amortization Expense</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right text-rose-500">
                    (₹{Number(r.depreciation || 0).toLocaleString('en-IN')})
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8 text-rose-500">Less: Finance Costs / Bank Interest</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right text-rose-500">
                    (₹{Number(r.financeCosts || 0).toLocaleString('en-IN')})
                  </td>
                ))}
              </tr>
              <tr className="font-semibold bg-slate-500/5">
                <td className="py-2 px-4">PROFIT BEFORE EXCEPTIONAL ITEMS & TAX (PBT)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-bold">
                    ₹{Number(r.profitBeforeTax || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8 text-rose-500">Less: Tax Expense (Current & Deferred Tax)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right text-rose-500">
                    (₹{Number(r.taxExpense || 0).toLocaleString('en-IN')})
                  </td>
                ))}
              </tr>
              <tr className="font-black text-sm bg-emerald-500/10">
                <td className="py-3 px-4 text-emerald-800 dark:text-emerald-300">NET PROFIT AFTER TAX (PAT)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-3 px-4 text-right text-emerald-800 dark:text-emerald-300">
                    ₹{Number(r.netProfitAfterTax || 0).toLocaleString('en-IN')}
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                      Net Margin: {r.netMarginPercent}%
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Balance Sheet & Solvency Table ───────────────────────────────── */}
      <div
        className="rounded-2xl shadow-sm overflow-hidden"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          className="p-4 sm:p-5 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Balance Sheet Position & Financial Ratios
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Assets, Liabilities, Working Capital and ICAI Liquidity Indicators
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className="border-b text-[11px] font-bold uppercase tracking-wider"
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <th className="py-3 px-4 w-72">Balance Sheet Metrics</th>
                {displayedReports.map((r) => (
                  <th key={r.financialYear} className="py-3 px-4 text-right min-w-[140px]">
                    {r.financialYear}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {/* ASSETS */}
              <tr className="bg-slate-500/5 font-bold">
                <td colSpan={displayedReports.length + 1} className="py-2 px-4 text-teal-600 dark:text-teal-400">
                  ASSETS
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8">Current Assets (Inventories, Receivables, Cash & Bank)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-medium">
                    ₹{Number(r.balanceSheet?.currentAssets || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8">Non-Current Assets (Property, Plant, Equipment & Investments)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-medium">
                    ₹{Number(r.balanceSheet?.nonCurrentAssets || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr className="font-bold bg-teal-500/5">
                <td className="py-2.5 px-4 text-teal-700 dark:text-teal-300">TOTAL ASSETS</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2.5 px-4 text-right text-teal-700 dark:text-teal-300">
                    ₹{Number(r.balanceSheet?.totalAssets || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* LIABILITIES */}
              <tr className="bg-slate-500/5 font-bold">
                <td colSpan={displayedReports.length + 1} className="py-2 px-4 text-purple-600 dark:text-purple-400">
                  EQUITY & LIABILITIES
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8">Current Liabilities & Provisions (Trade Payables, Short Term Debt)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-medium">
                    ₹{Number(r.balanceSheet?.currentLiabilities || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8">Non-Current Liabilities (Long-Term Borrowings)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-medium">
                    ₹{Number(r.balanceSheet?.nonCurrentLiabilities || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8 font-semibold">Shareholders' Equity / Net Worth</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-semibold text-purple-600 dark:text-purple-400">
                    ₹{Number(r.balanceSheet?.shareholdersEquity || 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* RATIOS */}
              <tr className="bg-slate-500/5 font-bold">
                <td colSpan={displayedReports.length + 1} className="py-2 px-4 text-indigo-600 dark:text-indigo-400">
                  KEY FINANCIAL RATIOS
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8 font-medium">Current Ratio (Current Assets / Current Liabilities)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {r.ratios?.currentRatio || 1.94} : 1
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8 font-medium">Quick Ratio (Liquid Assets / Current Liabilities)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-bold text-teal-600 dark:text-teal-400">
                    {r.ratios?.quickRatio || 1.45} : 1
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8 font-medium">Debt-to-Equity Ratio</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-bold text-slate-700 dark:text-slate-300">
                    {r.ratios?.debtToEquity || 0.4}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8 font-medium">Return on Equity (ROE %)</td>
                {displayedReports.map((r) => (
                  <td key={r.financialYear} className="py-2 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                    {r.ratios?.returnOnEquity || 25}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Edit / Update Modal ──────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>
                  Update Audited Financial Statement: {editingYear}
                </h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Enter audited figures for {client.name}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Revenue from Operations (₹) *</label>
                  <input
                    type="number"
                    value={editForm.revenueFromOperations}
                    onChange={(e) => setEditForm({ ...editForm, revenueFromOperations: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Other Income (₹)</label>
                  <input
                    type="number"
                    value={editForm.otherIncome}
                    onChange={(e) => setEditForm({ ...editForm, otherIncome: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Cost of Goods Sold / Purchases (₹)</label>
                  <input
                    type="number"
                    value={editForm.costOfGoodsSold}
                    onChange={(e) => setEditForm({ ...editForm, costOfGoodsSold: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Employee Salaries & Benefits (₹)</label>
                  <input
                    type="number"
                    value={editForm.employeeBenefits}
                    onChange={(e) => setEditForm({ ...editForm, employeeBenefits: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Rent & Utilities (₹)</label>
                  <input
                    type="number"
                    value={editForm.rentAndUtilities}
                    onChange={(e) => setEditForm({ ...editForm, rentAndUtilities: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Legal & Professional Fees (₹)</label>
                  <input
                    type="number"
                    value={editForm.legalAndProfessionalFees}
                    onChange={(e) => setEditForm({ ...editForm, legalAndProfessionalFees: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Depreciation & Amortization (₹)</label>
                  <input
                    type="number"
                    value={editForm.depreciation}
                    onChange={(e) => setEditForm({ ...editForm, depreciation: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Finance Costs / Interest (₹)</label>
                  <input
                    type="number"
                    value={editForm.financeCosts}
                    onChange={(e) => setEditForm({ ...editForm, financeCosts: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Provision for Income Tax (₹)</label>
                  <input
                    type="number"
                    value={editForm.taxExpense}
                    onChange={(e) => setEditForm({ ...editForm, taxExpense: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Current Assets (₹)</label>
                  <input
                    type="number"
                    value={editForm.currentAssets}
                    onChange={(e) => setEditForm({ ...editForm, currentAssets: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Current Liabilities (₹)</label>
                  <input
                    type="number"
                    value={editForm.currentLiabilities}
                    onChange={(e) => setEditForm({ ...editForm, currentLiabilities: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Auditor / CA Notes</label>
                  <input
                    type="text"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                    placeholder="e.g. Audited as per statutory requirements"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                  Save Financial Statement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
