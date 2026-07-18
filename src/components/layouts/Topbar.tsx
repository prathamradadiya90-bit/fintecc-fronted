"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Menu, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { logout } from '@/lib/store/features/auth/authSlice';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [logoutApi] = useLogoutMutation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed', error);
      dispatch(logout());
      router.push('/auth');
    }
  };

  // Basic title mapping based on pathname
  let title = 'Dashboard';
  if (pathname.includes('/my-clients')) title = 'My Clients';

  const userName = user?.name || "Guest";
  const displayName = userName || 'Guest User';
  const initials = userName
    ? userName.substring(0, 2).toUpperCase()
    : 'GU';

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
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="relative pl-5 border-l border-slate-200" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#091124] text-white flex items-center justify-center font-semibold text-xs">
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
