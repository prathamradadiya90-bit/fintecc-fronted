import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitPrice: z.number().nonnegative('Unit price must be positive or 0'),
  amount: z.number().nonnegative('Amount must be positive or 0'),
});

export const invoiceFormSchema = z.object({
  clientId: z.string().uuid('Please select a client'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'PENDING', 'PENDING_REVIEW', 'OVERDUE', 'CANCELLED']),
  taxRatePercent: z.number().nonnegative().default(18),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
