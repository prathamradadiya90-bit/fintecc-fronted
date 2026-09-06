'use client';

import React, { useState } from 'react';
import { Building2, Plus, CheckCircle2, AlertOctagon, IndianRupee, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetCompaniesQuery } from '@/lib/store/api/mcaApi';
import { McaCompanyTable } from '@/components/mca/McaCompanyTable';
import { AddMcaCompanyModal } from '@/components/mca/AddMcaCompanyModal';
import { DirectorsModal } from '@/components/mca/DirectorsModal';
import type { McaCompany } from '@/lib/types/mca.types';

export default function McaCompaniesPage() {
  const { data: response, isLoading } = useGetCompaniesQuery({ limit: 100 });
  const companies = response?.data || [];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<McaCompany | null>(null);
  const [directorsModalCompany, setDirectorsModalCompany] = useState<McaCompany | null>(null);

  // Metrics
  const totalCompanies = response?.meta?.total ?? companies.length;
  const activeCompanies = companies.filter((c) => c.status === 'Active').length;
  const inactiveCompanies = companies.filter((c) => c.status !== 'Active').length;
  const totalAuthCapital = companies.reduce(
    (acc, curr) => acc + (Number(curr.authorizedCapital) || 0),
    0
  );

  const formatShortCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleEdit = (company: McaCompany) => {
    setEditingCompany(company);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingCompany(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#00C2B3] border border-teal-100 dark:border-teal-900">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              MCA Company Registry
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track corporate entities, authorized capital, and board of directors
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            setEditingCompany(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Register Company
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Companies
            </span>
            <Briefcase className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {totalCompanies}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Corporate master records</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Active Entities
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {activeCompanies}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Good standing with MCA</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Strike Off / Inactive
            </span>
            <AlertOctagon className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {inactiveCompanies}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Defunct or closed</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Auth Capital
            </span>
            <IndianRupee className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {formatShortCurrency(totalAuthCapital)}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Registered aggregate capital</p>
        </div>
      </div>

      {/* Main Table */}
      <McaCompanyTable
        companies={companies}
        isLoading={isLoading}
        onEdit={handleEdit}
        onViewDirectors={(company) => setDirectorsModalCompany(company)}
      />

      {/* Add / Edit Company Modal */}
      <AddMcaCompanyModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        editingCompany={editingCompany}
      />

      {/* Directors Modal */}
      <DirectorsModal
        isOpen={!!directorsModalCompany}
        onClose={() => setDirectorsModalCompany(null)}
        company={directorsModalCompany}
      />
    </div>
  );
}
