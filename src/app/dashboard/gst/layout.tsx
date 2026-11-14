'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  LayoutDashboard,
  FileSpreadsheet,
  Receipt,
  ShieldCheck,
  BookOpen,
  Calculator,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { GstClientSelector } from '@/features/gst/components/GstClientSelector';

interface GstLayoutProps {
  children: React.ReactNode;
}

const navTabs = [
  { name: 'Overview', href: '/dashboard/gst', icon: LayoutDashboard },
  { name: 'Returns & Filing', href: '/dashboard/gst/returns', icon: FileSpreadsheet },
  { name: 'IMS & 2B Reco', href: '/dashboard/gst/ims', icon: FileCheck },
  { name: 'GST Profiles', href: '/dashboard/gst/profiles', icon: Building2 },
  { name: 'Invoices', href: '/dashboard/gst/invoices', icon: Receipt },
  { name: 'Late Fee Calc', href: '/dashboard/gst/calculator', icon: Calculator },
  { name: 'Portal Sync', href: '/dashboard/gst/portal-sync', icon: RefreshCw },
  { name: 'Tax Catalog', href: '/dashboard/gst/catalog', icon: BookOpen },
];

function GstHeaderContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedClientId = searchParams.get('clientId') || '';

  const handleSelectClient = (clientId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (clientId) {
      params.set('clientId', clientId);
    } else {
      params.delete('clientId');
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-heading)' }}>
              GST Compliance Workspace
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              FY 2024-25 & 2025-26
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            GSTR-1, GSTR-3B, ITC Reconciliation (IMS/2B) & Client GSTIN management
          </p>
        </div>
      </div>

      {/* Filter by Client Selector */}
      <div className="shrink-0 w-full sm:w-auto">
        <GstClientSelector
          selectedClientId={selectedClientId}
          onSelectClient={handleSelectClient}
        />
      </div>
    </div>
  );
}

export default function GstLayout({ children }: GstLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="w-full space-y-5 pb-12">
      {/* Header Banner */}
      <Suspense fallback={
        <div className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-skeleton)' }} />
      }>
        <GstHeaderContent />
      </Suspense>

      {/* Sub-navigation Tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-2xl border overflow-x-auto scrollbar-none"
        style={{
          background: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
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
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-[var(--color-bg-subtle)]'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
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
