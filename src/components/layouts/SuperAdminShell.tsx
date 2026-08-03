"use client";

import React, { useState } from "react";
import { SuperAdminSidebar } from "@/components/layouts/SuperAdminSidebar";
import { SuperAdminTopbar } from "@/components/layouts/SuperAdminTopbar";

/**
 * Client component that owns the mobile sidebar open/close state.
 * The sidebar shell itself is a Server Component; only the overlay
 * and the hamburger button are interactive client-side pieces.
 */
export function SuperAdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Server Component; receives isOpen for CSS transform only */}
      <SuperAdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-56">
        <SuperAdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
