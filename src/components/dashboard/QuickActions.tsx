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
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link 
              key={action.title} 
              href={action.href}
              className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group"
            >
              <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${action.colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-slate-800 group-hover:text-slate-900">
                  {action.title}
                </h4>
                <p className="text-[12px] text-slate-500 mt-0.5">
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
