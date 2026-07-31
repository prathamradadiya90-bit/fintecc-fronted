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
}

export interface InvoiceConvertResponse {
  success: boolean;
  message?: string;
  data: ExtractedInvoice;
}
