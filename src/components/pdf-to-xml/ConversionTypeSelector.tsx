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
    disabled: true,
  },
  {
    id: 'bank',
    title: 'Bank Statement',
    description: 'All major Indian banks',
    icon: Landmark,
    disabled: false,
  },
  {
    id: 'itr',
    title: 'ITR Acknowledgement',
    description: 'Income Tax acknowledgement PDFs',
    icon: FileText,
    disabled: true,
  },
  {
    id: 'salary',
    title: 'Salary Slip to XML',
    description: 'Payslips & Form 16',
    icon: FileSpreadsheet,
    disabled: true,
  },
  {
    id: 'balance',
    title: 'Balance Sheet',
    description: 'Annual financial statements',
    icon: PieChart,
    disabled: true,
  },
  {
    id: 'custom',
    title: 'Custom / Other',
    description: 'Any structured financial PDF',
    icon: FileCode2,
    disabled: true,
  },
] as const;

export function ConversionTypeSelector({ selectedType, onSelect }: ConversionTypeSelectorProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-full bg-[#00C2B3] text-white flex items-center justify-center font-semibold text-xs">
          1
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Select Conversion Type</h2>
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
                relative flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all
                ${isSelected 
                  ? 'border-[#00C2B3] bg-[#00C2B3]/5 shadow-sm' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
                ${option.disabled ? 'opacity-60 cursor-not-allowed hover:border-slate-200 hover:bg-white' : 'cursor-pointer'}
              `}
            >
              <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-[#00C2B3]/10 text-[#00C2B3]' : 'bg-slate-100 text-slate-500'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-semibold text-[14px] ${isSelected ? 'text-[#008f84]' : 'text-slate-700'}`}>
                  {option.title}
                </h3>
                <p className="text-slate-500 text-[12px] mt-0.5 leading-relaxed">
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
