import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Plus, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';
import { useGetProfilesQuery, useCreateReturnMutation } from '@/lib/store/api/gstApi';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { CreateProfileModal } from './CreateProfileModal';
import { gstReturnSchema, GstReturnFormData } from '../validation/gst.validation';

interface CreateReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProfileId?: string;
  defaultClientId?: string;
}

export const CreateReturnModal: React.FC<CreateReturnModalProps> = ({
  isOpen,
  onClose,
  defaultProfileId = '',
  defaultClientId = '',
}) => {
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: profilesData, isLoading: isLoadingProfiles, refetch: refetchProfiles } = useGetProfilesQuery();
  const { data: clientsData } = useGetClientsQuery();
  const [createReturnApi, { isLoading: isSubmitting }] = useCreateReturnMutation();

  const profiles = profilesData?.data || [];
  const clients = clientsData?.data || [];

  // Generate current month default period in YYYY-MM format (e.g. 2026-11)
  const today = new Date();
  const defaultYear = today.getFullYear();
  const defaultMonth = String(today.getMonth() + 1).padStart(2, '0');
  const defaultPeriod = `${defaultYear}-${defaultMonth}`;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<GstReturnFormData>({
    resolver: zodResolver(gstReturnSchema),
    defaultValues: {
      gstProfileId: defaultProfileId,
      returnType: 'GSTR1',
      period: defaultPeriod,
    },
  });

  const selectedProfileId = watch('gstProfileId');
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  // Auto-select when modal opens, defaultProfileId changes, or when profiles are loaded
  useEffect(() => {
    if (isOpen) {
      if (defaultProfileId) {
        setValue('gstProfileId', defaultProfileId, { shouldValidate: true });
        clearErrors('gstProfileId');
      } else if (profiles.length > 0 && !selectedProfileId) {
        setValue('gstProfileId', profiles[0].id, { shouldValidate: true });
        clearErrors('gstProfileId');
      }
    }
  }, [isOpen, defaultProfileId, profiles, selectedProfileId, setValue, clearErrors]);

  // Reset errors when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSubmitError(null);
    }
  }, [isOpen]);

  const profileOptions: SearchableOption[] = profiles.map((profile) => ({
    value: profile.id,
    label: profile.legalName,
    badge: profile.gstin,
    sublabel: profile.client?.name ? `Client: ${profile.client.name}` : undefined,
    metadata: profile.tradeName ? `Trade: ${profile.tradeName}` : undefined,
  }));

  const handleProfileCreated = (newProfile: any) => {
    refetchProfiles();
    if (newProfile?.id) {
      setValue('gstProfileId', newProfile.id, { shouldValidate: true });
      clearErrors('gstProfileId');
    }
    setIsCreateProfileOpen(false);
  };

  const onSubmit = async (data: GstReturnFormData) => {
    setSubmitError(null);
    try {
      await createReturnApi(data).unwrap();
      reset();
      onClose();
    } catch (err: any) {
      const errMsg =
        err?.data?.errors && Array.isArray(err.data.errors) && err.data.errors.length > 0
          ? err.data.errors.map((e: any) => `${e.field ? `${e.field}: ` : ''}${e.message}`).join(', ')
          : err?.data?.message || err?.message || 'Failed to create return draft';
      setSubmitError(errMsg);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create New GST Return Draft"
        maxWidth="md"
        overflow="visible"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* In-Modal Error Banner */}
          {submitError && (
            <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">Creation Error</p>
                <p className="text-[11px] leading-relaxed opacity-90">{submitError}</p>
              </div>
            </div>
          )}

          {/* No Profiles Warning Callout */}
          {!isLoadingProfiles && profiles.length === 0 && (
            <div
              className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-2.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>No Client GSTIN Profiles Available</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Before you can prepare a GSTR-1 or GSTR-3B return, you must onboard your client&apos;s 15-digit GSTIN profile.
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsCreateProfileOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs h-7.5 px-3"
              >
                + Onboard Client GSTIN First
              </Button>
            </div>
          )}

          {/* Select GST Profile */}
          <div className="space-y-1 relative">
            <div className="flex items-center justify-between">
              <label className="block text-[13px] font-medium" style={{ color: 'var(--color-text-on-card)' }}>
                Select GST Profile *
              </label>
              <button
                type="button"
                onClick={() => setIsCreateProfileOpen(true)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> New Profile
              </button>
            </div>
            <SearchableSelect
              options={profileOptions}
              value={selectedProfileId}
              onChange={(val) => {
                setValue('gstProfileId', val, { shouldValidate: true });
                clearErrors('gstProfileId');
              }}
              placeholder={
                isLoadingProfiles
                  ? 'Loading GST profiles...'
                  : profiles.length === 0
                  ? 'No profiles found — click "+ New Profile" above'
                  : '-- Select or Search GST Profile --'
              }
              searchPlaceholder="Search by GSTIN, Legal Name, Client..."
              isLoading={isLoadingProfiles}
              emptyMessage="No matching GST profiles found."
              error={errors.gstProfileId?.message}
            />

            {/* Selected Profile Badge / Info */}
            {selectedProfile && (
              <div
                className="p-2.5 rounded-xl border flex items-center justify-between text-xs mt-1.5 transition-all"
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="font-semibold text-xs truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {selectedProfile.legalName}
                    </p>
                    <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                      {selectedProfile.gstin}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-[var(--color-text-secondary)] shrink-0">
                  {selectedProfile.filingFrequency || 'MONTHLY'}
                </span>
              </div>
            )}
          </div>

          {/* Return Type */}
          <div>
            <label className="block text-[13px] font-medium mb-1" style={{ color: 'var(--color-text-on-card)' }}>
              Return Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:border-emerald-500/50"
                style={{ background: 'var(--color-bg-input)', borderColor: 'var(--color-border)' }}
              >
                <input
                  type="radio"
                  value="GSTR1"
                  {...register('returnType')}
                  className="text-emerald-600 focus:ring-emerald-500"
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
                className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:border-emerald-500/50"
                style={{ background: 'var(--color-bg-input)', borderColor: 'var(--color-border)' }}
              >
                <input
                  type="radio"
                  value="GSTR3B"
                  {...register('returnType')}
                  className="text-emerald-600 focus:ring-emerald-500"
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
            placeholder="e.g. 2026-11"
            {...register('period')}
            error={errors.period?.message}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              disabled={profiles.length === 0}
              title={profiles.length === 0 ? 'Please onboard a GST Profile first' : undefined}
            >
              Create Draft Return
            </Button>
          </div>
        </form>
      </Modal>

      {/* Nested Create Profile Modal */}
      <CreateProfileModal
        isOpen={isCreateProfileOpen}
        onClose={() => setIsCreateProfileOpen(false)}
        defaultClientId={defaultClientId}
        onSuccess={handleProfileCreated}
      />
    </>
  );
};
