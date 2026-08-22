'use client';

import React from 'react';
import { EcommercePlatform } from '@/lib/types/ecommerce.types';
import { Sparkles, ShoppingBag, Store, Globe } from 'lucide-react';

interface PlatformSelectorProps {
  selectedPlatform: EcommercePlatform | 'AUTO' | null;
  onSelectPlatform: (platform: EcommercePlatform | 'AUTO') => void;
}

const PLATFORMS: { id: EcommercePlatform | 'AUTO'; name: string; tag: string; color: string }[] = [
  { id: 'AUTO', name: 'Auto-Detect', tag: 'Smart Parser', color: 'from-teal-500/20 to-emerald-500/20 text-teal-400' },
  { id: 'Amazon', name: 'Amazon', tag: 'MTR / Settlement', color: 'from-amber-500/20 to-orange-500/20 text-amber-400' },
  { id: 'Flipkart', name: 'Flipkart', tag: 'Sales Report', color: 'from-blue-500/20 to-indigo-500/20 text-blue-400' },
  { id: 'Meesho', name: 'Meesho', tag: 'GST / Payments', color: 'from-pink-500/20 to-rose-500/20 text-pink-400' },
  { id: 'Myntra', name: 'Myntra', tag: 'Partner Report', color: 'from-purple-500/20 to-fuchsia-500/20 text-purple-400' },
  { id: 'Jiomart', name: 'JioMart', tag: 'Merchant Portal', color: 'from-red-500/20 to-rose-500/20 text-rose-400' },
  { id: 'Glowroad', name: 'GlowRoad', tag: 'Reseller Report', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400' },
  { id: 'Snapdeal', name: 'Snapdeal', tag: 'Orders Report', color: 'from-orange-500/20 to-amber-500/20 text-orange-400' },
  { id: 'Paytm', name: 'Paytm Mall', tag: 'Merchant Report', color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400' },
  { id: 'Limeroad', name: 'LimeRoad', tag: 'Vendor Sales', color: 'from-lime-500/20 to-green-500/20 text-lime-400' },
  { id: 'Citymall', name: 'CityMall', tag: 'Sales Report', color: 'from-violet-500/20 to-indigo-500/20 text-violet-400' },
  { id: 'Shop101', name: 'Shop101', tag: 'Orders & GST', color: 'from-teal-500/20 to-cyan-500/20 text-teal-400' },
];

export function PlatformSelector({
  selectedPlatform,
  onSelectPlatform,
}: PlatformSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>
          1. Select E-Commerce Platform
        </label>
        <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#00C2B3]" /> 11 Marketplaces Supported
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {PLATFORMS.map((platform) => {
          const isSelected = selectedPlatform === platform.id;
          const isAuto = platform.id === 'AUTO';

          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => onSelectPlatform(platform.id)}
              className={`
                relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between
                ${
                  isSelected
                    ? 'border-[#00C2B3] ring-1 ring-[#00C2B3]/30 bg-[#00C2B3]/10 shadow-sm'
                    : 'border-[var(--color-border)] hover:border-slate-400 dark:hover:border-slate-600 bg-[var(--color-bg-card)]'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}
                >
                  {isAuto ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <Store className="w-4 h-4" />
                  )}
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#00C2B3] animate-pulse" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {platform.name}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {platform.tag}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
