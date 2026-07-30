import React from 'react';

const LOAN_TYPES = [
  'Home Loan',
  'Personal Loan',
  'Business Loan',
  'Car Loan',
  'Education Loan',
  'Gold Loan'
];

interface LoanTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function LoanTabs({ activeTab, onTabChange }: LoanTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6 border-b border-slate-200">
      {LOAN_TYPES.map((type) => {
        const isActive = activeTab === type;
        return (
          <button
            key={type}
            onClick={() => onTabChange(type)}
            className={`
              whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2
              ${isActive 
                ? 'border-[#00C2B3] text-[#00C2B3]' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}
            `}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}
