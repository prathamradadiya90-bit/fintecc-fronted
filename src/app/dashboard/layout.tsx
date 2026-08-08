"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Topbar } from '@/components/layouts/Topbar';
import { AuthGuard } from '@/components/common/AuthGuard';
import { ThemeProvider } from '@/providers/ThemeProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <ThemeProvider>
        <div className="flex min-h-screen" style={{ background: 'var(--color-bg-page)' }}>
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          <div className="flex-1 flex flex-col min-w-0 lg:ml-56">
            <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
            <main className="flex-1 p-4 lg:p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </AuthGuard>
  );
}
