export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuotationLineItem {
  id?: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Quotation {
  id: string;
  firmId: string;
  clientId: string;
  quotationNumber: string;
  date: string;
  validUntil?: string | null;
  scopeOfWork?: string | null;
  subTotal: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  lineItems: QuotationLineItem[];
  status: QuotationStatus;
  notes?: string | null;
  pdfUrl?: string | null;
  linkedInvoiceId?: string | null;
  linkedTaskId?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
    gstin?: string;
  };
}

export interface GetQuotationsParams {
  page?: number;
  limit?: number;
  clientId?: string;
  status?: string;
  search?: string;
}

export interface CreateQuotationRequest {
  clientId: string;
  quotationNumber?: string;
  date?: string;
  validUntil?: string;
  scopeOfWork?: string;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  lineItems: QuotationLineItem[];
  status?: QuotationStatus;
  notes?: string;
}

export interface UpdateQuotationRequest {
  clientId?: string;
  quotationNumber?: string;
  date?: string;
  validUntil?: string;
  scopeOfWork?: string;
  subTotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  lineItems?: QuotationLineItem[];
  status?: QuotationStatus;
  notes?: string;
}

export interface QuotationResponse {
  success: boolean;
  message?: string;
  data: Quotation;
}

export interface PaginatedQuotationsResponse {
  success: boolean;
  message?: string;
  data: Quotation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
