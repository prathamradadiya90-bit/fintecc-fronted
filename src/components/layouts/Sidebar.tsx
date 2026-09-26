"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, Users, FileText, Calculator, Calendar, Settings, LogOut, X, 
  Shield, MessageSquare, CreditCard, Building2, ReceiptText, ClipboardList, 
  ShoppingBag, RefreshCw, Receipt, KeyRound, Lock, Landmark, FileWarning, Key, 
  FileStack, Clock, LifeBuoy, ChevronsUpDown, ShieldCheck, ChevronDown 
} from 'lucide-react';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { useGetMySubscriptionQuery } from '@/lib/store/api/plansApi';
import { useGetTasksQuery } from '@/lib/store/api/tasksApi';
import { logout as logoutAction } from '@/lib/store/features/auth/authSlice';
import Logo from '@/components/ui/Logo';
import type { RootState } from '@/lib/store/store';

interface NavLeafItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'emerald' | 'cyan' | 'amber';
}

interface NavGroupItem {
  id: string;
  name: string;
  icon: React.ElementType;
  children: NavLeafItem[];
}

type NavEntry =
  | { type: 'link'; item: NavLeafItem }
  | { type: 'group'; item: NavGroupItem };

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

  // Track accordion expand/collapse states
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

  const clientNavEntries: NavEntry[] = useMemo(() => [
    { type: 'link', item: { name: 'My Invoices', href: '/dashboard/portal', icon: Receipt } },
    { type: 'link', item: { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare } },
    { type: 'link', item: { name: 'Helpdesk', href: '/dashboard/helpdesk', icon: LifeBuoy } },
    { type: 'link', item: { name: 'Documents', href: '/dashboard/documents', icon: FileText } },
  ], []);

  const firmNavEntries: NavEntry[] = useMemo(() => {
    const entries: NavEntry[] = [
      {
        type: 'link',
        item: { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      },
      {
        type: 'link',
        item: {
          name: 'Work Board',
          href: '/dashboard/tasks',
          icon: ClipboardList,
          badge: activeTasksCount > 0 ? String(activeTasksCount) : undefined,
        },
      },
      {
        type: 'group',
        item: {
          id: 'clients-group',
          name: 'Clients & Security',
          icon: Users,
          children: [
            { name: 'My Clients', href: '/dashboard/my-clients', icon: Users },
            { name: 'Client Vault', href: '/dashboard/vault', icon: KeyRound },
            { name: 'DSC Tracker', href: '/dashboard/dsc', icon: Key },
          ],
        },
      },
      {
        type: 'group',
        item: {
          id: 'tax-group',
          name: 'Tax & Compliance',
          icon: Building2,
          children: [
            {
              name: 'GST Compliance',
              href: '/dashboard/gst',
              icon: Building2,
              badge: '2B Beta',
              badgeVariant: 'cyan',
            },
            { name: 'ITR Filing', href: '/dashboard/itr', icon: ReceiptText },
            { name: 'TDS Compliance', href: '/dashboard/tds', icon: Calculator },
            { name: 'MCA Registry', href: '/dashboard/mca', icon: Building2 },
            { name: 'ROC Filings', href: '/dashboard/roc', icon: FileStack },
            { name: 'Notice Board', href: '/dashboard/notices', icon: FileWarning },
            { name: 'Compliance Calendar', href: '/dashboard/compliance', icon: Calendar },
          ],
        },
      },
      {
        type: 'group',
        item: {
          id: 'tools-group',
          name: 'Accounting & Tools',
          icon: Calculator,
          children: [
            { name: 'Bank Statements', href: '/dashboard/bank-statements', icon: Landmark },
            { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
            { name: 'Tally Sync', href: '/dashboard/tally-sync', icon: RefreshCw },
            {
              name: 'Converters',
              href: '/dashboard/converters',
              icon: FileText,
              badge: 'LIVE',
              badgeVariant: 'emerald',
            },
            { name: 'Calculators', href: '/dashboard/calculators', icon: Calculator },
            { name: 'E-Commerce', href: '/dashboard/ecommerce', icon: ShoppingBag },
          ],
        },
      },
    ];

    if (user?.role === 'FIRM_OWNER') {
      entries.push({
        type: 'group',
        item: {
          id: 'firm-group',
          name: 'Firm Management',
          icon: Shield,
          children: [
            { name: 'Manage Staff', href: '/dashboard/staff', icon: Shield },
            { name: 'Staff Attendance', href: '/dashboard/attendance', icon: Clock },
            { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: ShieldCheck },
          ],
        },
      });
    }

    entries.push({
      type: 'link',
      item: {
        name: 'Subscription',
        href: '/dashboard/subscription',
        icon: CreditCard,
        badge: !hasActivePlan ? 'Action' : undefined,
        badgeVariant: 'amber',
      },
    });

    entries.push({
      type: 'group',
      item: {
        id: 'support-group',
        name: 'Help & Support',
        icon: LifeBuoy,
        children: [
          { name: 'Helpdesk', href: '/dashboard/helpdesk', icon: LifeBuoy },
          { name: 'Contact Us', href: '/dashboard/contact', icon: MessageSquare },
        ],
      },
    });

    return entries;
  }, [activeTasksCount, user?.role, hasActivePlan]);

  const navEntries = user?.role === 'CLIENT' ? clientNavEntries : firmNavEntries;

  // Auto-expand any group that contains the current active route
  React.useEffect(() => {
    navEntries.forEach((entry) => {
      if (entry.type === 'group') {
        const hasActiveChild = entry.item.children.some(
          (child) => pathname === child.href || pathname.startsWith(`${child.href}/`)
        );
        if (hasActiveChild) {
          setOpenGroups((prev) => ({
            ...prev,
            [entry.item.id]: true,
          }));
        }
      }
    });
  }, [pathname, navEntries]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

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

  const renderBadge = (badge?: string, variant?: 'emerald' | 'cyan' | 'amber') => {
    if (!badge) return null;
    let colorClasses = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (variant === 'cyan') {
      colorClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    } else if (variant === 'amber') {
      colorClasses = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
    return (
      <span className={`ml-auto text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${colorClasses}`}>
        {badge}
      </span>
    );
  };

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
        {navEntries.map((entry) => {
          if (entry.type === 'link') {
            const isActive = pathname === entry.item.href || pathname.startsWith(`${entry.item.href}/`);
            const isSubscriptionItem = entry.item.href === '/dashboard/subscription';
            const isContactItem = entry.item.href === '/dashboard/contact';
            const isLocked = !hasActivePlan && !isSubscriptionItem && !isContactItem;
            const destinationHref = isLocked ? '/dashboard/subscription' : entry.item.href;
            const Icon = entry.item.icon;

            return (
              <Link
                key={entry.item.name}
                href={destinationHref}
                onClick={() => {
                  if (window.innerWidth < 1024 && onClose) onClose();
                }}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group relative text-xs
                  ${isActive
                    ? 'text-emerald-400 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.12)] font-medium'
                    : 'border border-transparent hover:bg-[var(--color-bg-card)]'
                  }
                `}
                style={{
                  ...(isActive ? { background: 'var(--color-bg-card)' } : {}),
                  ...(!isActive && !isLocked ? { color: 'var(--color-text-secondary)' } : {}),
                  ...(isLocked && !isActive ? { color: 'var(--color-text-muted)' } : {}),
                }}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : ''}`}
                  style={!isActive ? { color: 'inherit' } : {}}
                />
                <span className="truncate">{entry.item.name}</span>

                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] shrink-0" />
                )}

                {isLocked && !isActive && (
                  <Lock className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                )}

                {renderBadge(entry.item.badge, entry.item.badgeVariant)}
              </Link>
            );
          }

          // Collapsible Accordion Group
          const group = entry.item;
          const GroupIcon = group.icon;
          const isGroupOpen = !!openGroups[group.id];
          const hasActiveChild = group.children.some(
            (child) => pathname === child.href || pathname.startsWith(`${child.href}/`)
          );

          return (
            <div key={group.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isGroupOpen}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-150 text-xs text-left group
                  ${hasActiveChild && !isGroupOpen
                    ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)]'
                  }
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GroupIcon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      hasActiveChild ? 'text-emerald-400' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]'
                    }`}
                  />
                  <span className="truncate font-medium">{group.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {hasActiveChild && !isGroupOpen && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] shrink-0" />
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform duration-200 ${
                      isGroupOpen ? 'rotate-180 text-emerald-400' : 'group-hover:text-[var(--color-text-primary)]'
                    }`}
                  />
                </div>
              </button>

              {/* Sub-items accordion dropdown */}
              {isGroupOpen && (
                <div className="ml-3.5 pl-2.5 border-l border-[var(--color-border)] flex flex-col gap-0.5 my-1">
                  {group.children.map((child) => {
                    const isChildActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                    const isChildLocked =
                      !hasActivePlan &&
                      child.href !== '/dashboard/subscription' &&
                      child.href !== '/dashboard/contact';
                    const destinationHref = isChildLocked ? '/dashboard/subscription' : child.href;
                    const ChildIcon = child.icon;

                    return (
                      <Link
                        key={child.name}
                        href={destinationHref}
                        onClick={() => {
                          if (window.innerWidth < 1024 && onClose) onClose();
                        }}
                        className={`
                          flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs group relative
                          ${isChildActive
                            ? 'text-emerald-400 bg-[var(--color-bg-card)] border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.12)] font-medium'
                            : 'border border-transparent hover:bg-[var(--color-bg-card)]'
                          }
                        `}
                        style={{
                          ...(!isChildActive && !isChildLocked
                            ? { color: 'var(--color-text-secondary)' }
                            : {}),
                          ...(isChildLocked && !isChildActive
                            ? { color: 'var(--color-text-muted)' }
                            : {}),
                        }}
                      >
                        <ChildIcon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isChildActive
                              ? 'text-emerald-400'
                              : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]'
                          }`}
                        />
                        <span className="truncate">{child.name}</span>

                        {isChildActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] shrink-0" />
                        )}

                        {isChildLocked && !isChildActive && (
                          <Lock className="w-3 h-3 ml-auto shrink-0 text-[var(--color-text-muted)]" />
                        )}

                        {renderBadge(child.badge, child.badgeVariant)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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
