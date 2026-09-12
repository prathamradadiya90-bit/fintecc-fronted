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
  rowCount?: number;
  totalTaxable?: number;
  platform?: string;
}

export interface ProcessReportResponse {
  success: boolean;
  message: string;
  data: {
    platform: EcommercePlatform | string;
    totalCount: number;
    summary: EcommerceSalesSummary;
    sales: StandardizedSaleItem[];
    reportId?: string;
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

export interface EcommerceLineItem {
  id: string;
  reportId: string;
  orderId: string;
  invoiceDate?: string;
  buyerState?: string;
  gstin?: string;
  classification?: string;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  tcsAmount?: number;
  hsnCode?: string;
  taxRate?: number;
  isTable14?: boolean;
  ecommGstin?: string;
}

export interface EcommerceReport {
  id: string;
  firmId: string;
  platform: string;
  originalFilename?: string;
  reportPeriod?: string;
  totalOrders?: number;
  totalTaxableValue?: number;
  totalIgst?: number;
  totalCgst?: number;
  totalSgst?: number;
  tcsReconciliation?: {
    portalTcsAmount?: number;
    systemTcs?: number;
    delta?: number;
    splitAdjustment?: any;
  };
  lineItems: EcommerceLineItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EcommerceReportResponse {
  success: boolean;
  data: EcommerceReport;
  message?: string;
}

export interface UpdateTcsRequest {
  id: string;
  portalTcsAmount: number;
  splitAdjustment?: any;
}

export interface BulkUpdateHsnRequest {
  id: string;
  itemIds: string[];
  hsnCode: string;
  taxRate?: number;
}

export interface OverrideTable14Request {
  id: string;
  itemId: string;
  isTable14: boolean;
  ecommGstin?: string;
}
