"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, Users, FileText, Calculator, Calendar, Settings, LogOut, X, Shield, MessageSquare, Sun, Moon, CreditCard, Building2, ReceiptText } from 'lucide-react';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { logout as logoutAction } from '@/lib/store/features/auth/authSlice';
import Logo from '@/components/ui/Logo';
import type { RootState } from '@/lib/store/store';
import { useTheme } from '@/providers/ThemeProvider';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Clients', href: '/dashboard/my-clients', icon: Users },
  { name: 'GST Compliance', href: '/dashboard/gst', icon: Building2 },
  { name: 'ITR Filing', href: '/dashboard/itr', icon: ReceiptText },
  { name: 'Converters', href: '/dashboard/converters', icon: FileText },
  { name: 'Calculators', href: '/dashboard/calculators', icon: Calculator },
  { name: 'Compliance Calendar', href: '/dashboard/compliance', icon: Calendar },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logoutApi, { isLoading }] = useLogoutMutation();
  const { theme, toggleTheme } = useTheme();

  const items: NavItem[] = [
    ...navItems,
    ...(user?.role === 'FIRM_OWNER'
      ? [{ name: 'Manage Staff', href: '/dashboard/staff', icon: Shield }]
      : []
    ),
    { name: 'Contact Us', href: '/dashboard/contact', icon: MessageSquare },
  ];


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

  return (
    <aside className={`w-56 h-screen bg-[#091124] flex flex-col fixed left-0 top-0 border-r border-[#1a2333] z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo Area */}
      <div className="h-16 mt-2 mb-2 flex px-2 items-center">
        <div className="flex items-center">
          {/* Logo */}
          <Logo width={60} height={60} className="rounded-md" />
          <span className="text-white text-xl font-bold italic tracking-wide">FinTecc</span>
        </div>
        {/* Mobile close button */}
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-2 pb-6 flex flex-col gap-2 px-3 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 1024 && onClose) onClose();
              }}
              className={`
                flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative text-[13px]
                ${isActive
                  ? 'text-[#00C2B3] bg-[#00C2B3]/10 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }
              `}
            >
              <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#00C2B3]' : 'text-slate-400 group-hover:text-slate-300'}`} />
              <span>{item.name}</span>
              {isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#00C2B3]" />
              )}
              {item.badge && (
                <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-md">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[#1a2333] flex flex-col gap-1.5">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); toggleTheme(); }}
          className="flex items-center gap-3 px-3.5 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl transition-all text-[13px]"
        >
          {theme === 'light' ? (
            <Moon className="w-[18px] h-[18px]" />
          ) : (
            <Sun className="w-[18px] h-[18px]" />
          )}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        <button className="flex items-center gap-3 px-3.5 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl transition-all text-[13px]">
          <Settings className="w-[18px] h-[18px]" />
          <span>Settings</span>
        </button>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center gap-3 px-3.5 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-all disabled:opacity-50 text-[13px]"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>{isLoading ? 'Logging Out...' : 'Log Out'}</span>
        </button>
      </div>
    </aside>
  );
}
