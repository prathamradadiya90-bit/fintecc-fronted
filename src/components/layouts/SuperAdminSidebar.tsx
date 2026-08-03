// Server Component — no "use client" directive.
// Interactive sub-trees (nav active state, logout) are isolated in their own
// client components so this shell is rendered on the server.

import React from "react";
import { Shield, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { SuperAdminNavLinks } from "@/components/layouts/SuperAdminNavLinks";
import { SuperAdminLogoutButton } from "@/components/layouts/SuperAdminLogoutButton";
import { SuperAdminSidebarToggle } from "@/components/layouts/SuperAdminSidebarToggle";

interface SuperAdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function SuperAdminSidebar({ isOpen, onClose }: SuperAdminSidebarProps) {
  return (
    <aside
      className={`w-56 h-screen bg-[#060E1E] flex flex-col fixed left-0 top-0 border-r border-[#1a2333] z-50 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo Area */}
      <div className="h-16 mt-2 mb-2 flex px-2 items-center justify-between">
        <div className="flex items-center">
          <Logo width={60} height={60} className="rounded-md" />
          <span className="text-white text-xl font-bold italic tracking-wide">
            FinTecc
          </span>
        </div>
        {/* Close button — client component because it needs onClose callback */}
        <SuperAdminSidebarToggle onClose={onClose} />
      </div>

      {/* Super Admin Badge */}
      <div className="mx-3 mb-3 px-3 py-2 rounded-xl bg-[#00C2B3]/10 border border-[#00C2B3]/20 flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-[#00C2B3] shrink-0" />
        <span className="text-[11px] font-semibold text-[#00C2B3] uppercase tracking-widest">
          Super Admin
        </span>
      </div>

      {/* Navigation — client: needs usePathname for active highlighting */}
      <SuperAdminNavLinks onClose={onClose} />

      {/* Logout — client: needs Redux dispatch + router */}
      <SuperAdminLogoutButton />
    </aside>
  );
}
