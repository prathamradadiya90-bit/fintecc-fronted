'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useGetCompaniesQuery } from '@/lib/store/api/mcaApi';
import { useCreateFilingMutation } from '@/lib/store/api/rocApi';
import { useToast } from '@/components/ui/Toast';
import type { RocFilingStatus } from '@/lib/types/roc.types';

interface AddRocFilingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_FORMS = [
  { name: 'AOC-4', desc: 'Filing of financial statements and documents with ROC' },
  { name: 'MGT-7', desc: 'Annual Return for Companies other than OPC / Small' },
  { name: 'MGT-7A', desc: 'Abridged Annual Return for OPCs and Small Companies' },
  { name: 'DIR-3 KYC', desc: 'Director Identification Number KYC verification' },
  { name: 'ADT-1', desc: 'Notice to the Registrar for appointment of Auditor' },
  { name: 'INC-22', desc: 'Notice of situation/change of situation of Registered Office' },
  { name: 'PAS-3', desc: 'Return of Allotment of Shares' },
  { name: 'DPT-3', desc: 'Return of deposits / particulars of transactions not considered as deposit' },
  { name: 'MSME-1', desc: 'Half-yearly return with respect to outstanding dues to MSME' },
  { name: 'Other', desc: 'Other MCA statutory e-Form' },
];

export const AddRocFilingModal: React.FC<AddRocFilingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: companiesResponse, isLoading: isLoadingCompanies } = useGetCompaniesQuery({ limit: 100 });
  const [createFiling, { isLoading: isCreating }] = useCreateFilingMutation();
  const { showToast } = useToast();

  const [mcaCompanyId, setMcaCompanyId] = useState('');
  const [formName, setFormName] = useState('AOC-4');
  const [customFormName, setCustomFormName] = useState('');
  const [financialYear, setFinancialYear] = useState('2025-26');
  const [dueDate, setDueDate] = useState('');
  const [srn, setSrn] = useState('');
  const [status, setStatus] = useState<RocFilingStatus>('Pending');

  const companies = companiesResponse?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mcaCompanyId) {
      showToast('Please select a company', 'error');
      return;
    }

    const selectedForm = formName === 'Other' ? customFormName.trim() : formName;
    if (!selectedForm) {
      showToast('Please enter the form name', 'error');
      return;
    }

    try {
      const selectedCompany = companies.find((c) => c.id === mcaCompanyId);
      await createFiling({
        mcaCompanyId,
        clientId: selectedCompany?.clientId,
        formName: selectedForm,
        financialYear,
        dueDate: dueDate || undefined,
        srn: srn || undefined,
        status,
      }).unwrap();

      showToast('ROC Filing record created successfully', 'success');
      onClose();
      setMcaCompanyId('');
      setFormName('AOC-4');
      setCustomFormName('');
      setDueDate('');
      setSrn('');
      setStatus('Pending');
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Failed to create ROC filing', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New ROC Annual Filing">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Selection */}
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            Target Company <span className="text-red-500">*</span>
          </label>
          <select
            value={mcaCompanyId}
            onChange={(e) => setMcaCompanyId(e.target.value)}
            required
            className="w-full h-[42px] px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C2B3] text-slate-800 dark:text-slate-100"
          >
            <option value="">Select an MCA Registered Company...</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName} ({c.cin})
              </option>
            ))}
          </select>
          {companies.length === 0 && !isLoadingCompanies && (
            <p className="text-xs text-amber-600 mt-1">
              No MCA companies registered yet. Register a company first in the MCA Registry tab.
            </p>
          )}
        </div>

        {/* Form Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">
              MCA e-Form <span className="text-red-500">*</span>
            </label>
            <select
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full h-[42px] px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            >
              {COMMON_FORMS.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} — {f.desc.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">
              Financial Year
            </label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full h-[42px] px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            >
              <option value="2026-27">2026-27</option>
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
            </select>
          </div>
        </div>

        {formName === 'Other' && (
          <Input
            label="Specific Form Name"
            placeholder="e.g. DIR-12, INC-20A"
            value={customFormName}
            onChange={(e) => setCustomFormName(e.target.value)}
            required
          />
        )}

        {/* Due Date & SRN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Statutory Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Input
            label="SRN (Service Request No.)"
            placeholder="e.g. R12345678"
            value={srn}
            onChange={(e) => setSrn(e.target.value)}
          />
        </div>

        {/* Initial Status */}
        <div>
          <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">
            Initial Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RocFilingStatus)}
            className="w-full h-[42px] px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
          >
            <option value="Pending">Pending</option>
            <option value="Prepared">Prepared</option>
            <option value="Filed">Filed</option>
          </select>
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isCreating}>
            Create Filing
          </Button>
        </div>
      </form>
    </Modal>
  );
};
