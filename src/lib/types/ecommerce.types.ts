export type EcommercePlatform =
  | 'Amazon'
  | 'Flipkart'
  | 'Meesho'
  | 'Myntra'
  | 'Jiomart'
  | 'Snapdeal'
  | 'Glowroad'
  | 'Citymall'
  | 'Limeroad'
  | 'Paytm'
  | 'Shop101';

export interface StandardizedSaleItem {
  orderId?: string;
  orderDate?: string;
  sku?: string;
  quantity?: number;
  taxableValue: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  gstRate?: number;
  state?: string;
  pos?: string;
  tcs?: number;
  tcsAmount?: number;
  invoiceNumber?: string;
  customerGst?: string;
  transactionType?: 'SALE' | 'RETURN' | string;
}

export interface EcommerceSalesSummary {
  totalOrders: number;
  grossSales: number;
  returns: number;
  netTaxableValue: number;
  totalIgst: number;
  totalCgst: number;
  totalSgst: number;
  totalTax: number;
  totalTcs: number;
  grandTotal: number;
}

export interface ProcessReportResponse {
  success: boolean;
  message: string;
  data: {
    platform: EcommercePlatform | string;
    totalCount: number;
    summary: EcommerceSalesSummary;
    sales: StandardizedSaleItem[];
  };
}

export interface Gstr1B2CSItem {
  sply_ty: 'INTER' | 'INTRA';
  pos: string;
  rt: number;
  txval: number;
  iamt?: number;
  camt?: number;
  samt?: number;
  csamt?: number;
}

export interface Gstr1Response {
  success: boolean;
  message: string;
  data: {
    b2cs?: Gstr1B2CSItem[];
    [key: string]: any;
  };
}

export interface TallyQueueResponse {
  success: boolean;
  message: string;
  data: {
    jobId: string;
    voucherCount: number;
  };
}
