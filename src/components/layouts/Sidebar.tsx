"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, Users, FileText, Calculator, Calendar, Settings, LogOut, X, 
  Shield, MessageSquare, CreditCard, Building2, ReceiptText, ClipboardList, 
  ShoppingBag, RefreshCw, Receipt, KeyRound, Lock, Landmark, FileWarning, Key, 
  FileStack, Clock, LifeBuoy, ChevronsUpDown, Plus, ShieldCheck 
} from 'lucide-react';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { useGetMySubscriptionQuery } from '@/lib/store/api/plansApi';
import { useGetTasksQuery } from '@/lib/store/api/tasksApi';
import { logout as logoutAction } from '@/lib/store/features/auth/authSlice';
import Logo from '@/components/ui/Logo';
import type { RootState } from '@/lib/store/store';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Work Board', href: '/dashboard/tasks', icon: ClipboardList },
  { name: 'Notice Board', href: '/dashboard/notices', icon: FileWarning },
  { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { name: 'Bank Statements', href: '/dashboard/bank-statements', icon: Landmark },
  { name: 'DSC Tracker', href: '/dashboard/dsc', icon: Key },
  { name: 'My Clients', href: '/dashboard/my-clients', icon: Users },
  { name: 'Client Vault', href: '/dashboard/vault', icon: KeyRound },
  { name: 'GST Compliance', href: '/dashboard/gst', icon: Building2 },
  { name: 'ITR Filing', href: '/dashboard/itr', icon: ReceiptText },
  { name: 'TDS Compliance', href: '/dashboard/tds', icon: Calculator },
  { name: 'E-Commerce', href: '/dashboard/ecommerce', icon: ShoppingBag },
  { name: 'MCA Registry', href: '/dashboard/mca', icon: Building2 },
  { name: 'ROC Filings', href: '/dashboard/roc', icon: FileStack },
  { name: 'Tally Sync', href: '/dashboard/tally-sync', icon: RefreshCw },
  { name: 'Converters', href: '/dashboard/converters', icon: FileText },
  { name: 'Calculators', href: '/dashboard/calculators', icon: Calculator },
  { name: 'Compliance Calendar', href: '/dashboard/compliance', icon: Calendar },
  { name: 'Helpdesk', href: '/dashboard/helpdesk', icon: LifeBuoy },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
];

export function Sidebar({ 
  isOpen, 
  isDesktopOpen = true, 
  onClose 
}: { 
  isOpen?: boolean; 
  isDesktopOpen?: boolean; 
  onClose?: () => void; 
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logoutApi, { isLoading }] = useLogoutMutation();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const { data: subData } = useGetMySubscriptionQuery(undefined, {
    skip: !user || isSuperAdmin,
  });
  const hasActivePlan = isSuperAdmin || Boolean(subData?.data?.hasActivePlan);

  // Dynamic active tasks tracking for the Work Board badge
  const { data: tasksData } = useGetTasksQuery(undefined, {
    skip: !user || isSuperAdmin || user?.role === 'CLIENT',
  });
  const activeTasksCount = tasksData?.data
    ? tasksData.data.filter((t) => t.status !== 'DONE').length
    : 0;

  const clientNavItems: NavItem[] = [
    { name: 'My Invoices', href: '/dashboard/portal', icon: Receipt },
    { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Helpdesk', href: '/dashboard/helpdesk', icon: LifeBuoy },
    { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  ];

  const rawItems: NavItem[] = user?.role === 'CLIENT'
    ? clientNavItems
    : [
        ...navItems,
        ...(user?.role === 'FIRM_OWNER'
          ? [
              { name: 'Manage Staff', href: '/dashboard/staff', icon: Shield },
              { name: 'Attendance', href: '/dashboard/attendance', icon: Clock },
              { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: Shield },
            ]
          : []
        ),
        { name: 'Contact Us', href: '/dashboard/contact', icon: MessageSquare },
      ];

  const items: NavItem[] = rawItems.map((item) => {
    if (item.name === 'Work Board') {
      return {
        ...item,
        badge: activeTasksCount > 0 ? String(activeTasksCount) : undefined,
      };
    }
    return item;
  });

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      dispatch(logoutAction());
      router.push('/auth');
    }
  };

  const firmName = (user as any)?.firmName || user?.name || 'Fintecc Practice';
  const firmInitials = firmName.slice(0, 2).toUpperCase();
  const firmCode = `CA-${user?.id ? user.id.slice(-5).toUpperCase() : '98421'}`;

  return (
    <aside
      className={`w-64 h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ${
        isDesktopOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      style={{
        background: 'var(--color-bg-page)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Brand Logo Header */}
      <div
        className="h-16 px-4 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <Logo width={32} height={32} className="rounded-md shrink-0" />
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Fintecc OS
          </span>
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            PRO
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors focus:outline-none hover:bg-slate-500/10 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Practice Switcher */}
      <div
        className="rounded-xl p-2.5 flex items-center justify-between transition-colors cursor-pointer mx-3 mt-3 mb-2 shrink-0"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0"
            style={{
              background: 'var(--color-bg-card-hover)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            {firmInitials}
          </div>
          <div className="min-w-0">
            <div
              className="text-[12px] font-semibold truncate leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {firmName}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span
                className="text-[10px] font-mono truncate"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {firmCode}
              </span>
            </div>
          </div>
        </div>
        <ChevronsUpDown className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 pt-1 pb-4 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isSubscriptionItem = item.href === '/dashboard/subscription';
          const isContactItem = item.href === '/dashboard/contact';
          const isLocked = !hasActivePlan && !isSubscriptionItem && !isContactItem;
          const destinationHref = isLocked ? '/dashboard/subscription' : item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={destinationHref}
              onClick={() => {
                if (window.innerWidth < 1024 && onClose) onClose();
              }}
              className={`
                flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group relative text-xs
                ${isActive
                  ? 'text-emerald-400 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.12)] font-medium'
                  : isLocked
                  ? 'border border-transparent'
                  : 'border border-transparent'
                }
              `}
              style={{
                ...(isActive
                  ? { background: 'var(--color-bg-card)' }
                  : {}),
                ...(!isActive && !isLocked
                  ? { color: 'var(--color-text-secondary)' }
                  : {}),
                ...(isLocked && !isActive
                  ? { color: 'var(--color-text-muted)' }
                  : {}),
              }}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : ''}`}
                style={!isActive ? { color: 'inherit' } : {}}
              />
              <span className="truncate">{item.name}</span>

              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] shrink-0" />
              )}

              {isLocked && !isActive && (
                <Lock className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              )}

              {item.name === 'Converters' && !isActive && (
                <span className="ml-auto px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  LIVE
                </span>
              )}

              {item.name === 'GST Compliance' && !isActive && (
                <span className="ml-auto px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  2B Beta
                </span>
              )}

              {isSubscriptionItem && !hasActivePlan && (
                <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded shrink-0">
                  Action
                </span>
              )}

              {item.badge && hasActivePlan && !isActive && (
                <span className="ml-auto text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section: Storage Quota & Compliance */}
      <div
        className="p-3 flex flex-col gap-2 shrink-0"
        style={{
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-page)',
        }}
      >

        {/* Settings & Logout */}
        <div
          className="flex flex-col gap-1 pt-1"
          style={{ borderTop: '1px solid color-mix(in srgb, var(--color-border) 60%, transparent)' }}
        >
          <Link
            href="/dashboard/settings"
            onClick={() => {
              if (window.innerWidth < 1024 && onClose) onClose();
            }}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-xs ${
              pathname.startsWith('/dashboard/settings')
                ? 'text-emerald-400 border border-emerald-500/25 font-medium'
                : ''
            }`}
            style={{
              ...(pathname.startsWith('/dashboard/settings')
                ? { background: 'var(--color-bg-card)' }
                : { color: 'var(--color-text-secondary)' }),
            }}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2.5 px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-all disabled:opacity-50 text-xs text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoading ? 'Logging Out...' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
