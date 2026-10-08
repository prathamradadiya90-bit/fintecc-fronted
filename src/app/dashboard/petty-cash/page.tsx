'use client';

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Calendar,
  Search,
  DollarSign,
  Receipt,
  X,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  useGetPettyCashEntriesQuery,
  useCreatePettyCashEntryMutation,
  useDeletePettyCashEntryMutation,
} from '@/lib/store/api/pettyCashApi';
import type { PettyCashEntry } from '@/lib/types/petty-cash.types';

export default function PettyCashPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [entryType, setEntryType] = useState<'OUT' | 'IN'>('OUT');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: response, isLoading, refetch } = useGetPettyCashEntriesQuery();
  const [createEntry, { isLoading: isCreating }] = useCreatePettyCashEntryMutation();
  const [deleteEntry] = useDeletePettyCashEntryMutation();

  const entries = response?.data || [];

  // Sort chronological for balance calculation if needed, or by newest first
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return sortedEntries;
    const term = searchTerm.toLowerCase();
    return sortedEntries.filter((e) => e.description.toLowerCase().includes(term));
  }, [sortedEntries, searchTerm]);

  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;

    entries.forEach((e) => {
      totalIn += Number(e.amountIn) || 0;
      totalOut += Number(e.amountOut) || 0;
    });

    const netBalance = totalIn - totalOut;

    return {
      netBalance,
      totalIn,
      totalOut,
      count: entries.length,
    };
  }, [entries]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('Description is required', 'error');
      return;
    }

    try {
      const amountIn = entryType === 'IN' ? parsedAmount : 0;
      const amountOut = entryType === 'OUT' ? parsedAmount : 0;
      const newBalance = stats.netBalance + amountIn - amountOut;

      await createEntry({
        date: new Date(date).toISOString(),
        description: description.trim(),
        amountIn,
        amountOut,
        balance: newBalance,
      }).unwrap();

      showToast(
        entryType === 'IN' ? 'Cash deposit recorded' : 'Cash expense recorded',
        'success'
      );
      setIsModalOpen(false);
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to record entry', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this petty cash transaction?')) return;
    try {
      await deleteEntry(id).unwrap();
      showToast('Transaction removed', 'info');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete transaction', 'error');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] border border-[#4A6FA5]/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1E2A38] dark:text-slate-100">
              Petty Cash Book
            </h1>
            <p className="text-xs text-[#5A6E85] dark:text-slate-400">
              Daily physical cash register, disbursements, vouchers, and office replenishment
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white flex items-center space-x-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Record Transaction</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5A6E85] dark:text-slate-400">Cash On Hand</span>
            <div
              className={`text-xl font-bold mt-0.5 ${
                stats.netBalance >= 0 ? 'text-[#3D7A64]' : 'text-[#9E4A4A]'
              }`}
            >
              ₹{stats.netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#3D7A64]/10 text-[#3D7A64] flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5A6E85] dark:text-slate-400">Total Deposits (In)</span>
            <div className="text-xl font-bold text-[#3D7A64] mt-0.5">
              ₹{stats.totalIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#3D7A64]/10 text-[#3D7A64] flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5A6E85] dark:text-slate-400">Total Expenses (Out)</span>
            <div className="text-xl font-bold text-[#9E4A4A] mt-0.5">
              ₹{stats.totalOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#9E4A4A]/10 text-[#9E4A4A] flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5A6E85] dark:text-slate-400">Entries Logged</span>
            <div className="text-xl font-bold text-[#1E2A38] dark:text-slate-100 mt-0.5">
              {stats.count}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2B42]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search descriptions, tea, postage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-[#1E2B42] overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16">
            <Wallet className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1E2A38] dark:text-slate-200">
              No petty cash entries recorded
            </p>
            <p className="text-xs text-[#5A6E85] dark:text-slate-400 mt-1 max-w-sm mx-auto mb-4">
              Track office daily expenses, tea/coffee, courier receipts, or replenish cash in hand.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white text-xs"
            >
              Record First Entry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F7F9FB] dark:bg-[#0C131F] text-[#5A6E85] dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description / Purpose</th>
                  <th className="py-3 px-4 text-right">Cash In (₹)</th>
                  <th className="py-3 px-4 text-right">Cash Out (₹)</th>
                  <th className="py-3 px-4">Logged By</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                    <td className="py-3 px-4 text-[#5A6E85] dark:text-slate-400 font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#1E2A38] dark:text-slate-200">
                        {item.description}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {Number(item.amountIn) > 0 ? (
                        <span className="font-semibold text-[#3D7A64] bg-[#3D7A64]/10 px-2 py-0.5 rounded">
                          +₹{Number(item.amountIn).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {Number(item.amountOut) > 0 ? (
                        <span className="font-semibold text-[#9E4A4A] bg-[#9E4A4A]/10 px-2 py-0.5 rounded">
                          -₹{Number(item.amountOut).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#5A6E85] dark:text-slate-400">
                      {item.loggedBy?.name || 'Firm Admin'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-slate-400 hover:text-[#9E4A4A] transition"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-[#1E2B42] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-semibold text-[#1E2A38] dark:text-slate-100">
                Record Cash Transaction
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntryType('OUT')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition flex items-center justify-center space-x-1.5 ${
                      entryType === 'OUT'
                        ? 'bg-[#9E4A4A] text-white border-[#9E4A4A]'
                        : 'bg-white dark:bg-[#0C131F] text-[#5A6E85] border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Cash Expense (Out)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType('IN')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition flex items-center justify-center space-x-1.5 ${
                      entryType === 'IN'
                        ? 'bg-[#3D7A64] text-white border-[#3D7A64]'
                        : 'bg-white dark:bg-[#0C131F] text-[#5A6E85] border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Deposit / Top-up (In)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 250.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2A38] dark:text-slate-200 mb-1.5">
                  Description / Purpose <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Office courier to client, stationery pens"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isCreating}
                  className="bg-[#4A6FA5] hover:bg-[#3D5C8A] text-white"
                >
                  {isCreating ? 'Saving...' : 'Record Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
