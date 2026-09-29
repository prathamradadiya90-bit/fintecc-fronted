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
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-[#E2E8F0] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none rounded-lg p-1"
          >
            <Logo width={36} height={36} className="rounded-lg shrink-0" />
            <span className="text-xl font-bold tracking-tight text-[#1E2A38]">
              Fintecc
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5A6E85]">
            {onProductsClick ? (
              <button
                type="button"
                onClick={onProductsClick}
                className="hover:text-[#1E2A38] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Products
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#4A6FA5]/10 text-[#4A6FA5] rounded-md border border-[#4A6FA5]/25">
                  2 Live
                </span>
              </button>
            ) : (
              <Link
                href="/#products"
                className="hover:text-[#1E2A38] transition-colors flex items-center gap-1.5"
              >
                Products
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#4A6FA5]/10 text-[#4A6FA5] rounded-md border border-[#4A6FA5]/25">
                  2 Live
                </span>
              </Link>
            )}
            <Link href="/calculators" className="hover:text-[#1E2A38] transition-colors">
              Calculators
            </Link>
            <Link href="/#pricing" className="hover:text-[#1E2A38] transition-colors">
              Pricing
            </Link>
            <Link href="/#about" className="hover:text-[#1E2A38] transition-colors">
              About Us
            </Link>
            <Link href="/#contact" className="hover:text-[#1E2A38] transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Interactive search pill */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 bg-[#F0F4F8] hover:bg-[#E3EBF3] text-[#5A6E85] hover:text-[#1E2A38] border border-[#E2E8F0] rounded-full text-xs font-medium transition-all group focus:outline-none focus:ring-1 focus:ring-[#4A6FA5] cursor-pointer"
              type="button"
              title="Search calculators (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#5A6E85] group-hover:text-[#4A6FA5] transition-colors" />
              <span>Search calculators</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#5A6E85] bg-white rounded border border-[#CBD5E1]">
                ⌘K
              </kbd>
            </button>

            <Link
              href={user ? "/dashboard" : "/auth"}
              className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2 text-sm font-semibold text-white bg-[#4A6FA5] hover:bg-[#3D5D8A] rounded-xl transition-all shadow-sm cursor-pointer"
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
