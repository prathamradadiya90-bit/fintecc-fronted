'use client';
import React from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export function PublicFooter() {
  return (
    <footer className="bg-[#0A1628] py-6 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between border-t border-slate-800 gap-4">
      <div className="flex items-center gap-2">
        <Logo width={28} height={28} className="rounded-md" />
        <span className="text-sm font-bold text-white">Fintecc</span>
      </div>
      <p className="text-xs text-slate-500">
        &copy; 2026 Fintecc. All rights reserved.
      </p>
      <div className="flex gap-5">
        <Link href="/calculators" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
          Calculators
        </Link>
        {["Privacy", "Terms", "Security"].map((l) => (
          <a key={l} href="#" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
            {l}
          </a>
        ))}
        <Link href="/#contact" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
          Contact Us
        </Link>
      </div>
    </footer>
  );
}
