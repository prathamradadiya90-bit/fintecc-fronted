'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle,
  AlertTriangle,
  Receipt,
  ExternalLink,
} from 'lucide-react';
import type { RocFiling, RocFilingStatus } from '@/lib/types/roc.types';
import { useUpdateFilingStatusMutation } from '@/lib/store/api/rocApi';
import { useToast } from '@/components/ui/Toast';

interface RocFilingTableProps {
  filings: RocFiling[];
  isLoading: boolean;
  onRecordChallan: (filing: RocFiling) => void;
}

export const RocFilingTable: React.FC<RocFilingTableProps> = ({
  filings,
  isLoading,
  onRecordChallan,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [updateStatus] = useUpdateFilingStatusMutation();
  const { showToast } = useToast();

  const handleStatusChange = async (id: string, newStatus: RocFilingStatus) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      showToast(`Filing status updated to ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update status', 'error');
    }
  };

  const filteredFilings = filings.filter((f) => {
    const matchesSearch =
      f.formName.toLowerCase().includes(search.toLowerCase()) ||
      (f.srn && f.srn.toLowerCase().includes(search.toLowerCase())) ||
      (f.financialYear && f.financialYear.toLowerCase().includes(search.toLowerCase())) ||
      (f.mcaCompany?.companyName &&
        f.mcaCompany.companyName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: RocFilingStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Filed':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Prepared':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search form, company, SRN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2B3] text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Prepared">Prepared</option>
            <option value="Filed">Filed</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Form & FY</th>
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">SRN</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Challan Fee</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#00C2B3] border-t-transparent rounded-full animate-spin" />
                    <span>Loading ROC filings...</span>
                  </div>
                </td>
              </tr>
            ) : filteredFilings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No ROC filings found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Create a new filing record or adjust your filter.
                  </p>
                </td>
              </tr>
            ) : (
              filteredFilings.map((filing) => {
                const isOverdue =
                  filing.dueDate &&
                  new Date(filing.dueDate) < new Date() &&
                  filing.status !== 'Filed' &&
                  filing.status !== 'Approved';

                return (
                  <tr
                    key={filing.id}
                    className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#00C2B3]" />
                        {filing.formName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        FY: {filing.financialYear || 'N/A'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {filing.mcaCompany?.companyName || 'Unknown Entity'}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {filing.mcaCompany?.cin || ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {filing.srn ? (
                        <code className="text-xs px-2 py-0.5 rounded font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {filing.srn}
                        </code>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not generated</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {filing.dueDate ? (
                        <div>
                          <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(filing.dueDate).toLocaleDateString('en-GB')}
                          </div>
                          {isOverdue && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-rose-600 font-semibold mt-0.5">
                              <AlertTriangle className="w-3 h-3" /> Overdue
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={filing.status}
                        onChange={(e) =>
                          handleStatusChange(filing.id, e.target.value as RocFilingStatus)
                        }
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none transition-colors ${getStatusBadge(
                          filing.status
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Prepared">Prepared</option>
                        <option value="Filed">Filed</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      {Number(filing.challanAmount) > 0 ? (
                        <div>
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-900 dark:text-slate-100">
                            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                            <span>₹{Number(filing.challanAmount).toLocaleString('en-IN')}</span>
                          </div>
                          {filing.challanReceiptUrl && (
                            <a
                              href={filing.challanReceiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[#00C2B3] hover:underline flex items-center gap-0.5 mt-0.5"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              View receipt
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unpaid</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onRecordChallan(filing)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                        title="Record Challan Payment"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#00C2B3]" />
                        Challan
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
