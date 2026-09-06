'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IndianRupee, Receipt } from 'lucide-react';
import { useRecordChallanMutation } from '@/lib/store/api/rocApi';
import { useToast } from '@/components/ui/Toast';
import type { RocFiling } from '@/lib/types/roc.types';

interface RecordChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  filing: RocFiling | null;
}

export const RecordChallanModal: React.FC<RecordChallanModalProps> = ({
  isOpen,
  onClose,
  filing,
}) => {
  const [recordChallan, { isLoading }] = useRecordChallanMutation();
  const { showToast } = useToast();

  const [challanAmount, setChallanAmount] = useState('');
  const [challanDate, setChallanDate] = useState('');
  const [challanReceiptUrl, setChallanReceiptUrl] = useState('');

  useEffect(() => {
    if (filing) {
      setChallanAmount(filing.challanAmount ? String(filing.challanAmount) : '');
      setChallanDate(
        filing.challanDate
          ? new Date(filing.challanDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setChallanReceiptUrl(filing.challanReceiptUrl || '');
    }
  }, [filing, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filing || !challanAmount) {
      showToast('Please specify the challan payment amount', 'error');
      return;
    }

    try {
      await recordChallan({
        id: filing.id,
        challanAmount: parseFloat(challanAmount),
        challanDate: challanDate || undefined,
        challanReceiptUrl: challanReceiptUrl || undefined,
      }).unwrap();

      showToast('MCA Challan payment recorded successfully', 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Failed to record challan', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={filing ? `Record Challan — ${filing.formName}` : 'Record MCA Challan'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {filing && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {filing.mcaCompany?.companyName || 'Company Filing'}
            </div>
            <div className="mt-1 flex gap-3">
              <span>Form: <strong className="text-slate-800 dark:text-slate-200">{filing.formName}</strong></span>
              {filing.financialYear && <span>FY: {filing.financialYear}</span>}
              {filing.srn && <span>SRN: {filing.srn}</span>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Challan Amount (₹)"
            type="number"
            step="0.01"
            placeholder="e.g. 600"
            value={challanAmount}
            onChange={(e) => setChallanAmount(e.target.value)}
            required
          />

          <Input
            label="Payment Date"
            type="date"
            value={challanDate}
            onChange={(e) => setChallanDate(e.target.value)}
            required
          />
        </div>

        <Input
          label="Receipt Reference / Download URL"
          placeholder="https://mca.gov.in/receipts/... or challan ref"
          value={challanReceiptUrl}
          onChange={(e) => setChallanReceiptUrl(e.target.value)}
        />

        <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex items-center gap-1.5">
            <Receipt className="w-4 h-4" />
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
