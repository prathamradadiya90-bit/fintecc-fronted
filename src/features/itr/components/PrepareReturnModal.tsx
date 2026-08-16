import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';
import { useGetItrClientsQuery, usePrepareReturnMutation } from '@/lib/store/api/itrApi';
import { prepareReturnSchema, PrepareReturnFormData } from '../validation/itr.validation';

interface PrepareReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
}

const ITR_FORM_OPTIONS = [
  { value: 'ITR1', label: 'ITR-1 (Sahaj) — Salaried & Single House Property (< ₹50L)' },
  { value: 'ITR2', label: 'ITR-2 — Capital Gains, Multiple House Properties, Foreign Assets' },
  { value: 'ITR3', label: 'ITR-3 — Business / Professional Income (Proprietorships)' },
  { value: 'ITR4', label: 'ITR-4 (Sugam) — Presumptive Business / Profession (44AD/44ADA)' },
  { value: 'ITR5', label: 'ITR-5 — Partnership Firms, LLPs, AOP, BOI' },
  { value: 'ITR6', label: 'ITR-6 — Companies other than Section 8 / Exempt entities' },
  { value: 'ITR7', label: 'ITR-7 — Trusts, Political Parties, Charitable Institutions' },
];

export const PrepareReturnModal: React.FC<PrepareReturnModalProps> = ({
  isOpen,
  onClose,
  defaultClientId = '',
}) => {
  const router = useRouter();
  const { data: clientsData, isLoading: isLoadingClients } = useGetItrClientsQuery();
  const [prepareReturnApi, { isLoading: isSubmitting }] = usePrepareReturnMutation();

  const currentYear = new Date().getFullYear();
  const defaultAY = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
  const defaultFY = `${currentYear - 1}-${currentYear.toString().slice(-2)}`;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PrepareReturnFormData>({
    resolver: zodResolver(prepareReturnSchema),
    defaultValues: {
      clientId: defaultClientId,
      assessmentYear: defaultAY,
      financialYear: defaultFY,
      form: 'ITR1',
    },
  });

  const selectedClientId = watch('clientId');

  const clientOptions: SearchableOption[] = (clientsData?.data || []).map((client) => ({
    value: client.id,
    label: client.name,
    badge: client.pan,
    sublabel: client.client?.companyName ? client.client.companyName : undefined,
    metadata: client.email || client.mobile || undefined,
  }));

  useEffect(() => {
    if (defaultClientId) {
      setValue('clientId', defaultClientId);
    }
  }, [defaultClientId, setValue]);

  const selectedAY = watch('assessmentYear');

  // Sync FY when AY changes
  const handleAyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ay = e.target.value;
    setValue('assessmentYear', ay);
    const startYear = parseInt(ay.split('-')[0], 10);
    if (!isNaN(startYear)) {
      setValue('financialYear', `${startYear - 1}-${startYear.toString().slice(-2)}`);
    }
  };

  const onSubmit = async (data: PrepareReturnFormData) => {
    try {
      const response = await prepareReturnApi(data).unwrap();
      reset();
      onClose();
      if (response?.data?.id) {
        router.push(`/dashboard/itr/returns/${response.data.id}`);
      }
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to prepare ITR return draft');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Prepare New ITR Return Draft"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Searchable Client Selection */}
        <SearchableSelect
          label="Select Taxpayer / Client *"
          options={clientOptions}
          value={selectedClientId}
          onChange={(val) => setValue('clientId', val, { shouldValidate: true })}
          placeholder="-- Select or Search Taxpayer --"
          searchPlaceholder="Search by PAN, taxpayer name, company, email..."
          isLoading={isLoadingClients}
          error={errors.clientId?.message}
        />

        {/* Assessment Year & Financial Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium mb-1" style={{ color: 'var(--color-text-on-card)' }}>
              Assessment Year (AY) *
            </label>
            <select
              value={selectedAY}
              onChange={handleAyChange}
              className="w-full px-2.5 py-2 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="2027-28">AY 2027-28</option>
              <option value="2026-27">AY 2026-27 (Current)</option>
              <option value="2025-26">AY 2025-26</option>
              <option value="2024-25">AY 2024-25</option>
            </select>
            {errors.assessmentYear && (
              <p className="mt-1 text-xs text-red-500">{errors.assessmentYear.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1" style={{ color: 'var(--color-text-on-card)' }}>
              Financial Year (FY)
            </label>
            <input
              type="text"
              readOnly
              {...register('financialYear')}
              className="w-full px-2.5 py-2 rounded-xl text-[13px] cursor-not-allowed opacity-80"
              style={{
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
        </div>

        {/* ITR Form Type */}
        <div>
          <label className="block text-[13px] font-medium mb-1" style={{ color: 'var(--color-text-on-card)' }}>
            ITR Form Type *
          </label>
          <select
            {...register('form')}
            className="w-full px-2.5 py-2 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-input)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            {ITR_FORM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.form && (
            <p className="mt-1 text-xs text-red-500">{errors.form.message}</p>
          )}
        </div>

        {/* Note / Info */}
        <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs space-y-1">
          <p className="font-semibold text-blue-800 dark:text-blue-300">
            Filing Workflow Step 1 of 4:
          </p>
          <p className="text-blue-700 dark:text-blue-400 text-[11px]">
            Preparing the return initializes the draft with taxpayer master info. You can subsequently fetch prefill AIS/26AS data, validate schema rules, and submit online.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Initialize Draft
          </Button>
        </div>
      </form>
    </Modal>
  );
};
