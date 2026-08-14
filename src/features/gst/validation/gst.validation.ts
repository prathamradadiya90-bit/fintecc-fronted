import { z } from 'zod';

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2]|Q[1-4])$/;

export const gstProfileSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  gstin: z
    .string()
    .transform((val) => val.toUpperCase())
    .refine((val) => GSTIN_REGEX.test(val), {
      message: 'Invalid GSTIN format (e.g. 27AAAAA0000A1Z5)',
    }),
  legalName: z.string().min(2, 'Legal name must be at least 2 characters'),
  tradeName: z.string().optional(),
  registrationType: z.enum(['REGULAR', 'COMPOSITION']),
  stateCode: z.string().length(2, 'State code must be exactly 2 digits (e.g. 27)'),
  filingFrequency: z.enum(['MONTHLY', 'QRMP']),
  authorizedSignatory: z.string().optional(),
});

export const updateGstProfileSchema = gstProfileSchema.partial();

export const verifyGstinSchema = z.object({
  gstin: z
    .string()
    .transform((val) => val.toUpperCase())
    .refine((val) => GSTIN_REGEX.test(val), {
      message: 'Invalid GSTIN format',
    }),
});

export const gstReturnSchema = z.object({
  gstProfileId: z.string().min(1, 'GST Profile is required'),
  returnType: z.enum(['GSTR1', 'GSTR3B']),
  period: z.string().regex(PERIOD_REGEX, 'Period must be in YYYY-MM or YYYY-Q1 format (e.g. 2026-03 or 2026-Q1)'),
});

export const markFiledSchema = z.object({
  arn: z.string().min(3, 'ARN number is required'),
});

export type GstProfileFormData = z.infer<typeof gstProfileSchema>;
export type GstReturnFormData = z.infer<typeof gstReturnSchema>;
export type MarkFiledFormData = z.infer<typeof markFiledSchema>;
