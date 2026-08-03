"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut, Shield } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { logout } from '@/lib/store/features/auth/authSlice';

const PAGE_TITLES: Record<string, string> = {
  '/super-admin/dashboard': 'Dashboard',
  '/super-admin/firm-admins': 'Firm Admins',
  '/super-admin/support-tickets': 'Support Tickets',
};

export function SuperAdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [logoutApi] = useLogoutMutation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Resolve page title from pathname
  const title = PAGE_TITLES[pathname] ?? 'Super Admin';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Always clear local state on logout
    } finally {
      dispatch(logout());
      router.push('/super-admin');
    }
  };

  const displayName = user?.name || 'Super Admin';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-800 p-1 -ml-1"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg lg:text-xl font-bold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-5">
        {/* Super Admin indicator badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00C2B3]/10 border border-[#00C2B3]/20">
          <Shield className="w-3.5 h-3.5 text-[#00C2B3]" />
          <span className="text-[11px] font-semibold text-[#00C2B3] uppercase tracking-widest">
            Super Admin
          </span>
        </div>

        {/* User menu */}
        <div className="relative pl-5 border-l border-slate-200" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#060E1E] text-white flex items-center justify-center font-semibold text-xs">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[13px] font-semibold text-slate-700">{displayName}</p>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 py-1 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 mb-1 lg:hidden">
                <p className="text-[13px] font-semibold text-slate-700">{displayName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
