"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Search, Mail, MessageSquare, Calendar } from "lucide-react";
import {
  useGetContactMessagesQuery,
  useUpdateContactStatusMutation,
} from "@/lib/store/api/superAdminApi";
import { Table, Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { SlideOver } from "@/components/ui/SlideOver";
import { useToast } from "@/components/ui/Toast";
import type { ContactMessage, ContactStatus } from "@/lib/types/superAdmin.types";

const PAGE_SIZE = 10;

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ContactStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
  },
  RESOLVED: {
    label: "Resolved",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
  },
};

const ALL_STATUSES: ContactStatus[] = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ContactStatus }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-100",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} inline-block`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Inline Status Selector ───────────────────────────────────────────────────
function StatusSelector({
  ticket,
  onUpdate,
  isPending,
}: {
  ticket: ContactMessage;
  onUpdate: (id: string, status: ContactStatus) => Promise<void>;
  isPending: boolean;
}) {
  return (
    <select
      value={ticket.status}
      disabled={isPending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        onUpdate(ticket.id, e.target.value as ContactStatus);
      }}
      className="text-[12px] border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00C2B3]/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_CONFIG[s].label}
        </option>
      ))}
    </select>
  );
}

// ─── Ticket Detail SlideOver ─────────────────────────────────────────────────
function TicketDetail({
  ticket,
  onClose,
  onStatusUpdate,
  isPending,
}: {
  ticket: ContactMessage;
  onClose: () => void;
  onStatusUpdate: (id: string, status: ContactStatus) => Promise<void>;
  isPending: boolean;
}) {
  return (
    <SlideOver isOpen title="Support Ticket" onClose={onClose} width="md">
      <div className="pt-4 space-y-4">
        {/* Meta info */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 rounded-lg bg-white border border-slate-100 shrink-0">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Email
              </p>
              <p className="text-[13px] font-semibold text-slate-700 mt-0.5 break-all">
                {ticket.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 rounded-lg bg-white border border-slate-100 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Submitted
              </p>
              <p className="text-[13px] font-semibold text-slate-700 mt-0.5">
                {new Date(ticket.createdAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Message
            </p>
          </div>
          <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
            {ticket.message}
          </p>
        </div>

        {/* Status update */}
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <p className="text-[12px] font-medium text-slate-500 mb-2">Update Status</p>
          <div className="flex items-center gap-3">
            <StatusBadge status={ticket.status} />
            <span className="text-slate-300">→</span>
            <select
              value={ticket.status}
              disabled={isPending}
              onChange={(e) => onStatusUpdate(ticket.id, e.target.value as ContactStatus)}
              className="flex-1 text-[13px] border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00C2B3]/40 cursor-pointer disabled:opacity-50"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </SlideOver>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function SupportTicketsContent() {
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "">("");
  const [selectedTicket, setSelectedTicket] = useState<ContactMessage | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounce search
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

  // Reset page when filter changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("page") !== "1" && statusFilter !== undefined) {
       // Only reset if we change filter and we are not on page 1.
       // Note: to prevent infinite loops, we just update URL if filter changes
       // Actually a better pattern is to push to router on filter change directly in the select onChange,
       // but for now we'll do it in effect if the filter changed from its previous state.
       // We'll skip resetting page here in useEffect to avoid loops, and instead do it in the onChange handler below.
    }
  }, [statusFilter, searchParams]);

  const { data, isLoading, isError } = useGetContactMessagesQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

  const [updateStatus] = useUpdateContactStatusMutation();

  const tickets = data?.data ?? [];
  const totalItems = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleStatusUpdate = async (id: string, status: ContactStatus) => {
    setUpdatingId(id);
    // Optimistically update selected ticket if it's the same one
    if (selectedTicket?.id === id) {
      setSelectedTicket((prev) => (prev ? { ...prev, status } : prev));
    }
    try {
      await updateStatus({ id, status }).unwrap();
      showToast(`Ticket status updated to "${STATUS_CONFIG[status].label}".`, "success");
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to update status.", "error");
      // Revert optimistic update
      if (selectedTicket?.id === id) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: prev.status } : prev));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: Column<ContactMessage>[] = [
    {
      key: "email",
      header: "Email",
      render: (ticket) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <span className="text-[13px] font-medium text-slate-700">{ticket.email}</span>
        </div>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (ticket) => (
        <span className="text-[13px] text-slate-500 max-w-xs truncate block">
          {ticket.message.length > 60 ? ticket.message.substring(0, 60) + "…" : ticket.message}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (ticket) => <StatusBadge status={ticket.status} />,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (ticket) =>
        new Date(ticket.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "actions",
      header: "Change Status",
      render: (ticket) => (
        <StatusSelector
          ticket={ticket}
          onUpdate={handleStatusUpdate}
          isPending={updatingId === ticket.id}
        />
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#091124]">Support Tickets</h2>
        <p className="text-slate-500 mt-0.5 text-[13px]">
          {isLoading
            ? "Loading…"
            : `${totalItems} ticket${totalItems !== 1 ? "s" : ""} total`}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 sm:max-w-md">
          <Input
            placeholder="Search by email…"
            leftIcon={<Search className="w-4 h-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            id="support-tickets-search"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ContactStatus | "");
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", "1");
            router.push(`${pathname}?${params.toString()}`);
          }}
          id="support-tickets-status-filter"
          className="px-3 py-1.5 border border-slate-200 rounded-xl text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C2B3]/40 cursor-pointer"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isError ? (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-6 text-center text-[13px] font-medium">
          Failed to load support tickets. Please check server status and try again.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Table
            data={tickets}
            columns={columns}
            keyExtractor={(ticket) => ticket.id}
            onRowClick={(ticket) => setSelectedTicket(ticket)}
            isLoading={isLoading}
            loadingRowCount={PAGE_SIZE}
            emptyMessage={
              debouncedSearch || statusFilter
                ? "No tickets match your filters."
                : "No support tickets yet."
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
      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onStatusUpdate={handleStatusUpdate}
          isPending={updatingId === selectedTicket.id}
        />
      )}
    </div>
  );
}

export default function SupportTicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 animate-pulse">
          Loading Support Tickets…
        </div>
      }
    >
      <SupportTicketsContent />
    </Suspense>
  );
}
