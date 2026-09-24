import React from 'react';
import { UserPlus, FileText, Calculator, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      title: 'Add New Client',
      description: 'Create a new client entity',
      icon: UserPlus,
      href: '/dashboard/my-clients?action=new',
      badge: 'Client',
      iconColor: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-[#003824]',
    },
    {
      title: 'Convert Statements',
      description: 'Automated OCR & Tally XML export',
      icon: FileText,
      href: '/dashboard/converters',
      badge: 'Fast OCR',
      iconColor: 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-[#003824]',
    },
    {
      title: 'CA Calculators',
      description: 'Income Tax, TDS & GST tools',
      icon: Calculator,
      href: '/dashboard/calculators',
      badge: 'FY 24-25',
      iconColor: 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-[#003824]',
    },
  ];

  return (
    <div
      className="rounded-xl p-5 shadow-xl"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="flex items-center justify-between mb-3 pb-2"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Quick Actions
        </h3>
        <span
          className="text-[11px] font-mono"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Frequently Used Workflows
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link 
              key={action.title} 
              href={action.href}
              className="flex items-center justify-between p-3.5 rounded-xl transition-all duration-150 group"
              style={{
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                e.currentTarget.style.background = 'var(--color-bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.background = 'var(--color-bg-subtle)';
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${action.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4
                      className="text-xs font-semibold group-hover:text-emerald-400 transition-colors truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {action.title}
                    </h4>
                  </div>
                  <p
                    className="text-[11px] truncate mt-0.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {action.description}
                  </p>
                </div>
              </div>
              <ArrowRight
                className="w-3.5 h-3.5 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                style={{ color: 'var(--color-text-muted)' }}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
