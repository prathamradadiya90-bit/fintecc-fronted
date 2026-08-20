import React, { useState, useEffect } from 'react';
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
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  // Keep local state in sync when value changes externally (e.g. range slider)
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setInputValue(value.toString());
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    let parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      parsed = min;
    }
    const clamped = Math.max(min, Math.min(max, parsed));
    onChange(clamped);
    setInputValue(clamped.toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits and at most one decimal point
    const cleanVal = val.replace(/[^0-9.]/g, '');
    const parts = cleanVal.split('.');
    const formattedVal = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
    
    setInputValue(formattedVal);

    const parsed = parseFloat(formattedVal);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  // Clamped percentage to prevent slider fill going out of bounds when typing raw values
  const percentage = ((Math.max(min, Math.min(max, value)) - min) / (max - min)) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-3">
        <label className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</label>
        <input 
          type="text"
          value={isFocused ? inputValue : formatValue(value)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="text-right text-base font-bold bg-transparent outline-none border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-[#00C2B3] focus:bg-[var(--color-bg-skeleton)] rounded px-2 py-0.5 w-32 transition-all cursor-pointer focus:cursor-text"
          style={{ color: 'var(--color-text-primary)' }}
        />
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
          value={Math.max(min, Math.min(max, value))} 
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

