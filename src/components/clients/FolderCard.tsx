"use client";

import React from 'react';
import { Folder, FolderOpen } from 'lucide-react';
import type { ClientFolder } from '@/lib/types/client.types';

interface FolderCardProps {
  folder: ClientFolder;
  isSelected: boolean;
  docCount?: number;
  onClick: () => void;
}

export function FolderCard({ folder, isSelected, docCount, onClick }: FolderCardProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border flex items-center gap-3 select-none ${
        isSelected
          ? 'border-[#00C2B3] bg-teal-500/10 shadow-sm'
          : 'hover:border-[#00C2B3]/50 hover:shadow-sm'
      }`}
      style={{
        background: isSelected ? undefined : 'var(--color-bg-card)',
        borderColor: isSelected ? '#00C2B3' : 'var(--color-border)',
      }}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          isSelected
            ? 'bg-[#00C2B3] text-white'
            : 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20'
        }`}
      >
        {isSelected ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className="text-sm font-semibold truncate leading-tight"
          style={{ color: isSelected ? '#00C2B3' : 'var(--color-text-primary)' }}
        >
          {folder.name}
        </h4>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {typeof docCount === 'number'
            ? `${docCount} document${docCount !== 1 ? 's' : ''}`
            : 'Click to filter'}
        </p>
      </div>
    </div>
  );
}
