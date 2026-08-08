"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SlideOver } from '@/components/ui/SlideOver';
import { useInviteStaffMutation, useUpdateStaffMutation } from '@/lib/store/api/authApi';
import { useToast } from '@/components/ui/Toast';
import type { User } from '@/lib/types/auth.types';

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
    <div className="w-5 h-5 rounded-full bg-[#00C2B3] flex items-center justify-center text-white text-[10px] font-bold">
      {letter}
    </div>
    <h4 className="text-[11px] font-bold text-[#4B637D] uppercase tracking-[0.1em]">{title}</h4>
  </div>
);

export function StaffFormModal({ isOpen, onClose, staff }: StaffFormModalProps) {
  const [inviteStaff, { isLoading: isInviting }] = useInviteStaffMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
  const { showToast } = useToast();

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
      isActive: true,
    },
  });

  useEffect(() => {
    if (staff && isOpen) {
      reset({
        name: staff.name,
        email: staff.email,
        role: staff.role as any || 'EMPLOYEE',
        isActive: staff.isActive !== false,
      });
    } else if (!isOpen) {
      reset({
        name: '',
        email: '',
        role: 'EMPLOYEE',
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
          isActive: data.isActive,
        }).unwrap();
        showToast('Staff member updated successfully');
      } else {
        await inviteStaff({
          name: data.name,
          email: data.email,
          role: data.role,
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
            className="flex-1 md:flex-none px-6 py-2.5 bg-[#00C2B3] hover:bg-[#00a89b] text-[13px] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
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
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all disabled:dark:bg-slate-800/50 bg-slate-50 disabled:dark:text-slate-500 text-slate-400"
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
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all disabled:dark:bg-slate-800/50 bg-slate-50 disabled:dark:text-slate-500 text-slate-400"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              {...register('role')}
              className="w-full px-3.5 py-2.5 dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all appearance-none"
            >
              {ROLES_LIST.map((roleOpt) => (
                <option key={roleOpt.value} value={roleOpt.value}>
                  {roleOpt.label}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>

          {staff && (
            <div className="pt-4 border-t dark:border-slate-800 border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer group w-max">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input 
                    type="checkbox" 
                    className="peer appearance-none w-5 h-5 border border-slate-300 rounded cursor-pointer checked:bg-teal-500 checked:border-teal-500 transition-all"
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
