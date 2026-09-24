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
            <Link href="/" className="inline-block">
              <Logo width={110} height={32} />
            </Link>
            <p className="text-xs text-slate-400 text-center sm:text-left sm:border-l sm:border-white/10 sm:pl-4">
              Empowering Indian Chartered Accountants with next-gen automation
            </p>
          </div>

          {/* Footer Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <Link className="hover:text-emerald-400 transition-colors" href="/#products">
              Products
            </Link>
            <Link className="hover:text-emerald-400 transition-colors" href="/calculators">
              Calculators
            </Link>
            <Link className="hover:text-emerald-400 transition-colors" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-emerald-400 transition-colors" href="/terms">
              Terms
            </Link>
            <Link className="hover:text-emerald-400 transition-colors" href="/security">
              Security
            </Link>
            <Link className="hover:text-emerald-400 transition-colors" href="/#contact">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Bottom bar: Copyright & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 Fintecc. All rights reserved.</p>
          <p>Built with enterprise-grade data security standards in Bengaluru, India.</p>
        </div>
      </div>
    </footer>
  );
}
