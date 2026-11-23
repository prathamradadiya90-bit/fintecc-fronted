'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2,
  Building2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetProfilesQuery } from '@/lib/store/api/gstApi';

interface JournalLine {
  id: string;
  accountName: string;
  debit: number;
  credit: number;
}

type VoucherType = 'CONTRA' | 'PAYMENT' | 'RECEIPT' | 'JOURNAL' | 'SALES' | 'PURCHASE';

const VOUCHER_CONFIG: Record<VoucherType, { label: string; key: string; prefix: string; color: string; desc: string }> = {
  CONTRA: { label: 'Contra', key: 'F4', prefix: 'CNT-', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30', desc: 'Bank to Cash, Cash to Bank, Bank to Bank' },
  PAYMENT: { label: 'Payment', key: 'F5', prefix: 'PMT-', color: 'text-rose-600 bg-rose-500/10 border-rose-500/30', desc: 'Expenses, Vendor Payouts, Salaries' },
  RECEIPT: { label: 'Receipt', key: 'F6', prefix: 'RCT-', color: 'text-blue-600 bg-blue-500/10 border-blue-500/30', desc: 'Customer Inward Payments, Collections' },
  JOURNAL: { label: 'Journal', key: 'F7', prefix: 'JRN-', color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/30', desc: 'Provisions, Adjustments, Depreciation' },
  SALES: { label: 'Sales', key: 'F8', prefix: 'SLS-', color: 'text-amber-600 bg-amber-500/10 border-amber-500/30', desc: 'Tax Invoices, Credit Sales' },
  PURCHASE: { label: 'Purchase', key: 'F9', prefix: 'PUR-', color: 'text-purple-600 bg-purple-500/10 border-purple-500/30', desc: 'Vendor Inward Supplies, Purchases' },
};

export default function JournalAutomationPage() {
  const { data: profilesData } = useGetProfilesQuery();
  const profiles = profilesData?.data || [];
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucherType, setSelectedVoucherType] = useState<VoucherType>('JOURNAL');

  // New Journal Entry Form State
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [entryNumber, setEntryNumber] = useState<string>(`JRN-${Date.now().toString().slice(-6)}`);
  const [narration, setNarration] = useState<string>('');
  const [lines, setLines] = useState<JournalLine[]>([
    { id: '1', accountName: '', debit: 0, credit: 0 },
    { id: '2', accountName: '', debit: 0, credit: 0 }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectVoucherType = (type: VoucherType) => {
    setSelectedVoucherType(type);
    const prefix = VOUCHER_CONFIG[type].prefix;
    setEntryNumber(`${prefix}${Date.now().toString().slice(-6)}`);
  };

  // Keyboard shortcut listener for F4, F5, F6, F7, F8, F9
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F4') {
        e.preventDefault();
        handleSelectVoucherType('CONTRA');
        if (!isModalOpen) setIsModalOpen(true);
      } else if (e.key === 'F5') {
        e.preventDefault();
        handleSelectVoucherType('PAYMENT');
        if (!isModalOpen) setIsModalOpen(true);
      } else if (e.key === 'F6') {
        e.preventDefault();
        handleSelectVoucherType('RECEIPT');
        if (!isModalOpen) setIsModalOpen(true);
      } else if (e.key === 'F7') {
        e.preventDefault();
        handleSelectVoucherType('JOURNAL');
        if (!isModalOpen) setIsModalOpen(true);
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleSelectVoucherType('SALES');
        if (!isModalOpen) setIsModalOpen(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleSelectVoucherType('PURCHASE');
        if (!isModalOpen) setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const activeClientId = selectedClientId || profiles[0]?.clientId || '';
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fintecc-backend.vercel.app/api/v1';

  const fetchEntries = async () => {
    if (!activeClientId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/erp/journal-entries`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEntries(data.data || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [activeClientId]);

  const addLine = () => {
    setLines([...lines, { id: String(Date.now()), accountName: '', debit: 0, credit: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof JournalLine, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleCreateAndPost = async (pushToTally: boolean = false) => {
    if (!isBalanced) {
      alert('Debit total must equal Credit total before posting.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Create Journal Entry
      const createRes = await fetch(`${API_BASE}/erp/journal-entries`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          clientId: activeClientId,
          entryDate,
          entryNumber,
          narration,
          lines: lines.map(l => ({
            accountName: l.accountName,
            debitAmount: l.debit,
            creditAmount: l.credit
          }))
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.message || 'Failed to create journal');

      const entryId = createData.data?.id;

      // 2. Post
      if (entryId) {
        await fetch(`${API_BASE}/erp/journal-entries/${entryId}/post`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
        });

        // 3. Queue to Tally if requested
        if (pushToTally) {
          await fetch(`${API_BASE}/erp/journal-entries/${entryId}/queue-tally`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
          });
        }
      }

      alert(pushToTally ? 'Journal posted & queued to Tally Prime!' : 'Journal posted successfully!');
      setIsModalOpen(false);
      fetchEntries();
    } catch (err: any) {
      alert(err.message || 'Error saving journal entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQueueTally = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/erp/journal-entries/${id}/queue-tally`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to queue to Tally');
      alert('Journal successfully queued for local Tally connector!');
    } catch (e: any) {
      alert(e.message || 'Error queueing to Tally');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-1">
            <span>Accounting Automation</span>
            <span>/</span>
            <span className="text-[var(--color-text-heading)] font-medium">Journal Entries</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-heading)]">
            Journal Entry Automation
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Double-entry ledger posting with real-time balance validation and Tally Prime sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tally Prime Voucher Quick Switcher Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            {(Object.keys(VOUCHER_CONFIG) as VoucherType[]).map((type) => {
              const cfg = VOUCHER_CONFIG[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    handleSelectVoucherType(type);
                    setIsModalOpen(true);
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all border ${cfg.color} hover:brightness-95`}
                >
                  <kbd className="font-mono text-[10px] font-bold">{cfg.key}</kbd>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          <select
            value={activeClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="text-xs py-2 pl-3 pr-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-heading)] font-medium"
          >
            {profiles.length === 0 ? (
              <option value="">No Client Profiles</option>
            ) : (
              <>
                <option value="">Select Client Entity...</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.clientId}>
                    {p.legalName || p.tradeName} ({p.gstin})
                  </option>
                ))}
              </>
            )}
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Voucher
          </Button>
        </div>
      </div>

      {/* Entries List */}
      <div
        className="p-5 rounded-2xl border space-y-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xs text-[var(--color-text-heading)]">
            Posted Journals ({entries.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEntries}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Entry #</th>
                <th className="p-3 font-semibold">Narration</th>
                <th className="p-3 font-semibold text-right">Debit (₹)</th>
                <th className="p-3 font-semibold text-right">Credit (₹)</th>
                <th className="p-3 font-semibold text-center">Status</th>
                <th className="p-3 font-semibold text-center">Tally Push</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">Loading entries...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">No journal entries found.</td></tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                  >
                    <td className="p-3 font-mono">{entry.entryDate}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {entry.entryNumber}
                    </td>
                    <td className="p-3 text-[var(--color-text-secondary)]">{entry.narration || 'General Journal'}</td>
                    <td className="p-3 text-right font-mono font-semibold">
                      ₹{Number(entry.totalDebit || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold">
                      ₹{Number(entry.totalCredit || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> {entry.status || 'POSTED'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleQueueTally(entry.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline"
                      >
                        <Send className="w-3 h-3" /> Push to Tally
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Journal Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-2xl rounded-2xl border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-[var(--color-text-heading)]">
                  Create Accounting Voucher — {VOUCHER_CONFIG[selectedVoucherType].label} ({VOUCHER_CONFIG[selectedVoucherType].key})
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Tally Prime Voucher Type Switcher */}
            <div className="space-y-1.5 p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[var(--color-text-heading)]">Voucher Type (F4 – F9)</span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                  {VOUCHER_CONFIG[selectedVoucherType].desc}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {(Object.keys(VOUCHER_CONFIG) as VoucherType[]).map((type) => {
                  const cfg = VOUCHER_CONFIG[type];
                  const isSelected = selectedVoucherType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelectVoucherType(type)}
                      className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? `${cfg.color} ring-2 ring-indigo-500/30 font-bold shadow-sm`
                          : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)]'
                      }`}
                    >
                      <kbd className="font-mono text-[10px] font-bold">{cfg.key}</kbd>
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Voucher Date</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Voucher Number</label>
                <input
                  type="text"
                  value={entryNumber}
                  onChange={(e) => setEntryNumber(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-mono"
                />
              </div>
            </div>

            {/* Lines Table */}
            <div className="space-y-2">
              <label className="block font-semibold text-xs">Voucher Particulars (Debit / Credit Lines)</label>
              <div className="rounded-xl border border-[var(--color-border)] overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                      <th className="p-2.5 font-semibold">Particulars / Account Name</th>
                      <th className="p-2.5 font-semibold w-28 text-right">Debit (₹)</th>
                      <th className="p-2.5 font-semibold w-28 text-right">Credit (₹)</th>
                      <th className="p-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, idx) => (
                      <tr key={l.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="e.g. Rent Expense, HDFC Bank, Acme Corp"
                            value={l.accountName}
                            onChange={(e) => updateLine(idx, 'accountName', e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={l.debit || ''}
                            onChange={(e) => {
                              updateLine(idx, 'debit', parseFloat(e.target.value) || 0);
                              if (parseFloat(e.target.value) > 0) updateLine(idx, 'credit', 0);
                            }}
                            className="w-full text-right font-mono px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={l.credit || ''}
                            onChange={(e) => {
                              updateLine(idx, 'credit', parseFloat(e.target.value) || 0);
                              if (parseFloat(e.target.value) > 0) updateLine(idx, 'debit', 0);
                            }}
                            className="w-full text-right font-mono px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] focus:outline-none"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => removeLine(idx)}
                            className="text-slate-400 hover:text-rose-500"
                            disabled={lines.length <= 2}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold" style={{ background: 'var(--color-bg-subtle)' }}>
                      <td className="p-2.5">
                        <Button variant="outline" size="sm" onClick={addLine} leftIcon={<Plus className="w-3 h-3" />}>
                          Add Line
                        </Button>
                      </td>
                      <td className="p-2.5 text-right font-mono">₹{totalDebit.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono">₹{totalCredit.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {!isBalanced && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>Unbalanced: Difference is ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="text-xs">
              <label className="block font-semibold mb-1">Narration</label>
              <textarea
                rows={2}
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Enter voucher narration notes..."
                className="w-full px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--color-border)]">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCreateAndPost(false)}
                disabled={!isBalanced}
                isLoading={isSaving}
              >
                Post to ERP
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
                onClick={() => handleCreateAndPost(true)}
                disabled={!isBalanced}
                isLoading={isSaving}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Post & Push to Tally
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

