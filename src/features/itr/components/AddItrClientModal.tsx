import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAddItrClientMutation } from '@/lib/store/api/itrApi';
import { addItrClientSchema, AddItrClientFormData } from '../validation/itr.validation';

interface AddItrClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddItrClientModal: React.FC<AddItrClientModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [addItrClientApi, { isLoading: isSubmitting }] = useAddItrClientMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddItrClientFormData>({
    resolver: zodResolver(addItrClientSchema),
    defaultValues: {
      pan: '',
      name: '',
      email: '',
      mobile: '',
    },
  });

  const onSubmit = async (data: AddItrClientFormData) => {
    try {
      await addItrClientApi(data).unwrap();
      reset();
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to add ITR client');
    }
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setValue('pan', val, { shouldValidate: true });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add ITR Client / Taxpayer"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* PAN Input */}
        <div>
          <Input
            label="Taxpayer PAN *"
            placeholder="ABCDE1234F"
            maxLength={10}
            {...register('pan')}
            onChange={handlePanChange}
            error={errors.pan?.message}
          />
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            10-digit Permanent Account Number (e.g. ABCDE1234F)
          </p>
        </div>

        {/* Taxpayer Name */}
        <Input
          label="Full Legal Name (as per PAN Card) *"
          placeholder="e.g. Rajesh Kumar Sharma"
          {...register('name')}
          error={errors.name?.message}
        />

        {/* Email & Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address (Optional)"
            placeholder="rajesh@example.com"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Mobile Number (Optional)"
            placeholder="9876543210"
            maxLength={10}
            {...register('mobile')}
            error={errors.mobile?.message}
          />
        </div>

        <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 text-xs space-y-1">
          <p className="font-semibold text-teal-800 dark:text-teal-300">
            Income Tax Portal Integration:
          </p>
          <p className="text-teal-700 dark:text-teal-400 text-[11px]">
            Once registered, you can request taxpayer consent to automatically fetch 26AS/AIS prefill data and submit ITR filings directly.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Add Client
          </Button>
        </div>
      </form>
    </Modal>
  );
};
