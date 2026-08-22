'use client';

import React, { useState } from 'react';
import { EcommercePlatform, ProcessReportResponse } from '@/lib/types/ecommerce.types';
import { useProcessReportMutation } from '@/lib/store/api/ecommerceApi';
import { PlatformSelector } from '@/features/ecommerce/components/PlatformSelector';
import { ReportUploader } from '@/features/ecommerce/components/ReportUploader';
import { SalesSummaryCards } from '@/features/ecommerce/components/SalesSummaryCards';
import { SalesTable } from '@/features/ecommerce/components/SalesTable';
import { EcommerceActions } from '@/features/ecommerce/components/EcommerceActions';
import { ShoppingBag, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function EcommercePage() {
  const [selectedPlatform, setSelectedPlatform] = useState<EcommercePlatform | 'AUTO' | null>('AUTO');
  const [reportData, setReportData] = useState<ProcessReportResponse['data'] | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [processReport, { isLoading }] = useProcessReportMutation();

  const handleFileSelect = async (file: File) => {
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedPlatform && selectedPlatform !== 'AUTO') {
        formData.append('platform', selectedPlatform);
      }

      const response = await processReport(formData).unwrap();
      setReportData(response.data);
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
