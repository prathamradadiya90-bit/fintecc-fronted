"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { LayoutDashboard, Users, FileText, Calculator, Calendar, Settings, LogOut, X } from 'lucide-react';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { logout as logoutAction } from '@/lib/store/features/auth/authSlice';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Clients', href: '/dashboard/my-clients', icon: Users },
  { name: 'PDF to XML', href: '/dashboard/pdf-to-xml', icon: FileText },
  { name: 'Loan Calculator', href: '/dashboard/loan-calculator', icon: Calculator },
  { name: 'Compliance Calendar', href: '/dashboard/compliance', icon: Calendar, badge: 'Soon' },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [logoutApi, { isLoading }] = useLogoutMutation();

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
      <div className="h-16 flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          {/* F logo placeholder */}
          <div className="w-7 h-7 bg-gradient-to-br from-[#00C2B3] to-[#008f84] text-white flex items-center justify-center font-bold italic rounded-md text-sm">
            F
          </div>
          <span className="text-white text-lg font-bold tracking-wide">FinTecc</span>
        </div>
        {/* Mobile close button */}
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
        {navItems.map((item) => {
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
