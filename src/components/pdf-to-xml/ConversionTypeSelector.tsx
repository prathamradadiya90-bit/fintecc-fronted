import React from 'react';
import { FileText, Landmark, Receipt, FileSpreadsheet, PieChart, FileCode2, CheckCircle2 } from 'lucide-react';

export type ConversionType = 'invoice' | 'bank' | 'itr' | 'salary' | 'balance' | 'custom';

interface ConversionTypeSelectorProps {
  selectedType: ConversionType;
  onSelect: (type: ConversionType) => void;
}

const CONVERSION_OPTIONS = [
  {
    id: 'invoice',
    title: 'Invoice to XML',
    description: 'GST invoices, purchase orders',
    icon: Receipt,
    disabled: false,
  },
  {
    id: 'bank',
    title: 'Bank Statement',
    description: 'All major Indian banks',
    icon: Landmark,
    disabled: false,
  }
] as const;

export function ConversionTypeSelector({ selectedType, onSelect }: ConversionTypeSelectorProps) {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-full bg-[#00C2B3] text-white flex items-center justify-center font-semibold text-xs">
          1
        </div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Select Conversion Type</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CONVERSION_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => !option.disabled && onSelect(option.id as ConversionType)}
              disabled={option.disabled}
              className={`
                relative flex items-start gap-3.5 p-4 rounded-xl text-left transition-all
                ${isSelected 
                  ? 'border-[#00C2B3] bg-[#00C2B3]/5 shadow-sm' 
                  : ''
                }
                ${option.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{
                border: `1px solid ${isSelected ? '#00C2B3' : 'var(--color-border)'}`,
              }}
              onMouseEnter={(e) => { if (!isSelected && !option.disabled) e.currentTarget.style.background = 'var(--color-bg-card-hover)'; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
            >
              <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-[#00C2B3]/10 text-[#00C2B3]' : ''}`} style={isSelected ? {} : { background: 'var(--color-bg-skeleton)', color: 'var(--color-text-secondary)' }}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[14px]" style={{ color: isSelected ? '#00C2B3' : 'var(--color-text-on-card)' }}>
                  {option.title}
                </h3>
                <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {option.description}
                </p>
              </div>

              {isSelected && (
                <div className="absolute top-2.5 right-2.5 text-[#00C2B3]">
                  <CheckCircle2 className="w-4 h-4 fill-[#00C2B3] text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
