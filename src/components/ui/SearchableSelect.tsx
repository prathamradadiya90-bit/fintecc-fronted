'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, AlertCircle } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  metadata?: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  isLoading?: boolean;
  clearable?: boolean;
  className?: string;
  emptyMessage?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search by name, PAN, GSTIN...',
  label,
  error,
  disabled = false,
  isLoading = false,
  clearable = true,
  className = '',
  emptyMessage = 'No matching results found',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const matchLabel = opt.label.toLowerCase().includes(query);
    const matchSublabel = opt.sublabel ? opt.sublabel.toLowerCase().includes(query) : false;
    const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(query) : false;
    const matchMetadata = opt.metadata ? opt.metadata.toLowerCase().includes(query) : false;
    return matchLabel || matchSublabel || matchBadge || matchMetadata;
  });

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex].value);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className={`space-y-1 ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[13px] font-medium" style={{ color: 'var(--color-text-on-card)' }}>
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled || isLoading}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] text-left transition-all border focus:outline-none focus:ring-2 focus:ring-[#00C2B3] ${
            error ? 'border-red-500 ring-1 ring-red-500' : 'border-[var(--color-border)]'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            background: 'var(--color-bg-input)',
            color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          }}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            {selectedOption ? (
              <div className="flex items-center gap-2 truncate">
                <span className="font-medium truncate">{selectedOption.label}</span>
                {selectedOption.badge && (
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
                    {selectedOption.badge}
                  </span>
                )}
                {selectedOption.sublabel && (
                  <span className="text-[11px] text-[var(--color-text-muted)] truncate hidden sm:inline">
                    ({selectedOption.sublabel})
                  </span>
                )}
              </div>
            ) : (
              <span>{isLoading ? 'Loading options...' : placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
            {clearable && selectedOption && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="hover:text-slate-200 p-0.5 rounded transition-colors"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#00C2B3]' : ''}`} />
          </div>
        </button>

        {/* Dropdown Popup */}
        {isOpen && (
          <div
            className="absolute z-50 left-0 right-0 mt-1.5 rounded-2xl border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{
              background: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            {/* Search Input Bar */}
            <div className="p-2 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
                  style={{
                    background: 'var(--color-bg-input)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Options List */}
            <div
              ref={listRef}
              className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar"
            >
              {filteredOptions.length === 0 ? (
                <div className="py-6 px-3 text-center text-xs text-[var(--color-text-muted)] space-y-1">
                  <AlertCircle className="w-4 h-4 mx-auto text-slate-400" />
                  <p>{emptyMessage}</p>
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = option.value === value;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <div
                      key={option.value}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#00C2B3]/15 text-[#00C2B3] font-semibold'
                          : isHighlighted
                          ? 'bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 truncate pr-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className="truncate">{option.label}</span>
                          {option.badge && (
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
                              {option.badge}
                            </span>
                          )}
                        </div>
                        {(option.sublabel || option.metadata) && (
                          <span className="text-[11px] text-[var(--color-text-secondary)] truncate">
                            {option.sublabel} {option.metadata ? `• ${option.metadata}` : ''}
                          </span>
                        )}
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-[#00C2B3] shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
