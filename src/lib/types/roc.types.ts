import type { McaCompany } from './mca.types';

export type RocFilingStatus = 'Pending' | 'Prepared' | 'Filed' | 'Approved' | 'Rejected';

export interface RocFiling {
  id: string;
  firmId: string;
  clientId?: string;
  mcaCompanyId: string;
  formName: string;
  financialYear?: string;
  srn?: string;
  status: RocFilingStatus;
  challanAmount: number | string;
  challanDate?: string;
  challanReceiptUrl?: string;
  dueDate?: string;
  filedDate?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
  };
  mcaCompany?: McaCompany;
}

export interface PaginatedRocFilingsResponse {
  success: boolean;
  data: RocFiling[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RocFilingResponse {
  success: boolean;
  data: RocFiling;
  message?: string;
}

export interface CreateRocFilingRequest {
  mcaCompanyId: string;
  clientId?: string;
  formName: string;
  financialYear?: string;
  dueDate?: string;
  srn?: string;
  status?: RocFilingStatus;
}

export interface UpdateRocStatusRequest {
  id: string;
  status: RocFilingStatus;
}

export interface RecordChallanRequest {
  id: string;
  challanAmount: number;
  challanDate?: string;
  challanReceiptUrl?: string;
}
