import * as z from 'zod';
import type { ClientType, ClientStatus } from '@/lib/types/client.types';

export const SERVICES = [
  'GST Return Filing',
  'Income Tax Return',
  'TDS Return',
  'ROC Filing',
  'Tax Audit',
  'Bookkeeping',
  'Payroll',
  'Loan Processing',
] as const;

export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
export const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
export const phoneRegex = /^[6-9]\d{9}$/;
export const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
export const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/i;
export const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

export const clientSchema = z.object({
  name: z.string().min(2, 'Name is required (at least 2 characters)'),
  pan: z.string().regex(panRegex, 'Invalid PAN format (e.g. ABCPM1234R)'),
  aadhaar: z.string().regex(aadhaarRegex, 'Aadhaar must be 12 digits').optional().or(z.literal('')),
  phone: z.string().regex(phoneRegex, 'Invalid 10-digit mobile number'),
  secondaryPhone: z.string().regex(phoneRegex, 'Invalid 10-digit mobile number').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  type: z.enum(['Individual', 'Company', 'Partnership', 'LLP', 'HUF', 'Trust']),
  companyName: z.string().optional(),
  isGstRegistered: z.boolean().optional(),
  gstin: z.string().optional(),
  tan: z.string().regex(tanRegex, 'Invalid TAN format (e.g. ABCD12345E)').optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive', 'Blocked']),
  tags: z.array(z.string()),
  notes: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().regex(/^\d{6}$/, 'Invalid 6-digit PIN code').optional().or(z.literal('')),
    country: z.string().optional(),
  }).optional(),
  bankDetails: z.array(
    z.object({
      accountName: z.string().optional(),
      accountNumber: z.string().regex(/^\d{9,18}$/, 'Invalid Account Number (9-18 digits)').optional().or(z.literal('')),
      ifsc: z.string().regex(ifscRegex, 'Invalid IFSC Code (e.g. HDFC0001234)').optional().or(z.literal('')),
      bankName: z.string().optional(),
    })
  ).optional(),
}).superRefine((data, ctx) => {
  if (data.isGstRegistered) {
    if (!data.gstin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'GSTIN is required when GST registered is checked',
        path: ['gstin'],
      });
    } else if (!gstinRegex.test(data.gstin)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid GSTIN format (15 alphanumeric characters)',
        path: ['gstin'],
      });
    }
  }
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const defaultFormValues: ClientFormData = {
  name: '',
  pan: '',
  aadhaar: '',
  phone: '',
  secondaryPhone: '',
  email: '',
  type: 'Individual',
  companyName: '',
  isGstRegistered: false,
  gstin: '',
  tan: '',
  status: 'Active',
  tags: [],
  notes: '',
  address: { street: '', city: '', state: '', zip: '', country: '' },
  bankDetails: [{ accountName: '', accountNumber: '', ifsc: '', bankName: '' }],
};

export interface FormStep {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  shortTitle: string;
}

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    key: 'identity',
    title: 'Basic Identity',
    subtitle: 'Name, entity type & PAN',
    shortTitle: 'Identity',
  },
  {
    id: 2,
    key: 'contact',
    title: 'Contact & Address',
    subtitle: 'Mobile, email & location',
    shortTitle: 'Contact',
  },
  {
    id: 3,
    key: 'tax',
    title: 'Tax & Business',
    subtitle: 'Company, GST & TAN',
    shortTitle: 'Tax Info',
  },
  {
    id: 4,
    key: 'services',
    title: 'Bank & Services',
    subtitle: 'Bank account & services',
    shortTitle: 'Services',
  },
];
