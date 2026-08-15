'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Calculator, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { CALCULATORS_LIST } from '@/lib/constants/calculatorRegistry';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';
import { CalculatorCategory } from '@/lib/types/calculator.types';

interface CalculatorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalculatorSearchModal({ isOpen, onClose }: CalculatorSearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<CalculatorCategory | 'All'>('All');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setSelectedIndex(0);
      setActiveCategory('All');
    }
  }, [isOpen]);

  // Filter calculators
  const filteredCalculators = useMemo(() => {
    const q = query.toLowerCase().trim();
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
  }, [query, activeCategory]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredCalculators.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCalculators.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCalculators[selectedIndex]) {
          const selected = filteredCalculators[selectedIndex];
          onClose();
          router.push(`/calculators/${selected.slug}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCalculators, onClose, router]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10 animate-in zoom-in-95 duration-200"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Search Input Bar */}
        <div
          className="flex items-center px-4 py-3.5 gap-3"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <Search className="w-5 h-5 text-[#00C2B3] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search financial & tax calculators (e.g., SIP, Income Tax, FD, PPF, GST)..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
            style={{ color: 'var(--color-text-primary)' }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Category Filter Tabs inside Search */}
        <div
          className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto no-scrollbar scrollbar-none text-xs"
          style={{
            background: 'var(--color-bg-subtle)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {(['All', 'Loans & EMI', 'Investments', 'Banking & Interest', 'Retirement & Savings', 'Tax & GST', 'General'] as const).map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#00C2B3] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[420px]"
        >
          {filteredCalculators.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <Calculator className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                No calculators found for &quot;{query}&quot;
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Try searching for EMI, SIP, Income Tax, PPF, NPS, FD, or GST.
              </p>
            </div>
          ) : (
            filteredCalculators.map((calc, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={calc.slug}
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(`/calculators/${calc.slug}`);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#00C2B3]/10 ring-1 ring-[#00C2B3]/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#00C2B3] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-[#00C2B3]'
                      }`}
                    >
                      <CalculatorIcon name={calc.iconName} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold truncate ${
                            isSelected ? 'text-[#00C2B3]' : ''
                          }`}
                          style={!isSelected ? { color: 'var(--color-text-primary)' } : {}}
                        >
                          {calc.name}
                        </span>
                        {calc.badge && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {calc.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs line-clamp-1 mt-0.5"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {calc.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className="hidden sm:inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded"
                      style={{
                        background: 'var(--color-bg-subtle)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {calc.category}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-[#00C2B3] translate-x-0.5' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info / keyboard help */}
        <div
          className="flex items-center justify-between px-4 py-2.5 text-[11px] text-slate-500"
          style={{
            background: 'var(--color-bg-subtle)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">↵</kbd>
              <span>to select</span>
            </span>
          </div>

          <span>{filteredCalculators.length} calculators found</span>
        </div>
      </div>
    </div>
  );
}
