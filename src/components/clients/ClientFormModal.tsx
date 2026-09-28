import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { SlideOver } from '@/components/ui/SlideOver';
import {
  useCreateClientMutation,
  useUpdateClientMutation,
  useInviteClientMutation,
} from '@/lib/store/api/clientsApi';
import { useToast } from '@/components/ui/Toast';
import type { Client } from '@/lib/types/client.types';

import {
  clientSchema,
  defaultFormValues,
  FORM_STEPS,
  type ClientFormData,
} from './form/clientForm.schema';
import { StepIndicator } from './form/StepIndicator';
import { StepProfile } from './form/StepProfile';
import { StepContactAddress } from './form/StepContactAddress';
import { StepTaxBusiness } from './form/StepTaxBusiness';
import { StepBankServices } from './form/StepBankServices';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

export function ClientFormModal({ isOpen, onClose, client }: ClientFormModalProps) {
  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();
  const [inviteClient] = useInviteClientMutation();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sendInvite, setSendInvite] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultFormValues,
    mode: 'onTouched',
  });

  const isEditMode = !!client;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      if (client) {
        setCompletedSteps([1, 2, 3, 4]);
        reset({
          name: client.name || '',
          pan: client.pan || '',
          aadhaar: client.aadhaar || '',
          phone: client.phone || '',
          secondaryPhone: client.secondaryPhone || '',
          email: client.email || '',
          type: (client.type as any) || 'Individual',
          companyName: client.companyName || '',
          isGstRegistered: !!client.gstin,
          gstin: client.gstin || '',
          tan: client.tan || '',
          status: (client.status as any) || 'Active',
          tags: client.tags || [],
          notes: client.notes || '',
          address: client.address || { street: '', city: '', state: '', zip: '', country: '' },
          bankDetails: client.bankDetails?.length
            ? client.bankDetails
            : [{ accountName: '', accountNumber: '', ifsc: '', bankName: '' }],
        });
      } else {
        setCompletedSteps([]);
        setSendInvite(true);
        reset(defaultFormValues);
      }
    }
  }, [client, isOpen, reset]);

  // Validate the fields of the current step before advancing
  const validateStep = async (step: number): Promise<boolean> => {
    if (step === 1) {
      return await trigger(['name', 'type', 'pan', 'aadhaar', 'status']);
    }
    if (step === 2) {
      return await trigger(['phone', 'email', 'secondaryPhone', 'address.zip']);
    }
    if (step === 3) {
      return await trigger(['companyName', 'isGstRegistered', 'gstin', 'tan']);
    }
    if (step === 4) {
      return await trigger();
    }
    return true;
  };

  const handleNext = async () => {
    const isStepValid = await validateStep(currentStep);
    if (!isStepValid) return;

    setCompletedSteps((prev) => (prev.includes(currentStep) ? prev : [...prev, currentStep]));
    if (currentStep < FORM_STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = async (stepId: number) => {
    if (stepId === currentStep) return;
    if (stepId < currentStep || isEditMode) {
      setCurrentStep(stepId);
      return;
    }
    // Forward click: validate current step first
    const isStepValid = await validateStep(currentStep);
    if (isStepValid) {
      setCompletedSteps((prev) => (prev.includes(currentStep) ? prev : [...prev, currentStep]));
      setCurrentStep(stepId);
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      const { isGstRegistered, ...payload } = data;

      if (!isGstRegistered) {
        payload.gstin = '';
      }

      // Clean up empty bank detail fields
      if (payload.bankDetails) {
        payload.bankDetails = payload.bankDetails.filter(
          (b) => b.accountNumber || b.bankName || b.ifsc || b.accountName
        );
      }

      if (client) {
        await updateClient({ id: client.id, data: payload }).unwrap();
        showToast('Client updated successfully');
      } else {
        const res = await createClient(payload).unwrap();
        const createdId = res?.data?.id;
        if (sendInvite && payload.email && createdId) {
          try {
            await inviteClient(createdId).unwrap();
            showToast('Client created and portal invitation sent!');
          } catch {
            showToast('Client created, but failed to send portal invite email', 'error');
          }
        } else {
          showToast('Client created successfully');
        }
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
        <div className="w-full flex items-center justify-between gap-3">
          {/* Back / Cancel button */}
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {/* Step indicator in footer */}
          <div className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
            Step {currentStep} of {FORM_STEPS.length}
          </div>

          {/* Next / Submit button */}
          {currentStep < FORM_STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#4A6FA5] hover:bg-[#3D5D8A] text-xs text-white font-bold rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-[#4A6FA5]/30"
            >
              <span>Next: {FORM_STEPS[currentStep]?.shortTitle}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#4A6FA5] hover:bg-[#3D5D8A] text-xs text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 focus:ring-2 focus:ring-[#4A6FA5]/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Client...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{client ? 'Update Client' : 'Save Client'}</span>
                </>
              )}
            </button>
          )}
        </div>
      }
    >
      <div className="py-2 flex flex-col">
        {/* Step Indicator Bar */}
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        {/* Form Body for Current Step */}
        <form onSubmit={handleSubmit(onSubmit)} className="pb-6">
          {currentStep === 1 && (
            <StepProfile
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
            />
          )}

          {currentStep === 2 && (
            <StepContactAddress
              register={register}
              errors={errors}
              isEditMode={isEditMode}
              sendInvite={sendInvite}
              setSendInvite={setSendInvite}
            />
          )}

          {currentStep === 3 && (
            <StepTaxBusiness
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
          )}

          {currentStep === 4 && (
            <StepBankServices
              register={register}
              errors={errors}
              control={control}
              watch={watch}
            />
          )}
        </form>
      </div>
    </SlideOver>
  );
}
