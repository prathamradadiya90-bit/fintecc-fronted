'use client';

import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
  Sliders,
  X,
  Loader2,
  Tag,
  Hash,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  useGetLedgerMappingsQuery,
  useSaveLedgerMappingMutation,
} from '@/lib/store/api/bankStatementsApi';
import { STANDARD_TALLY_LEDGERS } from '@/components/bank-statements/CAReviewTable';

export function LedgerMappingRulesSettings() {
  const { showToast } = useToast();
  const { data: mappingsData, isLoading, refetch } = useGetLedgerMappingsQuery();
  const [saveLedgerMapping, { isLoading: isSaving }] = useSaveLedgerMappingMutation();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding rule
  const [narrationPattern, setNarrationPattern] = useState('');
  const [suggestedLedger, setSuggestedLedger] = useState(STANDARD_TALLY_LEDGERS[0]);
  const [customLedger, setCustomLedger] = useState('');
  const [matchType, setMatchType] = useState<'EXACT' | 'CONTAINS' | 'REGEX'>('CONTAINS');

  const rules = mappingsData?.data || [];

  const filteredRules = rules.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.narrationPattern.toLowerCase().includes(q) ||
      r.suggestedLedger.toLowerCase().includes(q) ||
      r.matchType.toLowerCase().includes(q)
    );
  });

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalLedger = customLedger.trim() || suggestedLedger;

    if (!narrationPattern.trim()) {
      showToast('Please enter a narration pattern or keyword', 'error');
      return;
    }
    if (!finalLedger) {
      showToast('Please select or specify a target ledger', 'error');
      return;
    }

    try {
      await saveLedgerMapping({
        narrationPattern: narrationPattern.trim(),
        suggestedLedger: finalLedger,
        matchType,
      }).unwrap();

      showToast(`Rule saved for "${narrationPattern}" → ${finalLedger}!`, 'success');
      setIsAddModalOpen(false);
      setNarrationPattern('');
      setCustomLedger('');
      refetch();
    } catch (err: any) {
      console.error('Failed to save mapping rule:', err);
      showToast(err?.data?.message || 'Failed to save rule', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div
        className="rounded-2xl p-5 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-teal-500/10 text-[#00C2B3]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Firm Auto-Mapping Rules
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Configure deterministic pattern rules that instantly map bank narrations to standard Tally ledgers with 100% confidence.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs"
        >
          Add Rule
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div
        className="rounded-2xl p-3 border shadow-xs flex items-center justify-between gap-3"
        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search pattern, keyword, or ledger..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
          />
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {filteredRules.length} rule{filteredRules.length === 1 ? '' : 's'} registered
        </span>
      </div>

      {/* Rules Table */}
      {isLoading ? (
        <div className="py-12 text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#00C2B3] mx-auto" />
          <p className="text-xs text-slate-400">Loading firm rules...</p>
        </div>
      ) : filteredRules.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center border shadow-xs space-y-3"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-[#00C2B3] mx-auto flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              No Mapping Rules Found
            </h4>
            <p className="text-xs max-w-sm mx-auto mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Create rules to match common vendor names (e.g. AWS, Swiggy, Uber) to your firm&apos;s preferred Tally ledgers.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Create First Rule
          </Button>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden border shadow-sm"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead
                className="text-[11px] uppercase tracking-wider font-semibold border-b"
                style={{
                  background: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <tr>
                  <th className="py-3 px-4">Narration Pattern</th>
                  <th className="py-3 px-4">Target Ledger</th>
                  <th className="py-3 px-4 text-center">Match Type</th>
                  <th className="py-3 px-4 text-center">Usage Count</th>
                  <th className="py-3 px-4 text-center">Confidence</th>
                  <th className="py-3 px-4 text-right">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-500/5 transition-colors">
                    {/* Pattern */}
                    <td className="py-3 px-4 font-mono font-medium text-xs" style={{ color: 'var(--color-text-primary)' }}>
                      &ldquo;{rule.narrationPattern}&rdquo;
                    </td>

                    {/* Ledger */}
                    <td className="py-3 px-4 font-semibold text-xs text-[#00C2B3]">
                      {rule.suggestedLedger}
                    </td>

                    {/* Match Type */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rule.matchType === 'EXACT'
                            ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {rule.matchType || 'EXACT'}
                      </span>
                    </td>

                    {/* Usage */}
                    <td className="py-3 px-4 text-center font-semibold text-slate-500">
                      {rule.usageCount || 0} times
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {rule.confidence || 100}%
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4 text-right text-[11px] text-slate-400 capitalize">
                      {rule.source || 'Manual'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl p-6 relative space-y-4 animate-scaleUp"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/10 text-[#00C2B3]">
                  <Brain className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Create Auto-Mapping Rule
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Narration Pattern or Keyword <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={narrationPattern}
                  onChange={(e) => setNarrationPattern(e.target.value)}
                  placeholder="e.g. AWS, Zomato, Rent, Uber"
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Match Type
                </label>
                <select
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
                >
                  <option value="CONTAINS">Contains (Sub-string search)</option>
                  <option value="EXACT">Exact (Full Narration match)</option>
                  <option value="REGEX">Regex Pattern</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Target Tally Ledger <span className="text-rose-500">*</span>
                </label>
                <select
                  value={suggestedLedger}
                  onChange={(e) => {
                    setSuggestedLedger(e.target.value);
                    setCustomLedger('');
                  }}
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
                >
                  {STANDARD_TALLY_LEDGERS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">
                  Or Custom Ledger Name (Optional)
                </label>
                <input
                  type="text"
                  value={customLedger}
                  onChange={(e) => setCustomLedger(e.target.value)}
                  placeholder="e.g. AWS Cloud Infrastructure Expense"
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00C2B3]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  className="text-xs"
                >
                  Save Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
