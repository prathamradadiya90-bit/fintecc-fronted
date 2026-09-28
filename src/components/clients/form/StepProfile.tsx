import React from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { User, Building2, Users, Briefcase, Landmark, ShieldCheck } from 'lucide-react';
import type { ClientFormData } from './clientForm.schema';
import type { ClientType } from '@/lib/types/client.types';

interface StepProfileProps {
  register: UseFormRegister<ClientFormData>;
  errors: FieldErrors<ClientFormData>;
  setValue: UseFormSetValue<ClientFormData>;
  watch: UseFormWatch<ClientFormData>;
}

const CLIENT_TYPES: { label: ClientType; icon: React.FC<{ className?: string }> }[] = [
  { label: 'Individual', icon: User },
  { label: 'Company', icon: Building2 },
  { label: 'Partnership', icon: Users },
  { label: 'LLP', icon: Briefcase },
  { label: 'HUF', icon: Landmark },
  { label: 'Trust', icon: ShieldCheck },
];

export const StepProfile: React.FC<StepProfileProps> = ({
  register,
  errors,
  setValue,
  watch,
}) => {
  const currentType = watch('type');
  const currentStatus = watch('status');

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* Step Header */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Client Identity & Classification
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Enter the primary legal details and registration category of the client.
        </p>
      </div>

      {/* Client Type Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Entity / Client Type <span className="text-[#9E4A4A]">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CLIENT_TYPES.map(({ label, icon: Icon }) => {
            const isSelected = currentType === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setValue('type', label, { shouldValidate: true })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-[#4A6FA5] bg-[#4A6FA5]/10 text-[#4A6FA5] dark:text-[#A8C5DA] ring-2 ring-[#4A6FA5]/20 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-[#4A6FA5] dark:text-[#A8C5DA]' : 'text-slate-400'}`} />
                <span className="text-xs">{label}</span>
              </button>
            );
          })}
        </div>
        {errors.type && <p className="text-[#9E4A4A] text-xs mt-1">{errors.type.message}</p>}
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Full Legal Name <span className="text-[#9E4A4A]">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Rajesh Kumar Mehta or Apex Enterprises"
          {...register('name')}
          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400"
        />
        {errors.name && <p className="text-[#9E4A4A] text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* Tax Identifiers: PAN & Aadhaar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              PAN Number <span className="text-[#9E4A4A]">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">AAAAA0000A</span>
          </div>
          <input
            type="text"
            placeholder="ABCPM1234R"
            maxLength={10}
            {...register('pan')}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              register('pan').onChange(e);
            }}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 font-mono uppercase transition-all placeholder:text-slate-400"
          />
          {errors.pan && <p className="text-[#9E4A4A] text-xs mt-1">{errors.pan.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Aadhaar Number <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">12 digits</span>
          </div>
          <input
            type="text"
            placeholder="e.g. 5432 1098 7654"
            maxLength={12}
            {...register('aadhaar')}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, '');
              register('aadhaar').onChange(e);
            }}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 font-mono transition-all placeholder:text-slate-400"
          />
          {errors.aadhaar && <p className="text-[#9E4A4A] text-xs mt-1">{errors.aadhaar.message}</p>}
        </div>
      </div>

      {/* Account Status */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Account Status
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {(['Active', 'Inactive', 'Blocked'] as const).map((status) => {
            const isSelected = currentStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setValue('status', status)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? status === 'Active'
                      ? 'border-[#3D7A64] bg-[#3D7A64]/10 text-[#3D7A64] dark:text-[#8EBFA9]'
                      : status === 'Inactive'
                      ? 'border-[#9E6B42] bg-[#9E6B42]/10 text-[#9E6B42] dark:text-[#E0B99B]'
                      : 'border-[#9E4A4A] bg-[#9E4A4A]/10 text-[#9E4A4A] dark:text-[#E59898]'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
