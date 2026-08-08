import React from 'react';
import { formatCurrency } from '@/lib/utils/loanCalculator';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  minLabel?: string;
  maxLabel?: string;
}

export function SliderInput({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  onChange, 
  formatValue = (v) => v.toString(),
  minLabel,
  maxLabel
}: SliderInputProps) {
  
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-3">
        <label className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</label>
        <div className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {formatValue(value)}
        </div>
      </div>
      
      <div className="relative h-6 flex items-center">
        {/* Custom Track Background with border */}
        <div className="absolute w-full h-1.5 rounded-full" style={{ background: 'var(--color-bg-skeleton)', border: '1px solid var(--color-border)' }} />
        {/* Custom Track Fill */}
        <div 
          className="absolute h-1.5 bg-[#00C2B3] rounded-full pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
        {/* Native Range Input (Transparent) */}
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer z-10 focus:outline-none
                     [&::-webkit-slider-thumb]:appearance-none 
                     [&::-webkit-slider-thumb]:w-4 
                     [&::-webkit-slider-thumb]:h-4 
                     [&::-webkit-slider-thumb]:bg-slate-500 
                     [&::-webkit-slider-thumb]:border-2
                     [&::-webkit-slider-thumb]:border-white
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:shadow-md
                     [&::-webkit-slider-thumb]:transition-colors
                     active:[&::-webkit-slider-thumb]:bg-slate-700
                     
                     [&::-moz-range-thumb]:w-4 
                     [&::-moz-range-thumb]:h-4 
                     [&::-moz-range-thumb]:bg-slate-500 
                     [&::-moz-range-thumb]:border-2
                     [&::-moz-range-thumb]:border-white
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:shadow-md
                     [&::-moz-range-thumb]:transition-colors
                     active:[&::-moz-range-thumb]:bg-slate-700"
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{minLabel || formatValue(min)}</span>
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{maxLabel || formatValue(max)}</span>
      </div>
    </div>
  );
}
