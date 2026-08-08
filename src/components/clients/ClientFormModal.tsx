import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SlideOver } from '@/components/ui/SlideOver';
import { useCreateClientMutation, useUpdateClientMutation } from '@/lib/store/api/clientsApi';
import { useToast } from '@/components/ui/Toast';
import type { Client } from '@/lib/types/client.types';

const SERVICES = [
  'GST Return Filing',
  'Income Tax Return',
  'TDS Return',
  'ROC Filing',
  'Tax Audit',
  'Bookkeeping',
  'Payroll',
  'Loan Processing',
];

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/i;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

const clientSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  pan: z.string().regex(panRegex, 'Invalid PAN format'),
  aadhaar: z.string().regex(aadhaarRegex, 'Aadhaar must be 12 digits').optional().or(z.literal('')),
  phone: z.string().regex(phoneRegex, 'Invalid mobile number'),
  secondaryPhone: z.string().regex(phoneRegex, 'Invalid mobile number').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  type: z.enum(['Individual', 'Company', 'Partnership', 'LLP', 'HUF', 'Trust']),
  companyName: z.string().optional(),
  isGstRegistered: z.boolean().optional(),
  gstin: z.string().optional(),
  tan: z.string().regex(tanRegex, 'Invalid TAN format').optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive', 'Blocked']),
  tags: z.array(z.string()), // For services assigned
  notes: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().regex(/^\d{6}$/, 'Invalid PIN code').optional().or(z.literal('')),
    country: z.string().optional(),
  }).optional(),
  bankDetails: z.array(
    z.object({
      accountName: z.string().optional(),
      accountNumber: z.string().regex(/^\d{9,18}$/, 'Invalid Account Number').optional().or(z.literal('')),
      ifsc: z.string().regex(ifscRegex, 'Invalid IFSC Code').optional().or(z.literal('')),
      bankName: z.string().optional(),
    })
  ).optional(),
}).superRefine((data, ctx) => {
  if (data.isGstRegistered) {
    if (!data.gstin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GSTIN is required when registered",
        path: ["gstin"],
      });
    } else if (!gstinRegex.test(data.gstin)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid GSTIN format",
        path: ["gstin"],
      });
    }
  }
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

const SectionHeader = ({ letter, title }: { letter: string; title: string }) => (
  <div className="flex items-center gap-2.5 mt-6 mb-4">
    <div className="w-5 h-5 rounded-full bg-[#00C2B3] flex items-center justify-center text-white text-[10px] font-bold">
      {letter}
    </div>
    <h4 className="text-[11px] font-bold text-[#4B637D] uppercase tracking-[0.1em]">{title}</h4>
  </div>
);

const defaultFormValues: ClientFormData = {
  name: '',
  pan: '',
  aadhaar: '',
  phone: '',
  secondaryPhone: '',
  email: '',
  type: 'Individual',
  companyName: '',
  isGstRegistered: false,
  gstin: '',
  tan: '',
  status: 'Active',
  tags: [],
  notes: '',
  address: { street: '', city: '', state: '', zip: '', country: '' },
  bankDetails: [{ accountName: '', accountNumber: '', ifsc: '', bankName: '' }],
};

export function ClientFormModal({ isOpen, onClose, client }: ClientFormModalProps) {
  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultFormValues,
  });

  const isGstRegistered = watch('isGstRegistered');

  useEffect(() => {
    if (client && isOpen) {
      reset({
        name: client.name,
        pan: client.pan || '',
        aadhaar: client.aadhaar || '',
        phone: client.phone || '',
        secondaryPhone: client.secondaryPhone || '',
        email: client.email || '',
        type: client.type as any || 'Individual',
        companyName: client.companyName || '',
        isGstRegistered: !!client.gstin,
        gstin: client.gstin || '',
        tan: client.tan || '',
        status: client.status as any || 'Active',
        tags: client.tags || [],
        notes: client.notes || '',
        address: client.address || { street: '', city: '', state: '', zip: '', country: '' },
        bankDetails: client.bankDetails?.length 
          ? client.bankDetails 
          : [{ accountName: '', accountNumber: '', ifsc: '', bankName: '' }],
      });
    } else if (!client && isOpen) {
      reset(defaultFormValues);
    } else if (!isOpen) {
      setTimeout(() => reset(defaultFormValues), 300);
    }
  }, [client, isOpen, reset]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      // Backend doesn't expect `isGstRegistered`, we just use it for UI logic
      const { isGstRegistered, ...payload } = data;
      
      if (!isGstRegistered) {
        payload.gstin = '';
      }

      if (client) {
        await updateClient({ id: client.id, data: payload }).unwrap();
        showToast('Client updated successfully');
      } else {
        await createClient(payload).unwrap();
        showToast('Client created successfully');
      }
      onClose();
    } catch (error: any) {
      const errorMsg = error?.data?.message || 'Failed to save client';
      showToast(errorMsg, 'error');
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'Edit Client' : 'Add New Client'}
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
            {isLoading ? 'Saving...' : 'Save Client'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="pb-4">
        {/* PERSONAL INFORMATION */}
        <SectionHeader letter="A" title="PERSONAL INFORMATION" />
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Rajesh Kumar Mehta"
              {...register('name')}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800">
                PAN Number <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] dark:text-slate-500 text-slate-400 font-mono tracking-widest">AAAAA0000A</span>
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
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 font-mono uppercase transition-all"
            />
            {errors.pan && <p className="text-red-500 text-xs mt-1">{errors.pan.message}</p>}
          </div>
          
          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">
              Aadhaar Number
            </label>
            <input
              type="text"
              placeholder="000000000000"
              maxLength={12}
              {...register('aadhaar')}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
                register('aadhaar').onChange(e);
              }}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 font-mono transition-all"
            />
            {errors.aadhaar && <p className="text-red-500 text-xs mt-1">{errors.aadhaar.message}</p>}
          </div>
        </div>

        {/* CONTACT DETAILS */}
        <SectionHeader letter="B" title="CONTACT DETAILS" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <div className="px-3.5 py-2.5 dark:bg-slate-800/50 bg-slate-50 border border-r-0 dark:border-slate-700 border-slate-200 rounded-l-lg text-[13px] dark:dark:text-slate-500 text-slate-400 text-slate-500 font-medium flex items-center justify-center">
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
                className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-r-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="contact@example.com"
              {...register('email')}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">Secondary Phone</label>
            <input
              type="text"
              placeholder="Optional"
              maxLength={10}
              {...register('secondaryPhone')}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
                register('secondaryPhone').onChange(e);
              }}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all"
            />
            {errors.secondaryPhone && <p className="text-red-500 text-xs mt-1">{errors.secondaryPhone.message}</p>}
          </div>
        </div>

        {/* ADDRESS */}
        <SectionHeader letter="C" title="ADDRESS" />
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">Street</label>
            <input
              type="text"
              placeholder="123 Main St"
              {...register('address.street')}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">City</label>
              <input
                type="text"
                placeholder="Mumbai"
                {...register('address.city')}
                className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">State</label>
              <input
                type="text"
                placeholder="MH"
                {...register('address.state')}
                className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">ZIP Code</label>
              <input
                type="text"
                placeholder="400001"
                maxLength={6}
                {...register('address.zip')}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                  register('address.zip').onChange(e);
                }}
                className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all"
              />
              {errors.address?.zip && <p className="text-red-500 text-xs mt-1">{errors.address.zip.message}</p>}
            </div>
          </div>
        </div>

        {/* BUSINESS DETAILS */}
        <SectionHeader letter="D" title="BUSINESS DETAILS" />
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">
              Client Type
            </label>
            <select
              {...register('type')}
              className="w-full px-3.5 py-2.5 dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all appearance-none"
            >
              <option value="Individual">Individual</option>
              <option value="Company">Company</option>
              <option value="Partnership">Partnership</option>
              <option value="LLP">LLP</option>
              <option value="HUF">HUF</option>
              <option value="Trust">Trust</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">Company Name (If applicable)</label>
            <input
              type="text"
              placeholder="Company Ltd"
              {...register('companyName')}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group w-max">
            <div className="relative flex items-center justify-center w-5 h-5">
              <input 
                type="checkbox" 
                className="peer appearance-none w-5 h-5 border border-slate-300 rounded cursor-pointer checked:bg-teal-500 checked:border-teal-500 transition-all"
                {...register('isGstRegistered')}
              />
              <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="text-[13px] font-medium dark:text-slate-300 text-slate-700 group-hover:text-slate-900 transition-colors">
              GST Registered
            </span>
          </label>

          {isGstRegistered && (
            <div>
              <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">GSTIN Number</label>
              <input
                type="text"
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                {...register('gstin')}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  register('gstin').onChange(e);
                }}
                className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 font-mono uppercase transition-all"
              />
              {errors.gstin && <p className="text-red-500 text-xs mt-1">{errors.gstin.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">TAN Number</label>
            <input
              type="text"
              placeholder="ABCD12345E"
              maxLength={10}
              {...register('tan')}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                register('tan').onChange(e);
              }}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 font-mono uppercase transition-all"
            />
            {errors.tan && <p className="text-red-500 text-xs mt-1">{errors.tan.message}</p>}
          </div>
        </div>

        {/* BANK DETAILS */}
        <SectionHeader letter="E" title="BANK DETAILS" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">Bank Name</label>
            <input
              type="text"
              placeholder="HDFC Bank"
              {...register('bankDetails.0.bankName')}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">Account Name</label>
            <input
              type="text"
              placeholder="John Doe"
              {...register('bankDetails.0.accountName')}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">Account Number</label>
            <input
              type="text"
              placeholder="50100012345678"
              {...register('bankDetails.0.accountNumber')}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 font-mono transition-all"
            />
            {errors.bankDetails?.[0]?.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.bankDetails[0].accountNumber.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold dark:text-slate-200 text-slate-800 mb-1.5">IFSC Code</label>
            <input
              type="text"
              placeholder="HDFC0001234"
              maxLength={11}
              {...register('bankDetails.0.ifsc')}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                register('bankDetails.0.ifsc').onChange(e);
              }}
              className="w-full px-3.5 py-2.5 border dark:border-slate-700 border-slate-200 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-teal-900/30 focus:ring-teal-100 focus:border-[#00C2B3] text-[13px] dark:text-slate-300 text-slate-700 font-mono uppercase transition-all"
            />
            {errors.bankDetails?.[0]?.ifsc && <p className="text-red-500 text-xs mt-1">{errors.bankDetails[0].ifsc.message}</p>}
          </div>
        </div>

        {/* SERVICES ASSIGNED */}
        <SectionHeader letter="G" title="SERVICES ASSIGNED" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <>
                {SERVICES.map((service) => (
                  <label key={service} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                      <input 
                        type="checkbox" 
                        className="peer appearance-none w-5 h-5 border border-slate-300 rounded cursor-pointer checked:bg-teal-500 checked:border-teal-500 transition-all"
                        checked={field.value.includes(service)}
                        onChange={(e) => {
                          const updated = e.target.checked 
                            ? [...field.value, service]
                            : field.value.filter(t => t !== service);
                          field.onChange(updated);
                        }}
                      />
                      <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-[13px] font-medium dark:text-slate-300 text-slate-700 group-hover:text-slate-900 transition-colors">
                      {service}
                    </span>
                  </label>
                ))}
              </>
            )}
          />
        </div>
      </form>
    </SlideOver>
  );
}
