'use client';

import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Users,
  Edit2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import type { McaCompany } from '@/lib/types/mca.types';

interface McaCompanyTableProps {
  companies: McaCompany[];
  isLoading: boolean;
  onEdit: (company: McaCompany) => void;
  onViewDirectors: (company: McaCompany) => void;
}

export const McaCompanyTable: React.FC<McaCompanyTableProps> = ({
  companies,
  isLoading,
  onEdit,
  onViewDirectors,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.cin.toLowerCase().includes(search.toLowerCase()) ||
      (c.rocCode && c.rocCode.toLowerCase().includes(search.toLowerCase())) ||
      (c.client?.name && c.client.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, CIN, client..."
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
            <option value="Active">Active</option>
            <option value="Strike Off">Strike Off</option>
            <option value="Under Liquidation">Under Liquidation</option>
            <option value="Dormant">Dormant</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Company & CIN</th>
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Class & ROC</th>
              <th className="py-3.5 px-4">Authorized / Paid-up Capital</th>
              <th className="py-3.5 px-4">Incorporation</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#00C2B3] border-t-transparent rounded-full animate-spin" />
                    <span>Loading MCA companies...</span>
                  </div>
                </td>
              </tr>
            ) : filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No MCA companies found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Register an entity or adjust your search filter.
                  </p>
                </td>
              </tr>
            ) : (
              filteredCompanies.map((company) => (
                <tr
                  key={company.id}
                  className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {company.companyName}
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">{company.cin}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-sm text-slate-800 dark:text-slate-200">
                      {company.client?.name || <span className="text-slate-400 italic">None</span>}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {company.classOfCompany || 'Private'}
                    </div>
                    <div className="text-xs text-slate-500">{company.rocCode || 'RoC'}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-xs text-slate-900 dark:text-slate-100 font-medium">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatCurrency(company.authorizedCapital)}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Paid-up: {formatCurrency(company.paidUpCapital)}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {company.dateOfIncorporation
                        ? new Date(company.dateOfIncorporation).toLocaleDateString('en-GB')
                        : 'N/A'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {company.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        <AlertCircle className="w-3 h-3" />
                        {company.status}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDirectors(company)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                        title="View Board of Directors"
                      >
                        <Users className="w-3.5 h-3.5 text-[#00C2B3]" />
                        Directors
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(company)}
                        className="p-1.5 text-slate-500 hover:text-[#00C2B3] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Edit Company Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
