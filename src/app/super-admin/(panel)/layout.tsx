// Server Component — no "use client" directive.
// All client interactivity (sidebar toggle, mobile overlay) is encapsulated
// inside SuperAdminShell and its children.

import React from "react";
import { SuperAdminGuard } from "@/components/common/SuperAdminGuard";
import { SuperAdminShell } from "@/components/layouts/SuperAdminShell";

export default function SuperAdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminGuard>
      <SuperAdminShell>{children}</SuperAdminShell>
    </SuperAdminGuard>
  );
}
