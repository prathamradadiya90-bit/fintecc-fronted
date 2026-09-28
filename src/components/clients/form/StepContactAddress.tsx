import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Mail, Send } from 'lucide-react';
import type { ClientFormData } from './clientForm.schema';

interface StepContactAddressProps {
  register: UseFormRegister<ClientFormData>;
  errors: FieldErrors<ClientFormData>;
  isEditMode: boolean;
  sendInvite: boolean;
  setSendInvite: (val: boolean) => void;
}

export const StepContactAddress: React.FC<StepContactAddressProps> = ({
  register,
  errors,
  isEditMode,
  sendInvite,
  setSendInvite,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* Step Header */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Contact Details & Communication
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Enter mobile number, communication email, and official mailing address.
        </p>
      </div>

      {/* Phone Numbers & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Mobile */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Primary Mobile Number <span className="text-[#9E4A4A]">*</span>
          </label>
          <div className="flex">
            <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-r-0 border-slate-200 dark:border-slate-800 rounded-l-xl text-xs text-slate-500 font-semibold flex items-center justify-center">
              +91
            </div>
            <input
              type="text"
              placeholder="98765 43210"
              maxLength={10}
              {...register('phone')}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
                register('phone').onChange(e);
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 font-mono transition-all placeholder:text-slate-400"
            />
          </div>
          {errors.phone && <p className="text-[#9E4A4A] text-xs mt-1">{errors.phone.message}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address <span className="text-[11px] font-normal text-slate-400">(For portal & alerts)</span>
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="client@example.com"
              {...register('email')}
              className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>
          {errors.email && <p className="text-[#9E4A4A] text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Secondary Mobile */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Secondary / Alternate Phone <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="Alternate contact number"
            maxLength={10}
            {...register('secondaryPhone')}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, '');
              register('secondaryPhone').onChange(e);
            }}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 font-mono transition-all placeholder:text-slate-400"
          />
          {errors.secondaryPhone && <p className="text-[#9E4A4A] text-xs mt-1">{errors.secondaryPhone.message}</p>}
        </div>
      </div>

      {/* Address Block */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Address Information
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Street / Building / Office Address
            </label>
            <input
              type="text"
              placeholder="e.g. 402, Trade Heights, MG Road"
              {...register('address.street')}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">City</label>
              <input
                type="text"
                placeholder="Mumbai"
                {...register('address.city')}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">State</label>
              <input
                type="text"
                placeholder="Maharashtra"
                {...register('address.state')}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">PIN Code</label>
              <input
                type="text"
                placeholder="400001"
                maxLength={6}
                {...register('address.zip')}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                  register('address.zip').onChange(e);
                }}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 font-mono transition-all placeholder:text-slate-400"
              />
              {errors.address?.zip && (
                <p className="text-[#9E4A4A] text-xs mt-1">{errors.address.zip.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Portal Invitation Banner (New Client Only) */}
      {!isEditMode && (
        <div className="p-3.5 rounded-xl border border-[#4A6FA5]/20 bg-[#4A6FA5]/5 flex items-start gap-3">
          <input
            type="checkbox"
            id="sendInviteCheckbox"
            checked={sendInvite}
            onChange={(e) => setSendInvite(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#4A6FA5] focus:ring-[#4A6FA5] cursor-pointer"
          />
          <label htmlFor="sendInviteCheckbox" className="cursor-pointer select-none">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#4A6FA5]" /> Send client portal invitation email immediately
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              The client will receive an activation email with login instructions to access their dashboard.
            </p>
          </label>
        </div>
      )}
    </div>
  );
};
