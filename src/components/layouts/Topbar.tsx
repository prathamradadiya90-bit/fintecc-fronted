"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut, Sun, Moon, User as UserIcon, Sparkles, HelpCircle, Keyboard, ShieldCheck, Zap } from 'lucide-react';
import { ModuleGuideModal } from '@/components/common/ModuleGuideModal';
import { getModuleGuide } from '@/lib/constants/moduleGuides';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { logout } from '@/lib/store/features/auth/authSlice';
import { useTheme } from '@/providers/ThemeProvider';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { GlobalSearchBar } from '@/components/common/GlobalSearchBar';

export function Topbar({ 
  onMenuClick, 
  showMenuButton = false 
}: { 
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [logoutApi] = useLogoutMutation();
  const { theme, toggleTheme } = useTheme();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeGuide = getModuleGuide(pathname);



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
  else if (pathname.includes('/tasks')) title = 'Work Board';
  else if (pathname.includes('/bank-statements')) title = 'Bank Statements & Automation';
  else if (pathname.includes('/invoices')) title = 'Invoice Management';
  else if (pathname.includes('/vault')) title = 'Client Password Vault';
  else if (pathname.includes('/settings')) title = 'Firm Settings';
  else if (pathname.includes('/portal')) title = 'My Invoices & Documents';
  else if (pathname.includes('/chat')) title = user?.role === 'CLIENT' ? 'Chat with CA Firm' : 'Chat';
  else if (pathname.includes('/documents')) title = 'My Documents';
  else if (pathname.includes('/gst')) title = 'GST Compliance';
  else if (pathname.includes('/itr')) title = 'ITR Filing';
  else if (pathname.includes('/tds')) title = 'TDS Compliance & TRACES';
  else if (pathname.includes('/ecommerce')) title = 'E-Commerce Sales';
  else if (pathname.includes('/mca')) title = 'MCA Company Registry';
  else if (pathname.includes('/roc')) title = 'ROC Annual Filings';
  else if (pathname.includes('/tally-sync')) title = 'Tally Prime Sync';
  else if (pathname.includes('/converters')) title = 'Converters & OCR Hub';
  else if (pathname.includes('/calculators')) title = 'Calculators';
  else if (pathname.includes('/compliance')) title = 'Compliance Calendar';
  else if (pathname.includes('/subscription')) title = 'Subscription';
  else if (pathname.includes('/staff')) title = 'Manage Staff';
  else if (pathname.includes('/attendance')) title = 'Staff Attendance';
  else if (pathname.includes('/audit-logs')) title = 'Security Audit Logs';
  else if (pathname.includes('/dsc')) title = 'DSC Token Tracker';
  else if (pathname.includes('/notices')) title = 'Notice Management';
  else if (pathname.includes('/contact')) title = 'Contact Us';

  const userName = user?.name || "Guest";
  const displayName = userName || 'Guest User';
  const initials = userName
    ? userName.substring(0, 2).toUpperCase()
    : 'GU';

  return (
    <>
      <header
        className="h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 gap-4 backdrop-blur-md"
        style={{
          background: 'color-mix(in srgb, var(--color-bg-page) 80%, transparent)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onMenuClick}
            className={`p-1.5 -ml-1 rounded-lg transition-colors focus:outline-none ${
              showMenuButton ? 'block' : 'lg:hidden block'
            }`}
            style={{ color: 'var(--color-text-secondary)' }}
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1
              className="text-base lg:text-lg font-bold whitespace-nowrap tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {title}
            </h1>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all shadow-xs cursor-pointer focus:outline-none"
              title={`View ${title} guide & workflow`}
              aria-label={`View ${title} guide`}
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Guide</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-keyboard-shortcuts'));
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium transition-all shadow-xs cursor-pointer focus:outline-none"
              style={{
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
              }}
              title="Keyboard Shortcuts (Shift + ?)"
              aria-label="View Keyboard Shortcuts"
            >
              <Keyboard className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              <span className="hidden md:inline">Shortcuts</span>
              <kbd
                className="text-[10px] px-1 py-0.2 rounded font-mono"
                style={{
                  background: 'var(--color-bg-card-hover)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                ?
              </kbd>
            </button>
          </div>
        </div>

        {/* Global Search */}
        <div className="hidden sm:flex flex-1 justify-center max-w-lg mx-auto">
          <GlobalSearchBar />
        </div>

        <div className="flex items-center gap-3 shrink-0">
         
          <NotificationBell />

          <div
            className="relative pl-3"
            style={{ borderLeft: '1px solid var(--color-border)' }}
            ref={dropdownRef}
          >
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-950 to-emerald-500/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-xs overflow-hidden">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="hidden md:block text-left">
                <p
                  className="text-xs font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {displayName}
                </p>
                <p
                  className="text-[10px] font-mono leading-tight"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {user?.role || 'Chartered Accountant'}
                </p>
              </div>
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-3 w-52 rounded-xl shadow-2xl py-1 z-50"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  className="px-4 py-2 mb-1 lg:hidden"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {displayName}
                  </p>
                  <p
                    className="text-[10px] font-mono"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {user?.role || 'Chartered Accountant'}
                  </p>
                </div>

                {/* Profile Link */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/dashboard/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <UserIcon className="w-4 h-4" />
                  Profile & Settings
                </button>

                {/* Ask Fintecc AI */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-fintecc-ai'));
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Ask Fintecc AI
                </button>

                {/* Keyboard Shortcuts */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-keyboard-shortcuts'));
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    <span>Keyboard Shortcuts</span>
                  </div>
                  <kbd
                    className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: 'var(--color-bg-card-hover)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    Shift+?
                  </kbd>
                </button>

                {/* Theme Toggle Row */}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); toggleTheme(); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {theme === 'light' ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>

                <div className="my-1" style={{ borderTop: '1px solid var(--color-border)' }} />

                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <ModuleGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        guide={activeGuide}
      />
    </>
  );
}
