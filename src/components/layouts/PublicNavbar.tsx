'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { Search } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { CalculatorSearchModal } from '@/components/calculators/CalculatorSearchModal';

interface PublicNavbarProps {
  onProductsClick?: () => void;
}

export function PublicNavbar({ onProductsClick }: PublicNavbarProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070A11]/80 border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none rounded-lg p-1"
          >
            <Logo width={36} height={36} className="rounded-lg shrink-0" />
            <span className="text-xl font-bold tracking-tight text-white">
              Fintecc
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            {onProductsClick ? (
              <button
                type="button"
                onClick={onProductsClick}
                className="hover:text-[#A8C5DA] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Products
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#4A6FA5]/20 text-[#A8C5DA] rounded-md border border-[#A8C5DA]/30">
                  2 Live
                </span>
              </button>
            ) : (
              <Link
                href="/#products"
                className="hover:text-[#A8C5DA] transition-colors flex items-center gap-1.5"
              >
                Products
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#4A6FA5]/20 text-[#A8C5DA] rounded-md border border-[#A8C5DA]/30">
                  2 Live
                </span>
              </Link>
            )}
            <Link href="/calculators" className="hover:text-[#A8C5DA] transition-colors">
              Calculators
            </Link>
            <Link href="/#pricing" className="hover:text-[#A8C5DA] transition-colors">
              Pricing
            </Link>
            <Link href="/#about" className="hover:text-[#A8C5DA] transition-colors">
              About Us
            </Link>
            <Link href="/#contact" className="hover:text-[#A8C5DA] transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Interactive search pill */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10 rounded-full text-xs font-medium transition-all group focus:outline-none focus:ring-1 focus:ring-[#4A6FA5] cursor-pointer"
              type="button"
              title="Search calculators (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#A8C5DA] transition-colors" />
              <span>Search calculators</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 rounded border border-white/10">
                ⌘K
              </kbd>
            </button>

            <Link
              href={user ? "/dashboard" : "/auth"}
              className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all cursor-pointer"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
          </div>
        </div>
      </header>

      {/* Global Calculator Search Modal */}
      <CalculatorSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
