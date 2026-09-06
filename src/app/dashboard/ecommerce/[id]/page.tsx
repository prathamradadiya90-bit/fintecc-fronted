'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowLeft,
  Check,
  FileSpreadsheet,
  Download,
  IndianRupee,
  Layers,
  Save,
  Loader2,
} from 'lucide-react';
import {
  useGetReportQuery,
  useUpdateTcsMutation,
  useBulkUpdateHsnMutation,
  useOverrideTable14Mutation,
  useGenerateGstr1ByIdMutation,
} from '@/lib/store/api/ecommerceApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function EcommerceReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const reportId = resolvedParams.id;
  const { showToast } = useToast();

  const { data: response, isLoading } = useGetReportQuery(reportId);
  const report = response?.data;

  // Mutations
  const [updateTcs, { isLoading: isUpdatingTcs }] = useUpdateTcsMutation();
  const [bulkUpdateHsn, { isLoading: isUpdatingHsn }] = useBulkUpdateHsnMutation();
  const [overrideTable14] = useOverrideTable14Mutation();
  const [generateGstr1, { isLoading: isGeneratingGstr1 }] = useGenerateGstr1ByIdMutation();

  // TCS Reconciliation State
  const [portalTcs, setPortalTcs] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [bulkHsnCode, setBulkHsnCode] = useState('');
  const [bulkTaxRate, setBulkTaxRate] = useState('');

  const lineItems = report?.lineItems || [];

  const systemTcs = lineItems.reduce((acc, item) => acc + (Number(item.tcsAmount) || 0), 0);
  const currentPortalTcs = portalTcs !== '' ? parseFloat(portalTcs) : (report?.tcsReconciliation?.portalTcsAmount ?? systemTcs);
  const tcsDelta = currentPortalTcs - systemTcs;

  const handleSaveTcs = async () => {
    try {
      await updateTcs({
        id: reportId,
        portalTcsAmount: Number(currentPortalTcs) || 0,
      }).unwrap();
      showToast('TCS Reconciliation saved successfully', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to save TCS reconciliation', 'error');
    }
  };

  const handleBulkApplyHsn = async () => {
    if (selectedItemIds.length === 0) {
      showToast('Please select at least one line item', 'error');
      return;
    }
    if (!bulkHsnCode.trim()) {
      showToast('Please enter an HSN code', 'error');
      return;
    }

    try {
      await bulkUpdateHsn({
        id: reportId,
        itemIds: selectedItemIds,
        hsnCode: bulkHsnCode.trim(),
        taxRate: bulkTaxRate ? parseFloat(bulkTaxRate) : undefined,
      }).unwrap();
      showToast(`Updated HSN for ${selectedItemIds.length} orders`, 'success');
      setSelectedItemIds([]);
      setBulkHsnCode('');
      setBulkTaxRate('');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update HSN', 'error');
    }
  };

  const handleToggleTable14 = async (itemId: string, currentState?: boolean) => {
    try {
      await overrideTable14({
        id: reportId,
        itemId,
        isTable14: !currentState,
      }).unwrap();
      showToast(`Table 14 override ${!currentState ? 'enabled' : 'disabled'}`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to override Table 14', 'error');
    }
  };

  const handleDownloadGstr1 = async () => {
    try {
      const res = await generateGstr1(reportId).unwrap();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GSTR1_${report?.platform || 'Ecommerce'}_${report?.reportPeriod || 'Report'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('GSTR-1 JSON downloaded successfully', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to generate GSTR-1', 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === lineItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(lineItems.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-[#00C2B3]" />
          <span>Loading e-commerce report line items...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/ecommerce"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00C2B3] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to E-Commerce Hub
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#00C2B3] border border-teal-100 dark:border-teal-900">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {report?.platform || 'E-Commerce'} Report Details
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Period: {report?.reportPeriod || 'N/A'} • {lineItems.length} line items processed
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleDownloadGstr1}
          isLoading={isGeneratingGstr1}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export GSTR-1 JSON
        </Button>
      </div>

      {/* TCS Reconciliation Panel */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Layers className="w-4 h-4 text-[#00C2B3]" />
          Section 52 TCS Reconciliation
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              System Computed TCS (1%)
            </label>
            <div className="h-10 px-3 flex items-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200">
              ₹{systemTcs.toFixed(2)}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Portal Reported TCS (₹)
            </label>
            <Input
              type="number"
              step="0.01"
              value={currentPortalTcs}
              onChange={(e) => setPortalTcs(e.target.value)}
              placeholder="Portal TCS"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Variance / Delta
            </label>
            <div
              className={`h-10 px-3 flex items-center rounded-xl border text-sm font-bold ${
                Math.abs(tcsDelta) < 1
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border-rose-200'
              }`}
            >
              ₹{tcsDelta.toFixed(2)}
            </div>
          </div>

          <div>
            <Button
              onClick={handleSaveTcs}
              isLoading={isUpdatingTcs}
              variant="outline"
              className="w-full flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Reconciliation
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Selected: {selectedItemIds.length} of {lineItems.length} orders
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="HSN Code (e.g. 6109)"
            value={bulkHsnCode}
            onChange={(e) => setBulkHsnCode(e.target.value)}
            className="w-36 text-xs h-9"
          />
          <Input
            type="number"
            placeholder="Tax Rate %"
            value={bulkTaxRate}
            onChange={(e) => setBulkTaxRate(e.target.value)}
            className="w-28 text-xs h-9"
          />
          <Button
            size="sm"
            onClick={handleBulkApplyHsn}
            isLoading={isUpdatingHsn}
            disabled={selectedItemIds.length === 0}
            className="shrink-0"
          >
            Apply HSN
          </Button>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3">
                  <input
                    type="checkbox"
                    checked={selectedItemIds.length === lineItems.length && lineItems.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded text-[#00C2B3] focus:ring-[#00C2B3]"
                  />
                </th>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Taxable Value</th>
                <th className="py-3 px-3">IGST</th>
                <th className="py-3 px-3">CGST / SGST</th>
                <th className="py-3 px-3">HSN Code</th>
                <th className="py-3 px-3 text-center">Table 14</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lineItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isSelected ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(item.id)}
                        className="rounded text-[#00C2B3] focus:ring-[#00C2B3]"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {item.orderId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {item.buyerState || 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      ₹{Number(item.taxableValue).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      ₹{Number(item.igst).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      ₹{Number(item.cgst).toFixed(2)} / ₹{Number(item.sgst).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {item.hsnCode ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                          {item.hsnCode}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleTable14(item.id, item.isTable14)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                          item.isTable14
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200'
                        }`}
                      >
                        {item.isTable14 ? 'Table 14' : 'Standard'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
