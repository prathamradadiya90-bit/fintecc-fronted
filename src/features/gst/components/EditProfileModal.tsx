import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUpdateProfileMutation } from '@/lib/store/api/gstApi';
import { updateGstProfileSchema, GstProfileFormData } from '../validation/gst.validation';
import type { GstProfile } from '@/lib/types/gst.types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: GstProfile | null;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [updateProfileApi, { isLoading: isSubmitting }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GstProfileFormData>({
    resolver: zodResolver(updateGstProfileSchema as any),
  });

  useEffect(() => {
    if (profile) {
      reset({
        clientId: profile.clientId,
        gstin: profile.gstin,
        legalName: profile.legalName,
        tradeName: profile.tradeName || '',
        registrationType: profile.registrationType,
        stateCode: profile.stateCode,
        filingFrequency: profile.filingFrequency,
        authorizedSignatory: profile.authorizedSignatory || '',
      });
    }
  }, [profile, reset]);

  if (!profile) return null;

  const onSubmit = async (data: Partial<GstProfileFormData>) => {
    try {
      await updateProfileApi({ id: profile.id, data }).unwrap();
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update GST profile');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Profile - ${profile.legalName}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
        {/* GSTIN (Read-only for safety) & Legal Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="GSTIN"
            value={profile.gstin}
            disabled
            className="opacity-70 cursor-not-allowed"
          />
          <Input
            label="Legal Name *"
            placeholder="Acme Technologies Pvt Ltd"
            {...register('legalName')}
            error={errors.legalName?.message}
          />
        </div>

        {/* Trade Name & Authorized Signatory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Trade Name (Optional)"
            placeholder="Acme Tech"
            {...register('tradeName')}
            error={errors.tradeName?.message}
          />
          <Input
            label="Authorized Signatory (Optional)"
            placeholder="John Doe"
            {...register('authorizedSignatory')}
            error={errors.authorizedSignatory?.message}
          />
        </div>

        {/* Registration Type, Filing Frequency & State Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[13px] font-medium mb-1" style={{ color: 'var(--color-text-on-card)' }}>
              Registration Type
            </label>
            <select
              {...register('registrationType')}
              className="w-full px-2.5 py-1.5 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="REGULAR">REGULAR</option>
              <option value="COMPOSITION">COMPOSITION</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1" style={{ color: 'var(--color-text-on-card)' }}>
              Filing Frequency
            </label>
            <select
              {...register('filingFrequency')}
              className="w-full px-2.5 py-1.5 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00C2B3]"
              style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="MONTHLY">MONTHLY</option>
              <option value="QRMP">QRMP (Quarterly)</option>
            </select>
          </div>

          <Input
            label="State Code *"
            placeholder="27"
            maxLength={2}
            {...register('stateCode')}
            error={errors.stateCode?.message}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Update Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};
