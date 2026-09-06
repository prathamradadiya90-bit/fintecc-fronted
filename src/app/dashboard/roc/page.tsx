'use client';

import React, { useState } from 'react';
import {
  FileStack,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetFilingsQuery } from '@/lib/store/api/rocApi';
import { RocFilingTable } from '@/components/roc/RocFilingTable';
import { AddRocFilingModal } from '@/components/roc/AddRocFilingModal';
import { RecordChallanModal } from '@/components/roc/RecordChallanModal';
import type { RocFiling } from '@/lib/types/roc.types';

export default function RocFilingsPage() {
  const { data: response, isLoading } = useGetFilingsQuery({ limit: 100 });
  const filings = response?.data || [];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [recordChallanFiling, setRecordChallanFiling] = useState<RocFiling | null>(null);

  // Metrics
  const totalFilings = response?.meta?.total ?? filings.length;
  const pendingFilings = filings.filter(
    (f) => f.status === 'Pending' || f.status === 'Prepared'
  ).length;
  const filedApproved = filings.filter(
    (f) => f.status === 'Filed' || f.status === 'Approved'
  ).length;

  const now = new Date();
  const overdueFilings = filings.filter(
    (f) =>
      f.dueDate &&
      new Date(f.dueDate) < now &&
      f.status !== 'Filed' &&
      f.status !== 'Approved'
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#00C2B3] border border-teal-100 dark:border-teal-900">
            <FileStack className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              ROC Annual Filings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage MCA statutory forms, AOC-4 / MGT-7 deadlines, and challan payments
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Filing Record
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Filings
            </span>
            <FileCheck2 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {totalFilings}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Recorded statutory forms</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Pending / In-Prep
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {pendingFilings}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Awaiting filing / submission</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Filed & Approved
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {filedApproved}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Completed submissions</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Overdue Filings
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {overdueFilings}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Past statutory due date</p>
        </div>
      </div>

      {/* Main Table */}
      <RocFilingTable
        filings={filings}
        isLoading={isLoading}
        onRecordChallan={(filing) => setRecordChallanFiling(filing)}
      />

      {/* New Filing Modal */}
      <AddRocFilingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Record Challan Modal */}
      <RecordChallanModal
        isOpen={!!recordChallanFiling}
        onClose={() => setRecordChallanFiling(null)}
        filing={recordChallanFiling}
      />
    </div>
  );
}
