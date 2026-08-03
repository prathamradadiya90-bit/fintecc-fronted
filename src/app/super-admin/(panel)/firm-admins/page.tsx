"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import {
  Search,
  Power,
  PowerOff,
  ChevronRight,
  Building2,
  Mail,
  Calendar,
  BadgeCheck,
} from "lucide-react";
import {
  useGetFirmOwnersQuery,
  useGetFirmOwnerByIdQuery,
  useToggleFirmOwnerStatusMutation,
} from "@/lib/store/api/superAdminApi";
import { Table, Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { SlideOver } from "@/components/ui/SlideOver";
import { useToast } from "@/components/ui/Toast";
import type { FirmOwner } from "@/lib/types/superAdmin.types";

const PAGE_SIZE = 10;

// ─── Firm Owner Detail Panel ─────────────────────────────────────────────────
function FirmOwnerDetail({
  ownerId,
  onClose,
}: {
  ownerId: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useGetFirmOwnerByIdQuery(ownerId);
  const owner = data?.data;

  const fields = owner
    ? [
        { label: "Full Name", value: owner.name, icon: BadgeCheck },
        { label: "Email", value: owner.email, icon: Mail },
        { label: "Firm ID", value: owner.firmId || "No firm associated", icon: Building2 },
        {
          label: "Member Since",
          value: new Date(owner.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          icon: Calendar,
        },
      ]
    : [];

  return (
    <SlideOver isOpen title="Firm Admin Details" onClose={onClose} width="md">
      {isLoading ? (
        <div className="space-y-4 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !owner ? (
        <div className="flex items-center justify-center h-32 text-slate-400 text-[13px]">
          Could not load firm admin details.
        </div>
      ) : (
        <div className="pt-4 space-y-4">
          {/* Avatar + Name header */}
          <div className="flex flex-col items-center gap-3 py-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-[#091124] text-white flex items-center justify-center text-2xl font-bold">
              {owner.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800 text-base">{owner.name}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{owner.email}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                owner.isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}
            >
              {owner.isActive ? "Active" : "Blocked"}
            </span>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {fields.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-100 shrink-0">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-[13px] font-semibold text-slate-700 mt-0.5 break-all">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SlideOver>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function FirmAdminsContent() {
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounce search — avoid hammering the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== debouncedSearch) {
        setDebouncedSearch(searchInput);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, debouncedSearch, searchParams, pathname, router]);

  const { data, isLoading, isError } = useGetFirmOwnersQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const [toggleStatus] = useToggleFirmOwnerStatusMutation();

  const firmOwners = data?.data ?? [];
  const totalItems = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleToggle = useCallback(
    async (owner: FirmOwner, e: React.MouseEvent) => {
      e.stopPropagation();
      setPendingToggleId(owner.id);
      try {
        const nextState = !owner.isActive;
        await toggleStatus({ id: owner.id, isActive: nextState }).unwrap();
        showToast(
          `${owner.name} has been ${nextState ? "unblocked" : "blocked"} successfully.`,
          "success"
        );
      } catch (error: any) {
        showToast(
          error?.data?.message || "Failed to update status. Please try again.",
          "error"
        );
      } finally {
        setPendingToggleId(null);
      }
    },
    [toggleStatus, showToast]
  );

  const columns: Column<FirmOwner>[] = [
    {
      key: "name",
      header: "Firm Admin",
      render: (owner) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#091124] text-white flex items-center justify-center font-semibold text-xs shrink-0">
            {owner.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{owner.name}</p>
            <p className="text-[11px] text-slate-400">{owner.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "firmId",
      header: "Firm ID",
      render: (owner) => (
        <span className="text-[12px] text-slate-500 font-mono">
          {owner.firmId ? owner.firmId.substring(0, 8) + "…" : "—"}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (owner) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              owner.isActive ? "bg-emerald-500" : "bg-red-400"
            }`}
          />
          <span
            className={`text-[12px] font-medium ${
              owner.isActive ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {owner.isActive ? "Active" : "Blocked"}
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (owner) =>
        new Date(owner.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "actions",
      header: "Actions",
      render: (owner) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleToggle(owner, e)}
            disabled={pendingToggleId === owner.id}
            title={owner.isActive ? "Block Admin" : "Unblock Admin"}
            className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
              owner.isActive
                ? "text-slate-400 hover:text-red-500 hover:bg-red-50"
                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            {pendingToggleId === owner.id ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
            ) : owner.isActive ? (
              <PowerOff className="w-4 h-4" />
            ) : (
              <Power className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOwnerId(owner.id);
            }}
            title="View details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00C2B3] hover:bg-[#00C2B3]/10 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#091124]">Firm Admins</h2>
          <p className="text-slate-500 mt-0.5 text-[13px]">
            {isLoading ? "Loading…" : `${totalItems} registered firm admin${totalItems !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100">
        <div className="max-w-md">
          <Input
            placeholder="Search by name or email…"
            leftIcon={<Search className="w-4 h-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            id="firm-admins-search"
          />
        </div>
      </div>

      {/* Table */}
      {isError ? (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-6 text-center text-[13px] font-medium">
          Failed to load firm admins. Please check server status and try again.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Table
            data={firmOwners}
            columns={columns}
            keyExtractor={(owner) => owner.id}
            onRowClick={(owner) => setSelectedOwnerId(owner.id)}
            isLoading={isLoading}
            loadingRowCount={PAGE_SIZE}
            emptyMessage={
              debouncedSearch
                ? `No firm admins matching "${debouncedSearch}".`
                : "No firm admins registered yet."
            }
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Detail SlideOver */}
      {selectedOwnerId && (
        <FirmOwnerDetail
          ownerId={selectedOwnerId}
          onClose={() => setSelectedOwnerId(null)}
        />
      )}
    </div>
  );
}

export default function FirmAdminsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 animate-pulse">
          Loading Firm Admins…
        </div>
      }
    >
      <FirmAdminsContent />
    </Suspense>
  );
}
