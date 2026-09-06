'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, Plus, ShieldCheck, Clock, UserPlus } from 'lucide-react';
import { useGetDirectorsQuery, useAddDirectorMutation } from '@/lib/store/api/mcaApi';
import { useToast } from '@/components/ui/Toast';
import type { McaCompany } from '@/lib/types/mca.types';

interface DirectorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: McaCompany | null;
}

export const DirectorsModal: React.FC<DirectorsModalProps> = ({
  isOpen,
  onClose,
  company,
}) => {
  const { showToast } = useToast();
  const companyId = company?.id || '';

  const { data: response, isLoading } = useGetDirectorsQuery(companyId, {
    skip: !companyId || !isOpen,
  });

  const [addDirector, { isLoading: isAdding }] = useAddDirectorMutation();
  const [showAddForm, setShowAddForm] = useState(false);

  const [din, setDin] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('Director');
  const [dateOfAppointment, setDateOfAppointment] = useState('');
  const [kycStatus, setKycStatus] = useState('Verified');

  const directors = response?.data || [];

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!din || !name) {
      showToast('DIN and Name are required', 'error');
      return;
    }

    try {
      await addDirector({
        companyId,
        data: {
          din,
          name,
          designation,
          dateOfAppointment: dateOfAppointment || undefined,
          kycStatus,
        },
      }).unwrap();

      showToast('Director added successfully', 'success');
      setShowAddForm(false);
      setDin('');
      setName('');
      setDesignation('Director');
      setDateOfAppointment('');
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Failed to add director', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={company ? `Board of Directors — ${company.companyName}` : 'Board of Directors'}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00C2B3]" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {directors.length} Registered {directors.length === 1 ? 'Director' : 'Directors'}
            </span>
          </div>
          {!showAddForm && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Director
            </Button>
          )}
        </div>

        {/* Inline Add Director Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddSubmit}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
          >
            <div className="flex items-center gap-1.5 font-medium text-xs text-[#00C2B3] uppercase tracking-wider">
              <UserPlus className="w-4 h-4" />
              New Director Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="DIN (8 digits)"
                placeholder="e.g. 01234567"
                value={din}
                onChange={(e) => setDin(e.target.value)}
                required
              />
              <Input
                label="Full Name"
                placeholder="e.g. Rajiv Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Designation"
                placeholder="Director / Managing Director"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
              <Input
                label="Appointment Date"
                type="date"
                value={dateOfAppointment}
                onChange={(e) => setDateOfAppointment(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="w-1/2 pr-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  KYC Status
                </label>
                <select
                  value={kycStatus}
                  onChange={(e) => setKycStatus(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                >
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Deactivated">Deactivated</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isAdding}>
                  Save Director
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Directors List */}
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-slate-500">Loading directors...</div>
          ) : directors.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No directors recorded yet for this entity.
            </div>
          ) : (
            directors.map((dir) => (
              <div
                key={dir.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {dir.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      DIN: {dir.din}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>{dir.designation || 'Director'}</span>
                    {dir.dateOfAppointment && (
                      <span>
                        Appointed: {new Date(dir.dateOfAppointment).toLocaleDateString('en-GB')}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {dir.kycStatus === 'Verified' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      KYC Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      <Clock className="w-3 h-3" />
                      {dir.kycStatus}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
