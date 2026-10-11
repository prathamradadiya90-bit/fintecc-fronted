'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useGetStatutoryCatalogQuery } from '@/lib/store/api/gstApi';
import type { StatutoryReturnCatalogItem } from '@/lib/types/gst.types';

export function GstStatutoryCatalogTable() {
  const { data: response, isLoading } = useGetStatutoryCatalogQuery();
  const catalog = response?.data || [];

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'VIEW_ONLY'>('ALL');

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchSearch =
        !search ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.legalSection.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [catalog, search, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(61,122,100,0.1)] text-[#3D7A64] border border-[#3D7A64]/20">
            Active
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(158,74,74,0.1)] text-[#9E4A4A] border border-[#9E4A4A]/20">
            Suspended
          </span>
        );
      case 'VIEW_ONLY':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20">
            View-Only
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-[#5A6E85]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div
        className="p-4 rounded-2xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E2A38] dark:text-slate-100">
              Statutory 22 GST Returns Directory
            </h3>
            <p className="text-xs text-[#5A6E85]">
              Authoritative statutory reference as prescribed under CGST Rules, 2017 & Section 37/39/44.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex items-center p-0.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-xs">
            {(['ALL', 'ACTIVE', 'VIEW_ONLY', 'SUSPENDED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                  statusFilter === tab
                    ? 'bg-[#4A6FA5] text-white shadow-2xs'
                    : 'text-[#5A6E85] hover:text-[#1E2A38]'
                }`}
              >
                {tab === 'ALL' ? 'All (22)' : tab === 'ACTIVE' ? 'Active' : tab === 'VIEW_ONLY' ? 'Auto/View' : 'Suspended'}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or section..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#4A6FA5]"
            />
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div
        className="rounded-2xl border shadow-xs overflow-hidden"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#5A6E85]">
            Loading statutory catalog...
          </div>
        ) : filteredCatalog.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#5A6E85]">
            No matching return types found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b bg-[var(--color-bg-subtle)] text-[#5A6E85]" style={{ borderColor: 'var(--color-border)' }}>
                  <th className="py-3 px-4 font-semibold">Form Code</th>
                  <th className="py-3 px-4 font-semibold">Return Title & Description</th>
                  <th className="py-3 px-4 font-semibold">Legal Section</th>
                  <th className="py-3 px-4 font-semibold">Frequency</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Due Date Rule</th>
                  <th className="py-3 px-4 font-semibold text-right">Applicability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredCatalog.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-500/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#4A6FA5] font-mono whitespace-nowrap">
                      {item.code}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-[#1E2A38] dark:text-slate-200">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[#5A6E85] line-clamp-2 mt-0.5 leading-relaxed">
                        {item.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#5A6E85] font-medium whitespace-nowrap">
                      {item.legalSection}
                    </td>
                    <td className="py-3.5 px-4 text-[#1E2A38] dark:text-slate-300 font-medium whitespace-nowrap">
                      {item.frequency}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-[#5A6E85] max-w-xs text-[11px] leading-relaxed">
                      {item.dueDateRule}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[11px] text-[#5A6E85] max-w-xs truncate">
                      {item.whoMustFile}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
