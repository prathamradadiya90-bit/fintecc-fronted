'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CALCULATORS_LIST, CALCULATOR_CATEGORIES } from '@/lib/constants/calculatorRegistry';
import { CalculatorRenderer } from '@/components/calculators/CalculatorRenderer';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';
import { ExternalLink, Search, X, Sparkles } from 'lucide-react';

export default function DashboardCalculatorsPage() {
  const [selectedSlug, setSelectedSlug] = useState('emi-calculator');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCalc = CALCULATORS_LIST.find((c) => c.slug === selectedSlug) || CALCULATORS_LIST[0];

  const filteredCalculators = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return CALCULATORS_LIST.filter((calc) => {
      const matchesCategory = activeCategory === 'All' || calc.category === activeCategory;
      const matchesSearch =
        !q ||
        calc.name.toLowerCase().includes(q) ||
        (calc.shortName && calc.shortName.toLowerCase().includes(q)) ||
        calc.description.toLowerCase().includes(q) ||
        calc.keywords.some((k) => k.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#00C2B3]/10 text-[#00C2B3]">
              Fintecc Financial Suite
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
            Financial & Tax Calculators
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Quick tools for loan planning, wealth forecasting, GST delay interest, and Old vs New tax regime advisory.
          </p>
        </div>

        <Link
          href="/calculators"
          target="_blank"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[#00C2B3]/10"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            color: '#00C2B3',
          }}
        >
          <span>Public Hub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Search Input Bar for Dashboard */}
      <div className="mb-5 relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-[#00C2B3]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Quick search any calculator (e.g., GST Interest, Income Tax, SIP, PPF, Gratuity, Car Loan)..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#00C2B3] shadow-sm"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategory('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeCategory === 'All'
              ? 'bg-[#00C2B3] text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
          style={
            activeCategory !== 'All'
              ? { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }
              : {}
          }
        >
          All ({CALCULATORS_LIST.length})
        </button>

        {CALCULATOR_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeCategory === cat
                ? 'bg-[#00C2B3] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            style={
              activeCategory !== cat
                ? { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }
                : {}
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quick Calculator Selector Grid */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none no-scrollbar">
        {filteredCalculators.length === 0 ? (
          <div className="py-2 px-4 text-xs text-slate-500 italic">
            No calculators matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredCalculators.map((calc) => {
            const isActive = selectedSlug === calc.slug;
            return (
              <button
                key={calc.slug}
                type="button"
                onClick={() => setSelectedSlug(calc.slug)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#00C2B3] text-white shadow-sm ring-2 ring-[#00C2B3]/30'
                    : 'text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
                style={
                  !isActive
                    ? { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }
                    : {}
                }
              >
                <CalculatorIcon name={calc.iconName} className="w-3.5 h-3.5" />
                <span>{calc.shortName || calc.name}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Active Calculator Header */}
      <div
        className="p-5 rounded-2xl mb-6 flex items-center justify-between gap-4"
        style={{
          background: 'var(--color-bg-subtle)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'var(--color-bg-card)',
              color: '#00C2B3',
              border: '1px solid var(--color-border)',
            }}
          >
            <CalculatorIcon name={selectedCalc.iconName} className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {selectedCalc.name}
            </h2>
            <p className="text-xs line-clamp-1" style={{ color: 'var(--color-text-secondary)' }}>
              {selectedCalc.description}
            </p>
          </div>
        </div>

        <Link
          href={`/calculators/${selectedCalc.slug}`}
          target="_blank"
          className="text-xs font-semibold text-[#00C2B3] hover:underline shrink-0 hidden sm:inline-flex items-center gap-1"
        >
          <span>Shareable URL</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Active Calculator Component */}
      <CalculatorRenderer slug={selectedSlug} />
    </div>
  );
}
