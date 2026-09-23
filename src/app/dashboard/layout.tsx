"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Topbar } from '@/components/layouts/Topbar';
import { AuthGuard } from '@/components/common/AuthGuard';
import { SubscriptionGuard } from '@/components/common/SubscriptionGuard';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { KeyboardShortcutsProvider } from '@/providers/KeyboardShortcutsProvider';
import { AiAssistantWidget } from '@/components/common/AiAssistantWidget';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);

  const handleCloseSidebar = () => {
    setIsMobileOpen(false);
    setIsDesktopOpen(false);
  };

  const handleOpenSidebar = () => {
    setIsMobileOpen(true);
    setIsDesktopOpen(true);
  };

  return (
    <AuthGuard>
      <ThemeProvider>
        <KeyboardShortcutsProvider>
          <div className="flex min-h-screen" style={{ background: 'var(--color-bg-page)' }}>
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
              <div 
                className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                onClick={handleCloseSidebar}
              />
            )}
            
            <Sidebar 
              isOpen={isMobileOpen} 
              isDesktopOpen={isDesktopOpen}
              onClose={handleCloseSidebar} 
            />
            
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isDesktopOpen ? 'lg:ml-56' : 'lg:ml-0'}`}>
              <Topbar 
                onMenuClick={handleOpenSidebar}
                showMenuButton={!isDesktopOpen}
              />
              <main className="flex-1 p-4 lg:p-6 overflow-auto">
                <SubscriptionGuard>
                  {children}
                </SubscriptionGuard>
              </main>
            </div>
            <AiAssistantWidget />
          </div>
        </KeyboardShortcutsProvider>
      </ThemeProvider>
    </AuthGuard>

  );
}
