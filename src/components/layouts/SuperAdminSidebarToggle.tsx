"use client";

import React from "react";
import { X } from "lucide-react";

interface SuperAdminSidebarToggleProps {
  onClose?: () => void;
}

/**
 * Client component — renders the mobile close (X) button inside the sidebar.
 * Needed as a client component solely because it invokes the onClose callback
 * (an event handler passed down from the layout).
 */
export function SuperAdminSidebarToggle({
  onClose,
}: SuperAdminSidebarToggleProps) {
  return (
    <button
      onClick={onClose}
      className="lg:hidden text-slate-400 hover:text-white p-1"
      aria-label="Close sidebar"
    >
      <X className="w-5 h-5" />
    </button>
  );
}
