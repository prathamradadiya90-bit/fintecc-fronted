'use client';

import React, { useState } from 'react';
import { StandardizedSaleItem } from '@/lib/types/ecommerce.types';
import {
  useGenerateGstr1Mutation,
  useSyncToTallyMutation,
} from '@/lib/store/api/ecommerceApi';
import { Button } from '@/components/ui/Button';
import {
  FileCode,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

interface EcommerceActionsProps {
  sales: StandardizedSaleItem[];
  platformName?: string;
  onReset: () => void;
}

export function EcommerceActions({
  sales,
  platformName = 'Ecommerce',
  onReset,
}: EcommerceActionsProps) {
  const [generateGstr1, { isLoading: isGeneratingGstr1 }] = useGenerateGstr1Mutation();
  const [syncToTally, { isLoading: isSyncingToTally }] = useSyncToTallyMutation();

  const [tallyJobId, setTallyJobId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // 1. Generate & Download GSTR-1 B2CS JSON
  const handleGenerateGstr1 = async () => {
    setStatusMessage(null);
    try {
      const response = await generateGstr1({ sales }).unwrap();
      const jsonStr = JSON.stringify(response.data || response, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GSTR1_B2CS_${platformName}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatusMessage({
        type: 'success',
        text: 'GSTR-1 B2CS JSON generated and downloaded successfully!',
      });
    } catch (error: any) {
      console.error('Failed to generate GSTR-1 JSON:', error);
      setStatusMessage({
        type: 'error',
        text: error?.data?.message || 'Failed to generate GSTR-1 JSON',
      });
    }
  };

  // 2. Queue batch for Tally Sync
  const handleSyncToTally = async () => {
    setStatusMessage(null);
    try {
      const response = await syncToTally({ sales }).unwrap();
      setTallyJobId(response.data.jobId);
      setStatusMessage({
        type: 'success',
        text: `Queued ${response.data.voucherCount} vouchers for Tally Prime Desktop Connector!`,
      });
    } catch (error: any) {
      console.error('Failed to queue Tally sync:', error);
      setStatusMessage({
        type: 'error',
        text: error?.data?.message || 'Failed to queue for Tally sync',
      });
    }
  };

  // 3. Export CSV
  const handleExportCsv = () => {
    if (!sales || sales.length === 0) return;
    const headers = [
      'Order ID',
      'Date',
      'SKU',
      'Quantity',
      'Taxable Value',
      'GST Rate',
      'CGST',
      'SGST',
      'IGST',
      'TCS',
      'State',
      'Transaction Type',
    ];

    const rows = sales.map((s) => [
      `"${s.orderId || ''}"`,
      `"${s.orderDate || ''}"`,
      `"${s.sku || ''}"`,
      s.quantity || 1,
      s.taxableValue || 0,
      s.gstRate || 0,
      s.cgst || 0,
      s.sgst || 0,
      s.igst || 0,
      s.tcs || s.tcsAmount || 0,
      `"${s.state || s.pos || ''}"`,
      `"${s.transactionType || 'SALE'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Standardized_${platformName}_Sales_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-3">
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>
            Export & Accounting Integration
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Ready to export to GST Portal or push directly into Tally Prime
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          {/* Generate GSTR-1 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateGstr1}
            isLoading={isGeneratingGstr1}
            leftIcon={<FileCode className="w-3.5 h-3.5 text-indigo-500" />}
          >
            Generate GSTR-1 JSON
          </Button>

          {/* Sync to Tally */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSyncToTally}
            isLoading={isSyncingToTally}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync to Tally Prime
          </Button>

          {/* New Upload */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Upload
          </Button>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-900'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#00C2B3] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>

          {tallyJobId && (
            <Link
              href="/dashboard/tally-sync"
              className="inline-flex items-center gap-1 font-semibold text-[#00C2B3] hover:underline shrink-0 ml-3"
            >
              View Sync Queue <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
