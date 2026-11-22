import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  hsnSac: z.string().optional().nullable(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  uom: z.string().optional().default('NOS'),
  rate: z.number().nonnegative('Rate must be positive or 0').optional(),
  unitPrice: z.number().nonnegative('Unit price must be positive or 0'),
  discountPercent: z.number().nonnegative().optional().default(0),
  discountAmount: z.number().nonnegative().optional().default(0),
  taxableAmount: z.number().nonnegative().optional(),
  gstRate: z.number().nonnegative().optional().default(18),
  cgstAmount: z.number().nonnegative().optional().default(0),
  sgstAmount: z.number().nonnegative().optional().default(0),
  igstAmount: z.number().nonnegative().optional().default(0),
  amount: z.number().nonnegative('Amount must be positive or 0'),
});

export const invoiceFormSchema = z.object({
  clientId: z.string().uuid('Please select a client'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'PENDING', 'PENDING_REVIEW', 'OVERDUE', 'CANCELLED']),
  taxRatePercent: z.number().nonnegative().default(18),
  placeOfSupply: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  generatePaymentLink: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional().nullable(),

  // Tally Prime Statutory, Order, Dispatch & Remittance fields
  buyerOrderNo: z.string().optional(),
  buyerOrderDate: z.string().optional(),
  termsOfPayment: z.string().optional(),
  otherReferences: z.string().optional(),
  
  consigneeName: z.string().optional(),
  consigneeAddress: z.string().optional(),
  consigneeGstin: z.string().optional(),
  consigneeState: z.string().optional(),

  dispatchDocNo: z.string().optional(),
  dispatchedThrough: z.string().optional(),
  destination: z.string().optional(),
  carrierName: z.string().optional(),
  billOfLadingNo: z.string().optional(),
  billOfLadingDate: z.string().optional(),
  motorVehicleNo: z.string().optional(),

  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfsc: z.string().optional(),
  bankBranch: z.string().optional(),

  eWayBillNo: z.string().optional(),
  eWayBillDate: z.string().optional(),
  irn: z.string().optional(),
  ackNo: z.string().optional(),

  narration: z.string().optional(),
  termsConditions: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
