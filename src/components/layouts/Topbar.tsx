"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut, Sun, Moon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { logout } from '@/lib/store/features/auth/authSlice';
import { useTheme } from '@/providers/ThemeProvider';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [logoutApi] = useLogoutMutation();
  const { theme, toggleTheme } = useTheme();

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

  // Title mapping based on pathname
  let title = 'Dashboard';
  if (pathname.includes('/my-clients')) title = 'My Clients';
  else if (pathname.includes('/invoices')) title = 'Invoice Management';
  else if (pathname.includes('/vault')) title = 'Client Password Vault';
  else if (pathname.includes('/settings')) title = 'Firm Settings';
  else if (pathname.includes('/chat')) title = user?.role === 'CLIENT' ? 'Chat with CA Firm' : 'Chat';
  else if (pathname.includes('/documents')) title = 'My Documents';
  else if (pathname.includes('/gst')) title = 'GST Compliance';
  else if (pathname.includes('/itr')) title = 'ITR Filing';
  else if (pathname.includes('/ecommerce')) title = 'E-Commerce Sales';
  else if (pathname.includes('/tally-sync')) title = 'Tally Prime Sync';
  else if (pathname.includes('/converters')) title = 'Converters & OCR Hub';
  else if (pathname.includes('/calculators')) title = 'Calculators';
  else if (pathname.includes('/compliance')) title = 'Compliance Calendar';
  else if (pathname.includes('/subscription')) title = 'Subscription';
  else if (pathname.includes('/staff')) title = 'Manage Staff';
  else if (pathname.includes('/contact')) title = 'Contact Us';

  const userName = user?.name || "Guest";
  const displayName = userName || 'Guest User';
  const initials = userName
    ? userName.substring(0, 2).toUpperCase()
    : 'GU';

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30"
      style={{
        background: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1 -ml-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1
          className="text-lg lg:text-xl font-bold"
          style={{ color: 'var(--color-text-heading)' }}
        >
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <div className="relative pl-4" style={{ borderLeft: '1px solid var(--color-border)' }} ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#091124] text-white flex items-center justify-center font-semibold text-xs">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text-on-card)' }}>{displayName}</p>
            </div>
          </button>

          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-3 w-48 rounded-xl shadow-lg py-1 z-50"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="px-4 py-2.5 mb-1 lg:hidden"
                style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
              >
                 <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text-on-card)' }}>{displayName}</p>
              </div>

              {/* Theme Toggle Row */}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); toggleTheme(); }}
                className="w-full text-left px-4 py-2 text-[13px] font-medium flex items-center gap-2 transition-colors cursor-pointer"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>

              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors cursor-pointer dark:hover:bg-red-950/30"
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
