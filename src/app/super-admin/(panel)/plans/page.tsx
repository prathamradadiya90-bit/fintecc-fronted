"use client";

import React, { useState, Suspense } from "react";
import { Plus, Edit2, Trash2, Power, PowerOff } from "lucide-react";
import { 
  useGetAllPlansQuery, 
  useCreatePlanMutation, 
  useUpdatePlanMutation, 
  useDeletePlanMutation 
} from "@/lib/store/api/plansApi";
import { Table, Column } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Plan, CreatePlanRequest, UpdatePlanRequest } from "@/lib/types/plan.types";

function PlansContent() {
  const { showToast } = useToast();
  const { data, isLoading, isError, refetch } = useGetAllPlansQuery();
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();

  const plans = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName("");
    setDescription("");
    setPrice("");
    setDurationMonths("1");
    setFeaturesText("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description || "");
    setPrice(plan.price.toString());
    setDurationMonths(plan.durationMonths.toString());
    setFeaturesText(plan.features ? plan.features.join(", ") : "");
    setIsActive(plan.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const features = featuresText.split(',').map(f => f.trim()).filter(f => f);
      
      if (editingPlan) {
        const req: UpdatePlanRequest = {
          name,
          description,
          price: Number(price),
          durationMonths: Number(durationMonths),
          features,
          isActive,
        };
        await updatePlan({ id: editingPlan.id, data: req }).unwrap();
        showToast("Plan updated successfully", "success");
      } else {
        const req: CreatePlanRequest = {
          name,
          description,
          price: Number(price),
          durationMonths: Number(durationMonths),
          features,
          isActive,
        };
        await createPlan(req).unwrap();
        showToast("Plan created successfully", "success");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "An error occurred", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to deactivate this plan?")) {
      try {
        await deletePlan(id).unwrap();
        showToast("Plan deactivated successfully", "success");
      } catch (err: any) {
        showToast(err.message || "Failed to deactivate plan", "error");
      }
    }
  };

  const columns: Column<Plan>[] = [
    {
      key: "name",
      header: "Plan Name",
      render: (plan) => (
        <div>
          <p className="font-semibold text-slate-800">{plan.name}</p>
          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{plan.description}</p>
        </div>
      )
    },
    {
      key: "price",
      header: "Price",
      render: (plan) => (
        <span className="font-medium text-slate-700">₹{Number(plan.price).toLocaleString()}</span>
      )
    },
    {
      key: "durationMonths",
      header: "Duration",
      render: (plan) => (
        <span className="text-slate-600">{plan.durationMonths} {plan.durationMonths === 1 ? 'month' : 'months'}</span>
      )
    },
    {
      key: "isActive",
      header: "Status",
      render: (plan) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              plan.isActive ? "bg-emerald-500" : "bg-red-400"
            }`}
          />
          <span
            className={`text-[12px] font-medium ${
              plan.isActive ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {plan.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (plan) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(plan)}
            title="Edit Plan"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(plan.id)}
            title="Deactivate Plan"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            disabled={!plan.isActive}
          >
            <PowerOff className="w-4 h-4" />
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
          <h2 className="text-xl font-bold text-[#091124]">Subscription Plans</h2>
          <p className="text-slate-500 mt-0.5 text-[13px]">
            Manage subscription tiers and pricing for firm owners.
          </p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Create Plan
        </Button>
      </div>

      {/* Table */}
      {isError ? (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-6 text-center text-[13px] font-medium">
          Failed to load plans. <Button variant="ghost" onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : (
        <Table
          data={plans}
          columns={columns}
          keyExtractor={(plan) => plan.id}
          isLoading={isLoading}
          emptyMessage="No plans created yet."
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? "Edit Plan" : "Create New Plan"}
      >
        <form id="plan-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Plan Name"
            placeholder="e.g. Professional Plan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Description"
            placeholder="Brief description for the landing page"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              min="0"
              placeholder="e.g. 1999"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Duration (Months)"
              type="number"
              min="1"
              placeholder="e.g. 12"
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1" style={{ color: 'var(--color-text-on-card)' }}>
              Features (comma separated)
            </label>
            <textarea
              className="w-full px-2.5 py-1.5 rounded-xl text-[13px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              rows={3}
              placeholder="e.g. Unlimited Clients, GST Tracking, Priority Support"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-[#00C2B3] focus:ring-[#00C2B3]"
            />
            <label htmlFor="isActive" className="text-[13px] font-medium text-slate-700">
              Active (Visible to users)
            </label>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating || isUpdating}>
              {editingPlan ? "Save Changes" : "Create Plan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 animate-pulse">
          Loading Plans...
        </div>
      }
    >
      <PlansContent />
    </Suspense>
  );
}
