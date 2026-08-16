import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { useCreateProfileMutation } from '@/lib/store/api/gstApi';
import { gstProfileSchema, GstProfileFormData } from '../validation/gst.validation';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
}

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  isOpen,
  onClose,
  defaultClientId = '',
}) => {
  const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery();
  const [createProfileApi, { isLoading: isSubmitting }] = useCreateProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GstProfileFormData>({
    resolver: zodResolver(gstProfileSchema),
    defaultValues: {
      clientId: defaultClientId,
      registrationType: 'REGULAR',
      filingFrequency: 'MONTHLY',
      stateCode: '27',
    },
  });

  const selectedClientId = watch('clientId');

  const clientOptions: SearchableOption[] = (clientsData?.data || []).map((client) => ({
    value: client.id,
    label: client.name,
    sublabel: client.companyName || undefined,
    badge: client.pan ? `PAN: ${client.pan}` : undefined,
    metadata: client.email || client.phone || undefined,
  }));

  const onSubmit = async (data: GstProfileFormData) => {
    try {
      await createProfileApi(data).unwrap();
      reset();
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to create GST profile');
    }
  };

  const handleGstinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setValue('gstin', val);
    // Auto populate state code from first 2 digits of GSTIN if valid
    if (val.length >= 2 && !isNaN(Number(val.substring(0, 2)))) {
      setValue('stateCode', val.substring(0, 2));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New GST Profile"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Searchable Client Selection */}
        <SearchableSelect
          label="Associated Client *"
          options={clientOptions}
          value={selectedClientId}
          onChange={(val) => setValue('clientId', val, { shouldValidate: true })}
          placeholder="-- Select or Search Client --"
          searchPlaceholder="Search client by name, company, PAN, email..."
          isLoading={isLoadingClients}
          error={errors.clientId?.message}
        />

        {/* GSTIN & Legal Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="GSTIN *"
            placeholder="27AAAAA0000A1Z5"
            maxLength={15}
            {...register('gstin')}
            onChange={handleGstinChange}
            error={errors.gstin?.message}
          />
          <Input
            label="Legal Name (as per GST Registration) *"
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
            Save Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};
