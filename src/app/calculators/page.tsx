'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layouts/PublicNavbar';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { CalculatorCard } from '@/components/calculators/CalculatorCard';
import { CALCULATOR_CATEGORIES, CALCULATORS_LIST } from '@/lib/constants/calculatorRegistry';
import { CalculatorCategory } from '@/lib/types/calculator.types';
import { Search, TrendingUp, X, Calculator, ArrowRight } from 'lucide-react';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';

export default function CalculatorsDirectoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<CalculatorCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter calculators by search & category
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#4A6FA5] selection:text-white flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Streamlined Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 rounded-full">
            <Calculator className="w-3.5 h-3.5 text-[#4A6FA5]" />
            <span className="text-xs font-semibold text-[#4A6FA5]">
              CA & Statutory Practice Suite (27 Tools)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1E2A38] dark:text-white mb-2.5">
            Financial & Tax <span className="text-[#4A6FA5]">Calculators</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Statutory tax, payroll, and corporate financial tools tailored for Indian Chartered Accountants, tax practitioners, and corporate advisors.
          </p>

          {/* Compact Clean Search Box */}
          <div className="mt-5 relative max-w-lg mx-auto z-20">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-[#4A6FA5]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search calculators (e.g. Income Tax, GST, Gratuity, LTCG, Salary)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:border-[#4A6FA5] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Auto-suggest Dropdown when typing */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-lg overflow-hidden text-left p-1.5 max-h-72 overflow-y-auto z-30"
              >
                {filteredCalculators.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No calculators match &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredCalculators.slice(0, 6).map((calc) => (
                    <Link
                      key={calc.slug}
                      href={`/calculators/${calc.slug}`}
                      className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center shrink-0">
                          <CalculatorIcon name={calc.iconName} className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-[var(--color-text-primary)]">
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
          </div>
        </div>

        {/* Clean Category Filter Tabs - CA First */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none no-scrollbar justify-start sm:justify-center">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#4A6FA5] text-white'
                : 'text-slate-600 dark:text-slate-400 border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Tools ({CALCULATORS_LIST.length})
          </button>

          {CALCULATOR_CATEGORIES.map((cat) => {
            const count = CALCULATORS_LIST.filter((c) => c.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#4A6FA5] text-white'
                    : 'text-slate-600 dark:text-slate-400 border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Essential CA Practice Tools Section (Only when viewing All and no search) */}
        {selectedCategory === 'All' && !searchQuery && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3.5">
              <TrendingUp className="w-4 h-4 text-[#4A6FA5]" />
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]">
                Essential CA Practice Calculators
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {popularCalculators.slice(0, 6).map((calc) => (
                <CalculatorCard key={calc.slug} calculator={calc} />
              ))}
            </div>
          </div>
        )}

        {/* All / Filtered Grid Section */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]">
              {selectedCategory === 'All' ? 'Complete Calculator Directory' : `${selectedCategory} Calculators`}
              <span className="text-xs font-normal text-slate-500 ml-2">
                ({filteredCalculators.length} {filteredCalculators.length === 1 ? 'tool' : 'tools'})
              </span>
            </h2>

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs font-semibold text-[#4A6FA5] hover:underline cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>

          {filteredCalculators.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center my-4 flex flex-col items-center justify-center border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]"
            >
              <Calculator className="w-10 h-10 text-slate-400 mb-2.5" />
              <h3 className="text-sm font-bold mb-1 text-[var(--color-text-primary)]">
                No calculators match &quot;{searchQuery}&quot;
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-3">
                Try searching for Income Tax, GST, Gratuity, LTCG, or Salary.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#4A6FA5] text-white cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
