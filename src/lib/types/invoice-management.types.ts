export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PENDING' | 'PENDING_REVIEW' | 'OVERDUE' | 'CANCELLED';
export type RecurringInterval = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface InvoiceLineItem {
  description: string;
  hsnSac?: string;
  quantity: number;
  uom?: string; // NOS, KGS, PCS, BOX, MTR, PKT, SET, BAG, LTR, HRS, TON, OTH
  rate?: number;
  unitPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  taxableAmount?: number;
  gstRate?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  amount: number;
}

export interface Invoice {
  id: string;
  firmId: string;
  clientId: string;
  invoiceNumber: string;
  invoiceType?: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  subTotal?: number;
  discountAmount?: number;
  taxAmount: number;
  taxRate?: number;
  totalAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  amountPaid?: number;
  amountDue?: number;
  placeOfSupply?: string;
  lineItems?: InvoiceLineItem[];
  
  // Tally Prime Statutory, Order, Dispatch, Remittance & Declarations
  notes?: string | null;
  termsConditions?: string | null;
  narration?: string | null;
  
  clientGstin?: string | null;
  consigneeName?: string | null;
  consigneeAddress?: string | null;
  consigneeGstin?: string | null;
  consigneeState?: string | null;
  
  deliveryNote?: string | null;
  deliveryNoteDate?: string | null;
  referenceNo?: string | null;
  dispatchDocNo?: string | null;
  dispatchedThrough?: string | null;
  destination?: string | null;
  carrierName?: string | null;
  billOfLadingNo?: string | null;
  billOfLadingDate?: string | null;
  motorVehicleNo?: string | null;
  
  buyerOrderNo?: string | null;
  buyerOrderDate?: string | null;
  termsOfPayment?: string | null;
  otherReferences?: string | null;
  
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  bankBranch?: string | null;
  
  eWayBillNo?: string | null;
  eWayBillDate?: string | null;
  irn?: string | null;
  ackNo?: string | null;
  ackDate?: string | null;
  
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval | null;
  nextRecurringDate?: string | null;
  paymentLinkId?: string | null;
  paymentLinkUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
    gstin?: string;
    pan?: string;
    address?: any;
  };
}

export interface PaginatedInvoicesResponse {
  success: boolean;
  message?: string;
  data: Invoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InvoiceResponse {
  success: boolean;
  message?: string;
  data: Invoice;
}

export interface CreateInvoiceRequest {
  clientId: string;
  invoiceNumber: string;
  invoiceType?: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  subTotal?: number;
  discountAmount?: number;
  taxAmount: number;
  taxRate?: number;
  totalAmount: number;
  placeOfSupply?: string;
  lineItems?: InvoiceLineItem[];
  generatePaymentLink?: boolean;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval | null;
  
  // Tally Prime fields
  notes?: string;
  termsConditions?: string;
  narration?: string;
  consigneeName?: string;
  consigneeAddress?: string;
  consigneeGstin?: string;
  consigneeState?: string;
  dispatchDocNo?: string;
  dispatchedThrough?: string;
  destination?: string;
  carrierName?: string;
  billOfLadingNo?: string;
  billOfLadingDate?: string;
  motorVehicleNo?: string;
  buyerOrderNo?: string;
  buyerOrderDate?: string;
  termsOfPayment?: string;
  otherReferences?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  eWayBillNo?: string;
  eWayBillDate?: string;
  irn?: string;
  ackNo?: string;
}

export type UpdateInvoiceRequest = Partial<CreateInvoiceRequest>;

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}
