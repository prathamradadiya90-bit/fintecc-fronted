'use client';
import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import Logo from '@/components/ui/Logo';

interface PublicNavbarProps {
  onProductsClick?: () => void;
}

export function PublicNavbar({ onProductsClick }: PublicNavbarProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 md:px-12 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo width={42} height={42} className="rounded-lg" />
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {onProductsClick ? (
          <button 
            onClick={onProductsClick} 
            className="text-sm font-semibold text-slate-600 hover:text-[#0A1628] transition-colors cursor-pointer"
          >
            Products
          </button>
        ) : (
          <Link 
            href="/#products" 
            className="text-sm font-semibold text-slate-600 hover:text-[#0A1628] transition-colors"
          >
            Products
          </Link>
        )}
        <Link 
          href="/calculators" 
          className="text-sm font-semibold text-slate-600 hover:text-[#0A1628] transition-colors"
        >
          Calculators
        </Link>
        <Link 
          href="/#contact" 
          className="text-sm font-semibold text-slate-600 hover:text-[#0A1628] transition-colors"
        >
          Contact Us
        </Link>
        <Link 
          href="/#about" 
          className="text-sm font-semibold text-slate-600 hover:text-[#0A1628] transition-colors"
        >
          About Us
        </Link>
      </div>

      <div>
        <Link
          href={user ? "/dashboard" : "/auth"}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-[#0A1628] transition-all duration-200 cursor-pointer shadow-sm"
        >
          {user ? "Dashboard" : "Sign in"}
        </Link>
      </div>
    </nav>
  );
}
