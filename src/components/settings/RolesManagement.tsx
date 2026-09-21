'use client';

import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Check,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/lib/store/api/rolesApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SlideOver } from '@/components/ui/SlideOver';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { AVAILABLE_PERMISSIONS, CustomRole } from '@/lib/types/role.types';

export function RolesManagement() {
  const { showToast } = useToast();
  const { data: rolesResponse, isLoading } = useGetRolesQuery();

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomRole | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const roles = rolesResponse?.data || [];

  const handleOpenCreate = () => {
    setEditingRole(null);
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (role: CustomRole) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || '');
    setSelectedPermissions(role.permissions || []);
    setIsSlideOverOpen(true);
  };

  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false);
    setEditingRole(null);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const toggleGroupPermissions = (groupPermIds: string[]) => {
    const allSelected = groupPermIds.every((id) => selectedPermissions.includes(id));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !groupPermIds.includes(id)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupPermIds])));
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Role name is required', 'error');
      return;
    }

    try {
      if (editingRole) {
        await updateRole({
          id: editingRole.id,
          data: {
            name: name.trim(),
            description: description.trim(),
            permissions: selectedPermissions,
          },
        }).unwrap();
        showToast(`Role "${name}" updated successfully`, 'success');
      } else {
        await createRole({
          name: name.trim(),
          description: description.trim(),
          permissions: selectedPermissions,
        }).unwrap();
        showToast(`Custom role "${name}" created successfully`, 'success');
      }
      handleCloseSlideOver();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to save role', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRole(deleteTarget.id).unwrap();
      showToast(`Role "${deleteTarget.name}" deleted successfully`, 'success');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete role', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Custom Roles & Permission Sets
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Define custom role templates with granular read/write privileges for staff members.
          </p>
        </div>

        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4 text-white" />}>
          Create Custom Role
        </Button>
      </div>

      {/* Roles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border animate-pulse h-40"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            />
          ))}
        </div>
      ) : roles.length === 0 ? (
        <div
          className="p-8 text-center rounded-2xl border border-dashed"
          style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
        >
          <Shield className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            No Custom Roles Defined
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create tailored roles with specific permissions for audit trainees, senior managers, or client relationship officers.
          </p>
          <Button onClick={handleOpenCreate} variant="outline" className="mt-4 text-xs">
            Add First Custom Role
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="p-5 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4 transition-all hover:border-[#00C2B3]/50"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#00C2B3]/10 text-[#00C2B3] flex items-center justify-center font-bold">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        {role.name}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {role.permissions?.length || 0} permissions assigned
                      </span>
                    </div>
                  </div>

                  {!role.isSystem && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(role)}
                        className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-[#00C2B3] transition-colors"
                        title="Edit Role"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(role)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {role.description && (
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {role.description}
                  </p>
                )}

                {/* Permission Badges Preview */}
                <div className="flex flex-wrap gap-1 pt-2">
                  {(role.permissions || []).slice(0, 5).map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20"
                    >
                      {perm}
                    </span>
                  ))}
                  {(role.permissions?.length || 0) > 5 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#00C2B3]/10 text-[#00C2B3]">
                      +{(role.permissions?.length || 0) - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Role SlideOver */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={handleCloseSlideOver}
        title={editingRole ? `Edit Role: ${editingRole.name}` : 'Create Custom Role'}
        width="40vw"
        footer={
          <div className="w-full flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseSlideOver} disabled={isCreating || isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} isLoading={isCreating || isUpdating}>
              {editingRole ? 'Update Role' : 'Save Role'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveRole} className="space-y-5 py-2">
          <Input
            label="Role Title / Name"
            placeholder="e.g. Compliance Auditor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Role Description
            </label>
            <textarea
              rows={2}
              placeholder="Summary of responsibilities and intended staff tier..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-subtle)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Granular Permission Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label
                className="text-sm font-bold uppercase tracking-wider block"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Granted Permissions ({selectedPermissions.length})
              </label>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {AVAILABLE_PERMISSIONS.map((group) => {
                const groupPermIds = group.permissions.map((p) => p.id);
                const allSelected = groupPermIds.every((id) => selectedPermissions.includes(id));

                return (
                  <div
                    key={group.group}
                    className="p-3.5 rounded-xl border space-y-2.5"
                    style={{
                      background: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        {group.group}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleGroupPermissions(groupPermIds)}
                        className="text-[11px] font-semibold text-[#00C2B3] hover:underline"
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {group.permissions.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'border-[#00C2B3]/40 bg-[#00C2B3]/5'
                                : 'border-transparent hover:bg-slate-500/5'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                              className="mt-0.5 rounded text-[#00C2B3] focus:ring-[#00C2B3]"
                            />
                            <div>
                              <span className="font-semibold block" style={{ color: 'var(--color-text-primary)' }}>
                                {perm.label}
                              </span>
                              <span className="text-[11px] text-slate-400 block">
                                {perm.description}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </SlideOver>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Custom Role"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Confirm Delete
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Are you sure you want to delete the role <strong>&quot;{deleteTarget?.name}&quot;</strong>?
          </p>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Staff assigned this role will immediately revert to their default base role permissions.</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
