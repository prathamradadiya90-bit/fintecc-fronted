'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Home, Sparkles, ArrowLeft, Search } from 'lucide-react';
import { CalculatorMeta } from '@/lib/types/calculator.types';
import { CALCULATORS_LIST } from '@/lib/constants/calculatorRegistry';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';
import { CalculatorSearchModal } from '@/components/calculators/CalculatorSearchModal';

interface CalculatorShellProps {
  calculator: CalculatorMeta;
  children: React.ReactNode;
  faqs?: Array<{ question: string; answer: string }>;
}

export function CalculatorShell({ calculator, children, faqs = [] }: CalculatorShellProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Get other calculators in same category for quick navigation
  const relatedCalculators = CALCULATORS_LIST.filter(
    (c) => c.category === calculator.category && c.slug !== calculator.slug
  ).slice(0, 4);

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb Navigation & Quick Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <Link href="/" className="flex items-center gap-1 hover:text-[#00C2B3] transition-colors">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/calculators" className="hover:text-[#00C2B3] transition-colors">
            Calculators
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold truncate max-w-[180px] sm:max-w-none" style={{ color: 'var(--color-text-primary)' }}>
            {calculator.name}
          </span>
        </nav>

        {/* Quick Search Button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Search className="w-3.5 h-3.5 text-[#00C2B3]" />
          <span>Switch calculator (Ctrl+K)</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--color-bg-subtle)',
                color: '#00C2B3',
                border: '1px solid var(--color-border)',
              }}
            >
              <CalculatorIcon name={calculator.iconName} className="w-5 h-5" />
            </div>
            <span
              className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md"
              style={{
                background: 'var(--color-bg-subtle)',
                color: 'var(--color-text-muted)',
              }}
            >
              {calculator.category}
            </span>
            {calculator.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {calculator.badge}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--color-text-heading)' }}>
            {calculator.name}
          </h1>
          <p className="text-sm mt-1 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
            {calculator.description}
          </p>
        </div>

        <Link
          href="/calculators"
          className="self-start md:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Calculators</span>
        </Link>
      </div>

      {/* Main Calculator Content */}
      <div className="w-full">
        {children}
      </div>

      {/* Related Calculators in the same category */}
      {relatedCalculators.length > 0 && (
        <div
          className="rounded-2xl p-6 shadow-sm mt-4"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00C2B3]" />
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                More {calculator.category} Calculators
              </h2>
            </div>
            <Link
              href="/calculators"
              className="text-xs font-semibold text-[#00C2B3] hover:underline"
            >
              View all 27 calculators &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedCalculators.map((rel) => (
              <Link
                key={rel.slug}
                href={`/calculators/${rel.slug}`}
                className="group p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: 'var(--color-bg-card)',
                      color: '#00C2B3',
                    }}
                  >
                    <CalculatorIcon name={rel.iconName} className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      className="text-xs font-bold group-hover:text-[#00C2B3] transition-colors line-clamp-1"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {rel.shortName || rel.name}
                    </h3>
                    <p
                      className="text-[11px] line-clamp-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {rel.category}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Frequently Asked Questions / Tax Notes */}
      {faqs.length > 0 && (
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="pb-4"
                style={{
                  borderBottom: idx !== faqs.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-on-card)' }}>
                  {faq.question}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calculator Search Modal */}
      <CalculatorSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
