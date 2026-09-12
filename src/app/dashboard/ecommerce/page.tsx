'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EcommercePlatform, EcommerceSalesSummary, ProcessReportResponse, StandardizedSaleItem } from '@/lib/types/ecommerce.types';
import { useProcessReportMutation, useLazyGetReportQuery } from '@/lib/store/api/ecommerceApi';
import { PlatformSelector } from '@/features/ecommerce/components/PlatformSelector';
import { ReportUploader } from '@/features/ecommerce/components/ReportUploader';
import { SalesSummaryCards } from '@/features/ecommerce/components/SalesSummaryCards';
import { SalesTable } from '@/features/ecommerce/components/SalesTable';
import { EcommerceActions } from '@/features/ecommerce/components/EcommerceActions';
import { ShoppingBag, Sparkles, ShieldCheck, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function EcommercePage() {
  const [selectedPlatform, setSelectedPlatform] = useState<EcommercePlatform | 'AUTO' | null>('AUTO');
  const [reportData, setReportData] = useState<ProcessReportResponse['data'] | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [processReport, { isLoading: isUploading }] = useProcessReportMutation();
  const [getReportTrigger, { isLoading: isFetchingReport }] = useLazyGetReportQuery();
  const isLoading = isUploading || isFetchingReport;

  const handleFileSelect = async (file: File) => {
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedPlatform && selectedPlatform !== 'AUTO') {
        formData.append('platform', selectedPlatform);
      }

      const response = await processReport(formData).unwrap();
      const rawData = (response?.data || response) as any;
      const reportId = rawData?.reportId || rawData?.id;

      let sales: StandardizedSaleItem[] = rawData?.sales || [];
      let platform = rawData?.platform || rawData?.summary?.platform || (selectedPlatform !== 'AUTO' && selectedPlatform ? selectedPlatform : 'Ecommerce');

      if (reportId && (!sales || sales.length === 0)) {
        try {
          const reportRes = await getReportTrigger(reportId).unwrap();
          const report = reportRes?.data;
          if (report) {
            if (report.platform) platform = report.platform;
            if (report.lineItems && report.lineItems.length > 0) {
              sales = report.lineItems.map((item: any) => ({
                orderId: item.orderId,
                orderDate: item.invoiceDate,
                sku: item.sku,
                quantity: item.quantity || 1,
                taxableValue: Number(item.taxableValue || 0),
                cgst: Number(item.cgst || 0),
                sgst: Number(item.sgst || 0),
                igst: Number(item.igst || 0),
                gstRate: Number(item.taxRate || 0),
                state: item.buyerState,
                pos: item.buyerState,
                tcs: Number(item.tcsAmount || 0),
                tcsAmount: Number(item.tcsAmount || 0),
                customerGst: item.gstin,
                invoiceNumber: item.orderId,
                transactionType: Number(item.taxableValue || 0) < 0 ? 'RETURN' : 'SALE',
              }));
            }
          }
        } catch (detailErr) {
          console.warn('Failed to fetch detailed report line items:', detailErr);
        }
      }

      const rawSummary = rawData?.summary || {};
      const totalOrders = sales.length || Number(rawSummary.rowCount || rawSummary.totalOrders || 0);
      const grossSales = sales.length > 0
        ? sales.filter((s) => (s.taxableValue || 0) > 0).reduce((acc, s) => acc + (s.taxableValue || 0), 0)
        : Number(rawSummary.totalTaxable || rawSummary.grossSales || 0);
      const returns = sales.length > 0
        ? Math.abs(sales.filter((s) => (s.taxableValue || 0) < 0).reduce((acc, s) => acc + (s.taxableValue || 0), 0))
        : Number(rawSummary.returns || 0);
      const netTaxableValue = grossSales - returns;
      const totalIgst = sales.length > 0
        ? sales.reduce((acc, s) => acc + (s.igst || 0), 0)
        : Number(rawSummary.totalIgst || 0);
      const totalCgst = sales.length > 0
        ? sales.reduce((acc, s) => acc + (s.cgst || 0), 0)
        : Number(rawSummary.totalCgst || 0);
      const totalSgst = sales.length > 0
        ? sales.reduce((acc, s) => acc + (s.sgst || 0), 0)
        : Number(rawSummary.totalSgst || 0);
      const totalTax = totalIgst + totalCgst + totalSgst;
      const totalTcs = sales.reduce((acc, s) => acc + (s.tcs || s.tcsAmount || 0), 0) || Number(rawSummary.totalTcs || 0);
      const grandTotal = netTaxableValue + totalTax;

      const normalizedSummary: EcommerceSalesSummary = {
        totalOrders,
        grossSales,
        returns,
        netTaxableValue,
        totalIgst,
        totalCgst,
        totalSgst,
        totalTax,
        totalTcs,
        grandTotal,
      };

      setReportData({
        platform,
        totalCount: totalOrders,
        summary: normalizedSummary,
        sales,
        reportId,
      });
    } catch (error: any) {
      console.error('Failed to parse e-commerce report:', error);
      setUploadError(
        error?.data?.message || 'Failed to process report. Please check the file format.'
      );
    }
  };

  const handleReset = () => {
    setReportData(null);
    setUploadError(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
              E-Commerce Sales & GSTR-1 Automation
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-semibold bg-[#00C2B3]/10 text-[#00C2B3]">
              11 Platforms
            </span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Parse multi-marketplace settlement reports, auto-calculate B2C state taxes, and push vouchers directly to Tally Prime.
          </p>
        </div>

        {reportData && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Switch Report
          </Button>
        )}
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-xl border bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900 text-xs font-medium">
          {uploadError}
        </div>
      )}

      {/* Upload Flow */}
      {!reportData ? (
        <div className="space-y-6">
          <PlatformSelector
            selectedPlatform={selectedPlatform}
            onSelectPlatform={(p) => setSelectedPlatform(p)}
          />

          <ReportUploader
            onFileSelect={handleFileSelect}
            isLoading={isLoading}
          />
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6 animate-fadeIn">
          {reportData.reportId && (
            <div
              className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00C2B3] animate-pulse" />
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  Report saved as <strong style={{ color: 'var(--color-text-primary)' }}>#{reportData.reportId.slice(0, 8)}</strong> ({reportData.totalCount} records parsed).
                </span>
              </div>
              <Link
                href={`/dashboard/ecommerce/${reportData.reportId}`}
                className="inline-flex items-center gap-1.5 font-semibold text-[#00C2B3] hover:underline shrink-0"
              >
                Open TCS & Reconciliation Workspace <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <EcommerceActions
            sales={reportData.sales}
            platformName={reportData.platform}
            onReset={handleReset}
          />

          <SalesSummaryCards
            summary={reportData.summary}
            platformName={reportData.platform}
          />

          <SalesTable sales={reportData.sales} />
        </div>
      )}
    </div>
  );
}
