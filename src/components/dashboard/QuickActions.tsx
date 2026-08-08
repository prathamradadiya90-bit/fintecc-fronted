import React from 'react';
import { Plus, FileText, Calculator } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      title: 'Add New Client',
      description: 'Create a new client profile',
      icon: Plus,
      href: '/dashboard/my-clients?action=new',
      colorClass: 'bg-indigo-500 text-white hover:bg-indigo-600',
    },
    {
      title: 'Convert PDF',
      description: 'Extract data to XML',
      icon: FileText,
      href: '/dashboard/converters',
      colorClass: 'bg-[#00C2B3] text-white hover:bg-[#00a89b]',
    },
    {
      title: 'Loan Calculator',
      description: 'Calculate EMIs instantly',
      icon: Calculator,
      href: '/dashboard/loan-calculator',
      colorClass: 'bg-amber-500 text-white hover:bg-amber-600',
    },
  ];

  return (
    <div
      className="rounded-2xl p-5 shadow-sm"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <h3
        className="text-sm font-semibold mb-4 uppercase tracking-wider"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link 
              key={action.title} 
              href={action.href}
              className="flex items-center gap-4 p-3 rounded-xl transition-all group"
              style={{ border: '1px solid var(--color-border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-card-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${action.colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4
                  className="text-[14px] font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {action.title}
                </h4>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
