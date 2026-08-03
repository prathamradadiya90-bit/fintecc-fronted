"use client";

import React from "react";
import { useSelector } from "react-redux";
import {
  useGetFirmOwnersQuery,
  useGetContactMessagesQuery,
} from "@/lib/store/api/superAdminApi";
import { Users, MessageSquare, CheckCircle2, Ban } from "lucide-react";
import type { RootState } from "@/lib/store/store";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  colorClass?: string;
  isLoading?: boolean;
}

function StatCard({ title, value, icon: Icon, colorClass = "text-[#00C2B3] bg-[#00C2B3]/10", isLoading }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        {isLoading ? (
          <div className="h-7 w-16 bg-slate-100 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-xl font-bold text-slate-800 mt-0.5">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function SuperAdminDashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: firmOwnersData, isLoading: loadingFirms } = useGetFirmOwnersQuery(
    { page: 1, limit: 1 },
    { refetchOnMountOrArgChange: true }
  );

  const { data: ticketsData, isLoading: loadingTickets } = useGetContactMessagesQuery(
    { page: 1, limit: 1 },
    { refetchOnMountOrArgChange: true }
  );

  const { data: pendingTickets, isLoading: loadingPending } = useGetContactMessagesQuery(
    { status: "PENDING", page: 1, limit: 1 },
    { refetchOnMountOrArgChange: true }
  );

  const { data: blockedFirms, isLoading: loadingBlocked } = useGetFirmOwnersQuery(
    { page: 1, limit: 1000 },
    { refetchOnMountOrArgChange: true }
  );

  const totalFirmAdmins = firmOwnersData?.meta?.total ?? 0;
  const totalTickets = ticketsData?.meta?.total ?? 0;
  const totalPending = pendingTickets?.meta?.total ?? 0;
  const totalBlocked = blockedFirms?.data?.filter((f) => !f.isActive).length ?? 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#091124]">
          Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
        </h2>
        <p className="text-slate-500 mt-1 text-[13px]">
          System overview for {today}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Firm Admins"
          value={totalFirmAdmins}
          icon={Users}
          isLoading={loadingFirms}
          colorClass="text-blue-600 bg-blue-50"
        />
        <StatCard
          title="Active Firm Admins"
          value={
            loadingBlocked
              ? "—"
              : (blockedFirms?.data?.filter((f) => f.isActive).length ?? 0)
          }
          icon={CheckCircle2}
          isLoading={loadingBlocked}
          colorClass="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          title="Blocked Admins"
          value={totalBlocked}
          icon={Ban}
          isLoading={loadingBlocked}
          colorClass="text-red-600 bg-red-50"
        />
        <StatCard
          title="Pending Tickets"
          value={totalPending}
          icon={MessageSquare}
          isLoading={loadingPending}
          colorClass="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Summary sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Firm Admins Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-slate-800">Firm Admins Overview</h3>
            <a
              href="/super-admin/firm-admins"
              className="text-[12px] text-[#00C2B3] hover:underline font-medium"
            >
              View all →
            </a>
          </div>
          {loadingFirms ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[13px] text-slate-600">Total registered</span>
                <span className="text-[13px] font-bold text-slate-800">{totalFirmAdmins}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[13px] text-slate-600">Active accounts</span>
                <span className="text-[13px] font-bold text-emerald-700">
                  {blockedFirms?.data?.filter((f) => f.isActive).length ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-red-50/60 border border-red-100">
                <span className="text-[13px] text-slate-600">Blocked accounts</span>
                <span className="text-[13px] font-bold text-red-600">{totalBlocked}</span>
              </div>
            </div>
          )}
        </div>

        {/* Support Tickets Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-slate-800">Support Tickets Overview</h3>
            <a
              href="/super-admin/support-tickets"
              className="text-[12px] text-[#00C2B3] hover:underline font-medium"
            >
              View all →
            </a>
          </div>
          {loadingTickets ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[13px] text-slate-600">Total tickets</span>
                <span className="text-[13px] font-bold text-slate-800">{totalTickets}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-[13px] text-slate-600">Pending review</span>
                <span className="text-[13px] font-bold text-amber-700">{totalPending}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-[13px] text-slate-600">Total messages</span>
                <span className="text-[13px] font-bold text-blue-700">{totalTickets}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
