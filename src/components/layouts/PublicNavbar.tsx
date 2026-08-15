'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import Logo from '@/components/ui/Logo';
import { Search } from 'lucide-react';
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
      <nav className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 md:px-12 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo width={42} height={42} className="rounded-lg" />
            <span className="text-xl font-extrabold text-[#0A1628] dark:text-white tracking-tight">Fintecc</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {onProductsClick ? (
            <button 
              onClick={onProductsClick} 
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0A1628] dark:hover:text-white transition-colors cursor-pointer"
            >
              Products
            </button>
          ) : (
            <Link 
              href="/#products" 
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0A1628] dark:hover:text-white transition-colors"
            >
              Products
            </Link>
          )}
          <Link 
            href="/calculators" 
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0A1628] dark:hover:text-white transition-colors"
          >
            Calculators
          </Link>
          <Link 
            href="/#contact" 
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0A1628] dark:hover:text-white transition-colors"
          >
            Contact Us
          </Link>
          <Link 
            href="/#about" 
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0A1628] dark:hover:text-white transition-colors"
          >
            About Us
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all cursor-pointer"
            title="Search calculators (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#00C2B3]" />
            <span className="hidden sm:inline">Search calculators</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
              ⌘K
            </kbd>
          </button>

          <Link
            href={user ? "/dashboard" : "/auth"}
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-[#0A1628] transition-all duration-200 cursor-pointer shadow-sm"
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
        </div>
      </nav>

      {/* Global Calculator Search Modal */}
      <CalculatorSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
