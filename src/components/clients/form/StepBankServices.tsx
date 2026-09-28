import React from 'react';
import { UseFormRegister, FieldErrors, Control, Controller, UseFormWatch } from 'react-hook-form';
import { Landmark, Check, Briefcase, FileText } from 'lucide-react';
import { SERVICES, type ClientFormData } from './clientForm.schema';

interface StepBankServicesProps {
  register: UseFormRegister<ClientFormData>;
  errors: FieldErrors<ClientFormData>;
  control: Control<ClientFormData>;
  watch: UseFormWatch<ClientFormData>;
}

export const StepBankServices: React.FC<StepBankServicesProps> = ({
  register,
  errors,
  control,
  watch,
}) => {
  const formData = watch();

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Step Header */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Bank Accounts, Services & Final Review
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Enter banking coordinates, assign compliance services, and verify before saving.
        </p>
      </div>

      {/* Bank Account Section */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-[#4A6FA5]/10 text-[#4A6FA5] dark:text-[#A8C5DA] flex items-center justify-center">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Primary Settlement Bank Account
            </h4>
            <p className="text-[11px] text-slate-400">Used for refunds, filing records, and fee reconciliation.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Bank Name
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Bank Ltd, ICICI Bank, State Bank of India"
              {...register('bankDetails.0.bankName')}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Account Holder Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rajesh Kumar Mehta"
              {...register('bankDetails.0.accountName')}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Account Number
            </label>
            <input
              type="text"
              placeholder="50100012345678"
              maxLength={18}
              {...register('bankDetails.0.accountNumber')}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
                register('bankDetails.0.accountNumber').onChange(e);
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 font-mono transition-all placeholder:text-slate-400"
            />
            {errors.bankDetails?.[0]?.accountNumber && (
              <p className="text-[#9E4A4A] text-xs mt-1">
                {errors.bankDetails[0].accountNumber.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                IFSC Code
              </label>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">HDFC0001234</span>
            </div>
            <input
              type="text"
              placeholder="HDFC0001234"
              maxLength={11}
              {...register('bankDetails.0.ifsc')}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                register('bankDetails.0.ifsc').onChange(e);
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 font-mono uppercase transition-all placeholder:text-slate-400"
            />
            {errors.bankDetails?.[0]?.ifsc && (
              <p className="text-[#9E4A4A] text-xs mt-1">
                {errors.bankDetails[0].ifsc.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Services Assigned */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Briefcase className="w-4 h-4 text-[#4A6FA5]" />
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Assigned Compliance Services
          </label>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
          Select all CA / tax services managed by your firm for this client.
        </p>

        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SERVICES.map((service) => {
                const isSelected = field.value?.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => {
                      const updated = isSelected
                        ? field.value.filter((s: string) => s !== service)
                        : [...(field.value || []), service];
                      field.onChange(updated);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-[#4A6FA5] bg-[#4A6FA5]/10 text-[#4A6FA5] dark:text-[#A8C5DA] font-semibold ring-1 ring-[#4A6FA5]/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate pr-1.5">{service}</span>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#4A6FA5] text-white'
                          : 'border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      {/* Internal Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Internal Notes & Remarks <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
        </label>
        <textarea
          rows={2}
          placeholder="Add any specific client instructions, billing notes, or compliance reminders..."
          {...register('notes')}
          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6FA5]/20 focus:border-[#4A6FA5] text-xs text-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Quick Summary Review Box */}
      <div className="p-3.5 rounded-xl border border-[#4A6FA5]/20 bg-[#4A6FA5]/5">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-[#4A6FA5]" />
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Client Profile Summary
          </h5>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 block">Name</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {formData.name || 'Not set'}
            </span>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 block">Type / PAN</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block font-mono">
              {formData.pan ? `${formData.type} • ${formData.pan}` : formData.type}
            </span>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 block">Mobile</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block font-mono">
              {formData.phone ? `+91 ${formData.phone}` : 'Not set'}
            </span>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 block">GST Status</span>
            <span
              className={`font-semibold truncate block ${
                formData.isGstRegistered ? 'text-[#3D7A64]' : 'text-slate-500'
              }`}
            >
              {formData.isGstRegistered ? 'Registered' : 'Not Registered'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
