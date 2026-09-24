"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SlideOver } from '@/components/ui/SlideOver';
import { useInviteStaffMutation, useUpdateStaffMutation } from '@/lib/store/api/authApi';
import { useGetRolesQuery } from '@/lib/store/api/rolesApi';
import { useGetSettingsQuery } from '@/lib/store/api/settingsApi';
import { useToast } from '@/components/ui/Toast';
import type { User } from '@/lib/types/auth.types';
import type { FirmBranch } from '@/lib/types/settings.types';

const ROLES_LIST = [
  { value: 'PARTNER', label: 'Partner' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'AUDITOR', label: 'Auditor' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'TAX_CONSULTANT', label: 'Tax Consultant' },
];

const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['PARTNER', 'EMPLOYEE', 'AUDITOR', 'ACCOUNTANT', 'TAX_CONSULTANT']),
  customRoleId: z.string().optional(),
  branchId: z.string().optional(),
  isActive: z.boolean(),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: User | null;
}

const SectionHeader = ({ letter, title }: { letter: string; title: string }) => (
  <div className="flex items-center gap-2.5 mt-6 mb-4">
    <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">
      {letter}
    </div>
    <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">{title}</h4>
  </div>
);

export function StaffFormModal({ isOpen, onClose, staff }: StaffFormModalProps) {
  const [inviteStaff, { isLoading: isInviting }] = useInviteStaffMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
  const { data: rolesResponse } = useGetRolesQuery(undefined, { skip: !isOpen });
  const { data: settingsResponse } = useGetSettingsQuery(undefined, { skip: !isOpen });
  const { showToast } = useToast();

  const customRoles = rolesResponse?.data || [];
  const branches = settingsResponse?.data?.branches || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'EMPLOYEE',
      customRoleId: '',
      branchId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (staff && isOpen) {
      reset({
        name: staff.name,
        email: staff.email,
        role: (staff.role as any) || 'EMPLOYEE',
        customRoleId: staff.customRoleId || '',
        branchId: staff.branchId || '',
        isActive: staff.isActive !== false,
      });
    } else if (!isOpen) {
      reset({
        name: '',
        email: '',
        role: 'EMPLOYEE',
        customRoleId: '',
        branchId: '',
        isActive: true,
      });
    }
  }, [staff, isOpen, reset]);

  const onSubmit = async (data: StaffFormData) => {
    try {
      if (staff) {
        await updateStaff({
          id: staff.id,
          role: data.role,
          customRoleId: data.customRoleId || null,
          branchId: data.branchId || null,
          isActive: data.isActive,
        }).unwrap();
        showToast('Staff member updated successfully');
      } else {
        await inviteStaff({
          name: data.name,
          email: data.email,
          role: data.role,
          customRoleId: data.customRoleId || undefined,
          branchId: data.branchId || undefined,
        }).unwrap();
        showToast(`Invitation sent to ${data.email}`);
      }
      onClose();
    } catch (error: any) {
      const errorMsg = error?.data?.message || 'Failed to save staff member';
      showToast(errorMsg, 'error');
    }
  };

  const isLoading = isInviting || isUpdating;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={staff ? 'Edit Staff Member' : 'Invite Staff Member'}
      width="40vw"
      footer={
        <div className="w-full flex justify-between md:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 md:flex-none px-6 py-2.5 border dark:border-slate-700 border-slate-200 text-[13px] dark:dark:text-slate-500 text-slate-400 text-slate-600 font-semibold rounded-xl hover:dark:bg-slate-800/50 bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-[13px] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : staff ? 'Save Changes' : 'Send Invite'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="pb-4">
        <SectionHeader letter="A" title="STAFF PROFILE DETAILS" />
        
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Jane Doe"
              {...register('name')}
              disabled={!!staff}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-[13px] dark:text-slate-300 text-slate-700 transition-all disabled:dark:bg-slate-800/50 bg-slate-50 disabled:dark:text-slate-500 text-slate-400"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="jane@example.com"
              {...register('email')}
              disabled={!!staff}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-[13px] dark:text-slate-300 text-slate-700 transition-all disabled:dark:bg-slate-800/50 bg-slate-50 disabled:dark:text-slate-500 text-slate-400"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">
              Base Role <span className="text-red-500">*</span>
            </label>
            <select
              {...register('role')}
              className="w-full px-3.5 py-2.5 dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-[13px] dark:text-slate-300 text-slate-700 transition-all appearance-none"
            >
              {ROLES_LIST.map((roleOpt) => (
                <option key={roleOpt.value} value={roleOpt.value}>
                  {roleOpt.label}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">
              Custom Role & Permission Preset (Optional)
            </label>
            <select
              {...register('customRoleId')}
              className="w-full px-3.5 py-2.5 dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-[13px] dark:text-slate-300 text-slate-700 transition-all appearance-none"
            >
              <option value="">Standard Base Role Permissions (Default)</option>
              {customRoles.map((cr) => (
                <option key={cr.id} value={cr.id}>
                  {cr.name} ({cr.permissions?.length || 0} permissions)
                </option>
              ))}
            </select>
            <p className="text-[11px] dark:text-slate-500 text-slate-400 mt-1">
              Assign an advanced custom permission template configured in Settings.
            </p>
          </div>

          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">
              Branch Office Assignment (Optional)
            </label>
            <select
              {...register('branchId')}
              className="w-full px-3.5 py-2.5 dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-[13px] dark:text-slate-300 text-slate-700 transition-all appearance-none"
            >
              <option value="">Head Office / Unassigned</option>
              {branches.map((b: FirmBranch, idx: number) => (
                <option key={b.branchName || idx} value={b.branchName}>
                  {b.branchName} {b.address ? `— ${b.address}` : ''}
                </option>
              ))}
            </select>
          </div>

          {staff && (
            <div className="pt-4 border-t dark:border-slate-800 border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer group w-max">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input 
                    type="checkbox" 
                    className="peer appearance-none w-5 h-5 border border-slate-300 rounded cursor-pointer checked:bg-emerald-600 checked:border-emerald-600 transition-all"
                    {...register('isActive')}
                  />
                  <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-[13px] font-medium dark:text-slate-300 text-slate-700 group-hover:text-slate-900 transition-colors">
                  Active Access Status
                </span>
              </label>
              <p className="text-[11px] dark:text-slate-500 text-slate-400 mt-1 ml-8">
                Unchecking this will temporarily revoke the staff member&apos;s login access without deleting their account.
              </p>
            </div>
          )}
        </div>
      </form>
    </SlideOver>
  );
}
