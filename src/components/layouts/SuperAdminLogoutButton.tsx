"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { LogOut } from "lucide-react";
import { useLogoutMutation } from "@/lib/store/api/authApi";
import { logout as logoutAction } from "@/lib/store/features/auth/authSlice";

/**
 * Client component — needs Redux dispatch + router for the logout side-effect.
 * Isolated so the rest of the sidebar can be server-rendered.
 */
export function SuperAdminLogoutButton() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [logoutApi, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Ignore logout API errors — always clear local state
    } finally {
      dispatch(logoutAction());
      router.push("/super-admin");
    }
  };

  return (
    <div className="p-3 border-t border-[#1a2333]">
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-all disabled:opacity-50 text-[13px]"
      >
        <LogOut className="w-[18px] h-[18px]" />
        <span>{isLoading ? "Logging Out..." : "Log Out"}</span>
      </button>
    </div>
  );
}
