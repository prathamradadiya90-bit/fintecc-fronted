import React from 'react';

interface CalculatorTabsProps {
  activeCalculator: 'EMI' | 'SIP' | 'SWP';
  onChange: (calculator: 'EMI' | 'SIP' | 'SWP') => void;
}

export function CalculatorTabs({ activeCalculator, onChange }: CalculatorTabsProps) {
  const tabs = [
    { id: 'EMI', label: 'EMI Calculator' },
    { id: 'SIP', label: 'SIP Calculator' },
    { id: 'SWP', label: 'SWP Calculator' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id as 'EMI' | 'SIP' | 'SWP')}
          className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all flex items-center gap-2 ${
            activeCalculator === tab.id
              ? 'text-[#00C2B3] bg-[#00C2B3]/10'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
