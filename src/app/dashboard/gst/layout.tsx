'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, LayoutDashboard, FileSpreadsheet, Receipt, ShieldCheck } from 'lucide-react';
import { GstClientSelector } from '@/features/gst/components/GstClientSelector';

interface GstLayoutProps {
  children: React.ReactNode;
}

const navTabs = [
  { name: 'Overview', href: '/dashboard/gst', icon: LayoutDashboard },
  { name: 'GST Profiles', href: '/dashboard/gst/profiles', icon: Building2 },
  { name: 'Returns & Filing', href: '/dashboard/gst/returns', icon: FileSpreadsheet },
  { name: 'GST Invoices', href: '/dashboard/gst/invoices', icon: Receipt },
];

export default function GstLayout({ children }: GstLayoutProps) {
  const pathname = usePathname();
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#00C2B3]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
                GST Compliance Workspace
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Manage GSTIN profiles, prepare & file GSTR-1/3B returns, reconcile ITC, and track statutory deadlines.
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions: Client Context Dropdown */}
        <div className="shrink-0">
          <GstClientSelector
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
          />
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-2xl border overflow-x-auto custom-scrollbar"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        {navTabs.map((tab) => {
          const isActive =
            tab.href === '/dashboard/gst'
              ? pathname === '/dashboard/gst'
              : pathname.startsWith(tab.href);

          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                ${
                  isActive
                    ? 'bg-[#00C2B3] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-[var(--color-bg-subtle)]'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Child Page Content */}
      <div>{children}</div>
    </div>
  );
}
