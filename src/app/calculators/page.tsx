'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layouts/PublicNavbar';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { CalculatorCard } from '@/components/calculators/CalculatorCard';
import { CALCULATOR_CATEGORIES, CALCULATORS_LIST } from '@/lib/constants/calculatorRegistry';
import { CalculatorCategory } from '@/lib/types/calculator.types';
import { Search, Sparkles, X, Calculator, ArrowRight } from 'lucide-react';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';

const QUICK_TAGS = [
  'Income Tax',
  'SIP',
  'PPF',
  'GST',
  'EPF / PF',
  'Gratuity',
  'EMI',
  'Salary',
  'FD',
  'LTCG',
];

export default function PublicCalculatorsHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<CalculatorCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter calculators by category and search query
  const filteredCalculators = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return CALCULATORS_LIST.filter((calc) => {
      const matchesCategory = selectedCategory === 'All' || calc.category === selectedCategory;
      const matchesSearch =
        !q ||
        calc.name.toLowerCase().includes(q) ||
        (calc.shortName && calc.shortName.toLowerCase().includes(q)) ||
        calc.description.toLowerCase().includes(q) ||
        calc.keywords.some((k) => k.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const popularCalculators = useMemo(() => {
    return CALCULATORS_LIST.filter((c) => c.popular);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#00C2B3] selection:text-white flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-10">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 mb-4 bg-[#00C2B3]/10 border border-[#00C2B3]/20 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#00C2B3]" />
            <span className="text-xs font-semibold text-[#00C2B3]">
              27 Free Financial & Tax Calculators
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#091124] dark:text-white tracking-tight leading-tight">
            Financial & Tax <span className="text-[#00C2B3]">Calculators</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm leading-relaxed max-w-xl mx-auto">
            Plan loans, simulate SIP mutual fund wealth, compare Old vs New Tax Regime, and calculate retirement savings with precision.
          </p>

          {/* Interactive Search Box with Dropdown Autocomplete */}
          <div className="mt-8 relative max-w-xl mx-auto z-20">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-[#00C2B3]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search calculators (e.g. SIP, Income Tax, FD, PPF, GST, Salary)..."
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#00C2B3] shadow-md"
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Auto-suggest Dropdown when typing */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-xl overflow-hidden text-left p-2 max-h-72 overflow-y-auto z-30"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {filteredCalculators.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No calculators match &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredCalculators.slice(0, 6).map((calc) => (
                    <Link
                      key={calc.slug}
                      href={`/calculators/${calc.slug}`}
                      className="flex items-center justify-between p-2.5 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: 'var(--color-bg-subtle)',
                            color: '#00C2B3',
                          }}
                        >
                          <CalculatorIcon name={calc.iconName} className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                            {calc.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {calc.category}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Quick search tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Quick search:</span>
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(tag)}
                  className="text-[11px] px-2.5 py-0.5 rounded-full transition-colors text-slate-600 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 hover:bg-[#00C2B3]/20 hover:text-[#00C2B3]"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none no-scrollbar justify-start md:justify-center">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-[#00C2B3] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            style={
              selectedCategory !== 'All'
                ? { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }
                : {}
            }
          >
            All Calculators ({CALCULATORS_LIST.length})
          </button>

          {CALCULATOR_CATEGORIES.map((cat) => {
            const count = CALCULATORS_LIST.filter((c) => c.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#00C2B3] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                style={
                  !isSelected
                    ? { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }
                    : {}
                }
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Popular Section (Only when viewing All and no search) */}
        {selectedCategory === 'All' && !searchQuery && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#00C2B3]" />
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Most Popular Calculators
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCalculators.slice(0, 6).map((calc) => (
                <CalculatorCard key={calc.slug} calculator={calc} />
              ))}
            </div>
          </div>
        )}

        {/* All / Filtered Grid Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {selectedCategory === 'All' ? 'All Calculators' : `${selectedCategory} Calculators`}
              <span className="text-xs font-normal text-slate-500 ml-2">
                ({filteredCalculators.length} {filteredCalculators.length === 1 ? 'result' : 'results'})
              </span>
            </h2>

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs font-semibold text-[#00C2B3] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {filteredCalculators.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center my-6 flex flex-col items-center justify-center"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px dashed var(--color-border)',
              }}
            >
              <Calculator className="w-12 h-12 text-slate-400 mb-3" />
              <h3 className="text-base font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                No calculators match &quot;{searchQuery}&quot;
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                We couldn&apos;t find any calculator matching your query. Try clicking one of the popular tags like Income Tax, SIP, PPF, or GST.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00C2B3] text-white"
                >
                  Clear Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCalculators.map((calc) => (
                <CalculatorCard key={calc.slug} calculator={calc} />
              ))}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
