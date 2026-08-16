import { z } from 'zod';

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const AY_REGEX = /^\d{4}-\d{2}$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;

export const addItrClientSchema = z.object({
  pan: z
    .string()
    .transform((val) => val.toUpperCase())
    .refine((val) => PAN_REGEX.test(val), {
      message: 'Invalid PAN format (e.g. ABCDE1234F)',
    }),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  mobile: z
    .string()
    .regex(MOBILE_REGEX, 'Enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
});

export const prepareReturnSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  assessmentYear: z
    .string()
    .regex(AY_REGEX, 'Assessment Year must be in YYYY-YY format (e.g. 2026-27)'),
  financialYear: z.string().optional(),
  form: z.enum(['ITR1', 'ITR2', 'ITR3', 'ITR4', 'ITR5', 'ITR6', 'ITR7']),
});

export const prefillDataSchema = z.object({
  assessmentYear: z
    .string()
    .regex(AY_REGEX, 'Assessment Year must be in YYYY-YY format (e.g. 2026-27)'),
});

export type AddItrClientFormData = z.infer<typeof addItrClientSchema>;
export type PrepareReturnFormData = z.infer<typeof prepareReturnSchema>;
export type PrefillDataFormData = z.infer<typeof prefillDataSchema>;
