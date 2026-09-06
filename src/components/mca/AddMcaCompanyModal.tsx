'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { useCreateCompanyMutation, useUpdateCompanyMutation } from '@/lib/store/api/mcaApi';
import { useToast } from '@/components/ui/Toast';
import type { McaCompany, CreateMcaCompanyRequest } from '@/lib/types/mca.types';

interface AddMcaCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCompany?: McaCompany | null;
}

export const AddMcaCompanyModal: React.FC<AddMcaCompanyModalProps> = ({
  isOpen,
  onClose,
  editingCompany,
}) => {
  const { data: clientsData } = useGetClientsQuery({ limit: 100 });
  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
  const { showToast } = useToast();

  const [cin, setCin] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [clientId, setClientId] = useState('');
  const [rocCode, setRocCode] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [companyCategory, setCompanyCategory] = useState('Company limited by Shares');
  const [companySubCategory, setCompanySubCategory] = useState('Non-govt company');
  const [classOfCompany, setClassOfCompany] = useState('Private');
  const [authorizedCapital, setAuthorizedCapital] = useState('');
  const [paidUpCapital, setPaidUpCapital] = useState('');
  const [dateOfIncorporation, setDateOfIncorporation] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [emailId, setEmailId] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (editingCompany) {
      setCin(editingCompany.cin || '');
      setCompanyName(editingCompany.companyName || '');
      setClientId(editingCompany.clientId || '');
      setRocCode(editingCompany.rocCode || '');
      setRegistrationNumber(editingCompany.registrationNumber || '');
      setCompanyCategory(editingCompany.companyCategory || 'Company limited by Shares');
      setCompanySubCategory(editingCompany.companySubCategory || 'Non-govt company');
      setClassOfCompany(editingCompany.classOfCompany || 'Private');
      setAuthorizedCapital(String(editingCompany.authorizedCapital || 0));
      setPaidUpCapital(String(editingCompany.paidUpCapital || 0));
      setDateOfIncorporation(
        editingCompany.dateOfIncorporation
          ? new Date(editingCompany.dateOfIncorporation).toISOString().split('T')[0]
          : ''
      );
      setRegisteredAddress(editingCompany.registeredAddress || '');
      setEmailId(editingCompany.emailId || '');
      setStatus(editingCompany.status || 'Active');
    } else {
      setCin('');
      setCompanyName('');
      setClientId('');
      setRocCode('');
      setRegistrationNumber('');
      setCompanyCategory('Company limited by Shares');
      setCompanySubCategory('Non-govt company');
      setClassOfCompany('Private');
      setAuthorizedCapital('');
      setPaidUpCapital('');
      setDateOfIncorporation('');
      setRegisteredAddress('');
      setEmailId('');
      setStatus('Active');
    }
  }, [editingCompany, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cin || !companyName) {
      showToast('CIN and Company Name are required', 'error');
      return;
    }

    try {
      const payload: CreateMcaCompanyRequest = {
        cin,
        companyName,
        clientId: clientId || undefined,
        rocCode: rocCode || undefined,
        registrationNumber: registrationNumber || undefined,
        companyCategory,
        companySubCategory,
        classOfCompany,
        authorizedCapital: authorizedCapital ? parseFloat(authorizedCapital) : 0,
        paidUpCapital: paidUpCapital ? parseFloat(paidUpCapital) : 0,
        dateOfIncorporation: dateOfIncorporation || undefined,
        registeredAddress: registeredAddress || undefined,
        emailId: emailId || undefined,
        status,
      };

      if (editingCompany) {
        await updateCompany({ id: editingCompany.id, ...payload }).unwrap();
        showToast('Company details updated successfully', 'success');
      } else {
        await createCompany(payload).unwrap();
        showToast('Company registered successfully', 'success');
      }
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Failed to save company', 'error');
    }
  };

  const clients = clientsData?.data || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCompany ? 'Edit MCA Company' : 'Register MCA Company'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Basic Identification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="CIN (21 characters)"
            placeholder="e.g. U72200MH2020PTC123456"
            value={cin}
            onChange={(e) => setCin(e.target.value.toUpperCase())}
            required
          />
          <Input
            label="Company Legal Name"
            placeholder="e.g. Acme Tech Private Limited"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>

        {/* Client association */}
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            Associated Client Profile (Optional)
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full h-[42px] px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C2B3] text-slate-800 dark:text-slate-100"
          >
            <option value="">No Client Linked</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.pan ? `(${c.pan})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Classification */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">
              Class of Company
            </label>
            <select
              value={classOfCompany}
              onChange={(e) => setClassOfCompany(e.target.value)}
              className="w-full h-[42px] px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            >
              <option value="Private">Private</option>
              <option value="Public">Public</option>
              <option value="One Person Company">One Person Company</option>
            </select>
          </div>
          <Input
            label="ROC Code"
            placeholder="e.g. RoC-Mumbai"
            value={rocCode}
            onChange={(e) => setRocCode(e.target.value)}
          />
          <Input
            label="Registration No."
            placeholder="e.g. 123456"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />
        </div>

        {/* Capital Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Authorized Capital (₹)"
            type="number"
            placeholder="100000"
            value={authorizedCapital}
            onChange={(e) => setAuthorizedCapital(e.target.value)}
          />
          <Input
            label="Paid-up Capital (₹)"
            type="number"
            placeholder="100000"
            value={paidUpCapital}
            onChange={(e) => setPaidUpCapital(e.target.value)}
          />
        </div>

        {/* Dates & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Incorporation Date"
            type="date"
            value={dateOfIncorporation}
            onChange={(e) => setDateOfIncorporation(e.target.value)}
          />
          <Input
            label="Official Email"
            type="email"
            placeholder="info@company.com"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">
              Entity Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-[42px] px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            >
              <option value="Active">Active</option>
              <option value="Strike Off">Strike Off</option>
              <option value="Under Liquidation">Under Liquidation</option>
              <option value="Dormant">Dormant</option>
            </select>
          </div>
        </div>

        {/* Registered Office Address */}
        <div>
          <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">
            Registered Office Address
          </label>
          <textarea
            value={registeredAddress}
            onChange={(e) => setRegisteredAddress(e.target.value)}
            placeholder="Enter registered address as per MCA master data..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
          />
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isCreating || isUpdating}>
            {editingCompany ? 'Save Changes' : 'Register Entity'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
