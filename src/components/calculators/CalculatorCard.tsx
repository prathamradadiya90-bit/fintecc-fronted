import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CalculatorMeta } from '@/lib/types/calculator.types';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';

interface CalculatorCardProps {
  calculator: CalculatorMeta;
}

export function CalculatorCard({ calculator }: CalculatorCardProps) {
  return (
    <Link
      href={`/calculators/${calculator.slug}`}
      className="group relative flex flex-col justify-between p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div>
        {/* Top bar: Icon and Badge */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:bg-[#00C2B3]/20"
            style={{
              background: 'var(--color-bg-subtle)',
              color: '#00C2B3',
              border: '1px solid var(--color-border)',
            }}
          >
            <CalculatorIcon name={calculator.iconName} className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-2">
            {calculator.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {calculator.badge}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-base font-bold mb-2 group-hover:text-[#00C2B3] transition-colors line-clamp-1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {calculator.name}
        </h3>

        {/* Category Pill */}
        <span
          className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2"
          style={{
            background: 'var(--color-bg-subtle)',
            color: 'var(--color-text-muted)',
          }}
        >
          {calculator.category}
        </span>

        {/* Description */}
        <p
          className="text-sm leading-relaxed line-clamp-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {calculator.description}
        </p>
      </div>

      {/* Footer Link */}
      <div
        className="flex items-center justify-between pt-4 mt-4 text-sm font-semibold transition-colors"
        style={{
          borderTop: '1px solid var(--color-border)',
          color: '#00C2B3',
        }}
      >
        <span>Calculate now</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
