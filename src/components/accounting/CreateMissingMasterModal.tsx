import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CreateMissingMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  initialName?: string;
  defaultGroup?: string;
  onSuccess?: (account: any) => void;
}

const TALLY_GROUPS = [
  { group: 'Sundry Debtors', label: 'Sundry Debtors (Customers / Receivables)' },
  { group: 'Sundry Creditors', label: 'Sundry Creditors (Vendors / Payables)' },
  { group: 'Sales Accounts', label: 'Sales Accounts (Revenue)' },
  { group: 'Purchase Accounts', label: 'Purchase Accounts (Direct Cost)' },
  { group: 'Bank Accounts', label: 'Bank Accounts' },
  { group: 'Cash-in-hand', label: 'Cash-in-hand' },
  { group: 'Duties & Taxes', label: 'Duties & Taxes (GST, TDS, TCS)' },
  { group: 'Direct Expenses', label: 'Direct Expenses (Freight, Wages)' },
  { group: 'Indirect Expenses', label: 'Indirect Expenses (Rent, Utilities, Office)' },
  { group: 'Capital Account', label: 'Capital Account (Equity)' },
  { group: 'Current Assets', label: 'Current Assets' },
  { group: 'Current Liabilities', label: 'Current Liabilities' }
];

export const CreateMissingMasterModal: React.FC<CreateMissingMasterModalProps> = ({
  isOpen,
  onClose,
  clientId,
  initialName = '',
  defaultGroup = 'Sundry Debtors',
  onSuccess
}) => {
  const [name, setName] = useState(initialName);
  const [parentGroup, setParentGroup] = useState(defaultGroup);
  const [gstin, setGstin] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialName) setName(initialName);
    if (defaultGroup) setParentGroup(defaultGroup);
  }, [initialName, defaultGroup, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Ledger Name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/erp/ledgers/quick-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          clientId,
          name: name.trim(),
          parentGroup,
          openingBalance,
          gstin: gstin.trim() || undefined
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to create ledger');
      }

      onSuccess?.(resData.account);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating master ledger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--color-text-heading)]">
                Create Missing Master Ledger
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Auto-syncs to Chart of Accounts and Tally Prime
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-[var(--color-text-heading)]">
              Ledger / Party Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp Ltd"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[var(--color-text-heading)]">
              Tally Parent Group <span className="text-rose-500">*</span>
            </label>
            <select
              value={parentGroup}
              onChange={(e) => setParentGroup(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {TALLY_GROUPS.map((g) => (
                <option key={g.group} value={g.group}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-[var(--color-text-heading)]">
                GSTIN (Optional)
              </label>
              <input
                type="text"
                maxLength={15}
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="27AAAAA0000A1Z5"
                className="w-full font-mono uppercase px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[var(--color-text-heading)]">
                Opening Balance (â‚¹)
              </label>
              <input
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full font-mono px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--color-border)]">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Create & Queue to Tally
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

