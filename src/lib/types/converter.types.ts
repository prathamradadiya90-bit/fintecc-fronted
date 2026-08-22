export interface ExcelToJsonResponse {
  success: boolean;
  message?: string;
  data: {
    sheets: string[];
    activeSheet?: string;
    totalSheets?: number;
    rowCount?: number;
    totalRows?: number;
    data: any[] | Record<string, any[]>;
  };
}

export interface ReceiptOcrResponse {
  success: boolean;
  message?: string;
  data: {
    extractedData: {
      merchantName?: string;
      date?: string;
      totalAmount?: number;
      taxAmount?: number;
      category?: string;
      items?: Array<{
        description: string;
        amount: number;
      }>;
    };
    rawText?: string;
  };
}
