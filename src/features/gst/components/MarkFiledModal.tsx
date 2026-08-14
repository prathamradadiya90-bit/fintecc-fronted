import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMarkFiledMutation } from '@/lib/store/api/gstApi';
import { markFiledSchema, MarkFiledFormData } from '../validation/gst.validation';

interface MarkFiledModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnId: string;
}

export const MarkFiledModal: React.FC<MarkFiledModalProps> = ({
  isOpen,
  onClose,
  returnId,
}) => {
  const [markFiledApi, { isLoading: isSubmitting }] = useMarkFiledMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MarkFiledFormData>({
    resolver: zodResolver(markFiledSchema),
    defaultValues: {
      arn: 'AA2703261234567',
    },
  });

  const onSubmit = async (data: MarkFiledFormData) => {
    try {
      await markFiledApi({ id: returnId, arn: data.arn }).unwrap();
      reset();
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to mark return as filed');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Return as Filed Manually"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          Use this option if the return was filed directly on the GST portal. Enter the Acknowledgement Reference Number (ARN) received upon submission.
        </p>

        <Input
          label="Acknowledgement Reference Number (ARN) *"
          placeholder="e.g. AA2703261234567"
          {...register('arn')}
          error={errors.arn?.message}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Confirm & Mark Filed
          </Button>
        </div>
      </form>
    </Modal>
  );
};
