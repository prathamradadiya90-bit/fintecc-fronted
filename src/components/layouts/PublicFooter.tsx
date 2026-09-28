'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export function PublicFooter() {
  return (
    <footer className="bg-[#05070D] border-t border-white/10 py-12" data-purpose="page-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          {/* Left Footer Brand */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Logo width={32} height={32} className="rounded-lg shrink-0" />
              <span className="text-lg font-bold tracking-tight text-white">Fintecc</span>
            </Link>
            <p className="text-xs text-slate-400 text-center sm:text-left sm:border-l sm:border-white/10 sm:pl-4">
              Empowering Indian Chartered Accountants with next-gen automation
            </p>
          </div>

          {/* Footer Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <Link className="hover:text-[#A8C5DA] transition-colors" href="/#products">
              Products
            </Link>
            <Link className="hover:text-[#A8C5DA] transition-colors" href="/calculators">
              Calculators
            </Link>
            <Link className="hover:text-[#A8C5DA] transition-colors" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-[#A8C5DA] transition-colors" href="/terms">
              Terms
            </Link>
            <Link className="hover:text-[#A8C5DA] transition-colors" href="/security">
              Security
            </Link>
            <Link className="hover:text-[#A8C5DA] transition-colors" href="/#contact">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Bottom bar: Copyright & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 Fintecc. All rights reserved.</p>
          <p>Built in India with love❤️</p>
        </div>
      </div>
    </footer>
  );
}
