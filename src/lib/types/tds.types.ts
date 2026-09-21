export type ChallanStatus = 'UNVERIFIED' | 'VERIFIED' | 'CONSUMED';
export type TdsFormType = '24Q' | '26Q' | '27Q' | '27EQ';
export type TdsQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type TdsFilingStatus = 'PENDING' | 'FILED' | 'PROCESSED' | 'DEFAULT';
export type TdsNoticeType = 'SHORT_DEDUCTION' | 'SHORT_PAYMENT' | 'LATE_FILING' | 'LATE_PAYMENT';
export type TdsNoticeStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export interface TdsChallan {
  id: string;
  firmId: string;
  clientId: string;
  bsrCode: string;
  challanSerialNumber: string;
  tenderDate: string;
  taxAmount?: number;
  interestAmount?: number;
  penaltyAmount?: number;
  totalAmount: number;
  status: ChallanStatus;
  client?: { id: string; name: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface TdsReturn {
  id: string;
  firmId: string;
  clientId: string;
  formType: TdsFormType;
  financialYear: string;
  quarter: TdsQuarter;
  filingStatus: TdsFilingStatus;
  prn?: string;
  filingDate?: string;
  formsDownloaded?: boolean;
  client?: { id: string; name: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface TdsTransaction {
  id: string;
  firmId: string;
  clientId: string;
  tdsReturnId?: string;
  challanId?: string;
  deducteePan: string;
  deducteeName: string;
  section: string;
  dateOfPayment: string;
  amountPaid: number;
  rate: number;
  tdsAmount: number;
  isReconciled?: boolean;
  certificateNumber?: string;
  client?: { id: string; name: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface TdsNotice {
  id: string;
  firmId: string;
  clientId: string;
  tdsReturnId?: string;
  noticeType: TdsNoticeType;
  demandAmount: number;
  noticeDate: string;
  status: TdsNoticeStatus;
  client?: { id: string; name: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface TdsResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedTdsResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateChallanRequest {
  clientId: string;
  bsrCode: string;
  challanSerialNumber: string;
  tenderDate: string;
  taxAmount?: number;
  interestAmount?: number;
  penaltyAmount?: number;
  totalAmount: number;
  status?: ChallanStatus;
}

export interface CreateReturnRequest {
  clientId: string;
  formType: TdsFormType;
  financialYear: string;
  quarter: TdsQuarter;
  filingStatus?: TdsFilingStatus;
  prn?: string;
  filingDate?: string;
  formsDownloaded?: boolean;
}

export interface CreateTransactionRequest {
  clientId: string;
  tdsReturnId?: string;
  challanId?: string;
  deducteePan: string;
  deducteeName: string;
  section: string;
  dateOfPayment: string;
  amountPaid: number;
  rate: number;
  tdsAmount: number;
  isReconciled?: boolean;
  certificateNumber?: string;
}

export interface CreateNoticeRequest {
  clientId: string;
  tdsReturnId?: string;
  noticeType: TdsNoticeType;
  demandAmount: number;
  noticeDate: string;
  status?: TdsNoticeStatus;
}
