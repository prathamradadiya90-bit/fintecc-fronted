'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] py-8" data-purpose="page-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-5 border-b border-[#E2E8F0]">
          {/* Left Footer Brand */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Logo width={32} height={32} className="rounded-lg shrink-0" />
              <span className="text-lg font-bold tracking-tight text-[#1E2A38]">Fintecc</span>
            </Link>
            <p className="text-xs text-[#5A6E85] text-center sm:text-left sm:border-l sm:border-[#E2E8F0] sm:pl-4">
              Empowering Indian Chartered Accountants with institutional-grade automation
            </p>
          </div>

          {/* Footer Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#5A6E85]">
            <Link className="hover:text-[#4A6FA5] transition-colors" href="/#products">
              Products
            </Link>
            <Link className="hover:text-[#4A6FA5] transition-colors" href="/calculators">
              Calculators
            </Link>
            <Link className="hover:text-[#4A6FA5] transition-colors" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-[#4A6FA5] transition-colors" href="/terms">
              Terms
            </Link>
            <Link className="hover:text-[#4A6FA5] transition-colors" href="/security">
              Security
            </Link>
            <Link className="hover:text-[#4A6FA5] transition-colors" href="/#contact">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Bottom bar: Copyright & Disclaimer */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E9FAA] gap-3">
          <p>© 2026 Fintecc. All rights reserved.</p>
          <p>Built in India with precision 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
