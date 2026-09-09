export interface ExtractedInvoice {
  invoiceNumber: string | null;
  issueDate: string | null;
  dueDate: string | null;
  subTotal: number;
  taxAmount: number;
  total: number;
  currency: string | null;
  sellerName: string | null;
  sellerGstin: string | null;
  buyerName: string | null;
  buyerGstin: string | null;
  notes: string | null;
  processingTimeMs?: number | null;
  items?: Array<{
    description?: string;
    hsnCode?: string;
    quantity?: number;
    rate?: number;
    taxRate?: number;
    total?: number;
  }>;
}

export interface InvoiceConvertResponse {
  success: boolean;
  message?: string;
  data: ExtractedInvoice;
}
