import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGetProfilesQuery, useCreateReturnMutation } from '@/lib/store/api/gstApi';
import { gstReturnSchema, GstReturnFormData } from '../validation/gst.validation';

interface CreateReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProfileId?: string;
}

export const CreateReturnModal: React.FC<CreateReturnModalProps> = ({
  isOpen,
  onClose,
  defaultProfileId = '',
}) => {
  const { data: profilesData, isLoading: isLoadingProfiles } = useGetProfilesQuery();
  const [createReturnApi, { isLoading: isSubmitting }] = useCreateReturnMutation();

  const profiles = profilesData?.data || [];

  // Generate current month default period in YYYY-MM format (e.g. 2026-03)
  const today = new Date();
  const defaultYear = today.getFullYear();
  const defaultMonth = String(today.getMonth() + 1).padStart(2, '0');
  const defaultPeriod = `${defaultYear}-${defaultMonth}`;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GstReturnFormData>({
    resolver: zodResolver(gstReturnSchema),
    defaultValues: {
      gstProfileId: defaultProfileId,
      returnType: 'GSTR1',
      period: defaultPeriod,
    },
  });

  const onSubmit = async (data: GstReturnFormData) => {
    try {
      await createReturnApi(data).unwrap();
      reset();
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to create return draft');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New GST Return Draft"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Select GST Profile */}
        <div>
          <label className="block text-[13px] font-medium mb-1" style={{ color: 'var(--color-text-on-card)' }}>
            Select GST Profile *
          </label>
          <select
            {...register('gstProfileId')}
            disabled={isLoadingProfiles}
            className="w-full px-2.5 py-1.5 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
            style={{
              background: 'var(--color-bg-input)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">-- Select GSTIN Registration --</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.gstin} — {profile.legalName} ({profile.client?.name || 'Client'})
              </option>
            ))}
          </select>
          {errors.gstProfileId && (
            <p className="mt-1 text-xs text-red-500">{errors.gstProfileId.message}</p>
          )}
        </div>

        {/* Return Type */}
        <div>
          <label className="block text-[13px] font-medium mb-1" style={{ color: 'var(--color-text-on-card)' }}>
            Return Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all"
              style={{ background: 'var(--color-bg-input)', borderColor: 'var(--color-border)' }}
            >
              <input
                type="radio"
                value="GSTR1"
                {...register('returnType')}
                className="text-[#00C2B3] focus:ring-[#00C2B3]"
              />
              <div>
                <p className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>
                  GSTR-1
                </p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                  Outward Supplies & Sales
                </p>
              </div>
            </label>

            <label
              className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all"
              style={{ background: 'var(--color-bg-input)', borderColor: 'var(--color-border)' }}
            >
              <input
                type="radio"
                value="GSTR3B"
                {...register('returnType')}
                className="text-[#00C2B3] focus:ring-[#00C2B3]"
              />
              <div>
                <p className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>
                  GSTR-3B
                </p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                  Summary Return & Tax Payment
                </p>
              </div>
            </label>
          </div>
          {errors.returnType && (
            <p className="mt-1 text-xs text-red-500">{errors.returnType.message}</p>
          )}
        </div>

        {/* Period */}
        <Input
          label="Filing Period (YYYY-MM or YYYY-Q1) *"
          placeholder="e.g. 2026-03"
          {...register('period')}
          error={errors.period?.message}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Create Draft Return
          </Button>
        </div>
      </form>
    </Modal>
  );
};
