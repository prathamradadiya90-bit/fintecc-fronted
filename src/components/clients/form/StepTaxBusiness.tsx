import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { FileSpreadsheet, Check } from 'lucide-react';
import type { ClientFormData } from './clientForm.schema';

interface StepTaxBusinessProps {
  register: UseFormRegister<ClientFormData>;
  errors: FieldErrors<ClientFormData>;
  watch: UseFormWatch<ClientFormData>;
  setValue: UseFormSetValue<ClientFormData>;
}

export const StepTaxBusiness: React.FC<StepTaxBusinessProps> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  const isGstRegistered = watch('isGstRegistered');
  const clientType = watch('type');

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* Step Header */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Tax Registrations & Business Details
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Specify commercial name, GST registration status, and tax deduction numbers.
        </p>
      </div>

      {/* Company / Trade Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Company / Trade Name{' '}
          <span className="text-[11px] font-normal text-slate-400">
            {clientType === 'Individual' ? '(Optional for proprietorship)' : '(Registered entity name)'}
          </span>
        </label>
        <input
          type="text"
          placeholder="e.g. Acme Innovations Pvt Ltd"
          {...register('companyName')}
          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400"
        />
        {errors.companyName && (
          <p className="text-[#9E4A4A] text-xs mt-1">{errors.companyName.message}</p>
        )}
      </div>

      {/* GST Registration Card */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isGstRegistered
            ? 'border-[#4A6FA5]/40 bg-[#4A6FA5]/5'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                isGstRegistered
                  ? 'bg-[#4A6FA5] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                GST Registered Entity
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enable if the client holds an active Goods & Services Tax registration.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isGstRegistered}
            onClick={() => setValue('isGstRegistered', !isGstRegistered, { shouldValidate: true })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
              isGstRegistered ? 'bg-[#4A6FA5]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                isGstRegistered ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* GSTIN Input - animated reveal */}
        {isGstRegistered && (
          <div className="mt-4 pt-4 border-t border-[#4A6FA5]/15 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                GSTIN Number <span className="text-[#9E4A4A]">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                15 Characters (e.g. 22AAAAA0000A1Z5)
              </span>
            </div>
            <input
              type="text"
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
              {...register('gstin')}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                register('gstin').onChange(e);
              }}
              className="w-full px-3.5 py-2.5 border border-[#4A6FA5]/40 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 font-mono uppercase transition-all placeholder:text-slate-400"
            />
            {errors.gstin && (
              <p className="text-[#9E4A4A] text-xs mt-1.5 font-medium">{errors.gstin.message}</p>
            )}
          </div>
        )}
      </div>

      {/* TAN Number */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            TAN Number{' '}
            <span className="text-[11px] font-normal text-slate-400">(Tax Deduction Account)</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider">ABCD12345E</span>
        </div>
        <input
          type="text"
          placeholder="ABCD12345E"
          maxLength={10}
          {...register('tan')}
          onChange={(e) => {
            e.target.value = e.target.value.toUpperCase();
            register('tan').onChange(e);
          }}
          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 font-mono uppercase transition-all placeholder:text-slate-400"
        />
        {errors.tan && <p className="text-[#9E4A4A] text-xs mt-1">{errors.tan.message}</p>}
      </div>
    </div>
  );
};
