export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PENDING' | 'PENDING_REVIEW' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  firmId: string;
  clientId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  totalAmount: number;
  taxAmount: number;
  lineItems?: InvoiceLineItem[];
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
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  totalAmount: number;
  taxAmount: number;
  lineItems?: InvoiceLineItem[];
}

export type UpdateInvoiceRequest = Partial<CreateInvoiceRequest>;

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}
