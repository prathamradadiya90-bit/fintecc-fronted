"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { name: "Firm Admins", href: "/super-admin/firm-admins", icon: Users },
  {
    name: "Support Tickets",
    href: "/super-admin/support-tickets",
    icon: MessageSquare,
  },
];

interface SuperAdminNavLinksProps {
  onClose?: () => void;
}

/**
 * Client component — needs usePathname() to compute the active route.
 * Kept intentionally small; all static structure lives in the server-rendered sidebar.
 */
export function SuperAdminNavLinks({ onClose }: SuperAdminNavLinksProps) {
  const pathname = usePathname();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <nav className="flex-1 pt-1 pb-6 flex flex-col gap-1.5 px-3 overflow-y-auto">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={handleClick}
            className={`
              flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative text-[13px]
              ${
                isActive
                  ? "text-[#00C2B3] bg-[#00C2B3]/10 font-medium"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }
            `}
          >
            <Icon
              className={`w-[18px] h-[18px] ${
                isActive
                  ? "text-[#00C2B3]"
                  : "text-slate-400 group-hover:text-slate-300"
              }`}
            />
            <span>{item.name}</span>
            {isActive && (
              <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#00C2B3]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
