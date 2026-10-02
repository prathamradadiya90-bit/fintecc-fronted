export type UdinStatus = 'ACTIVE' | 'REVOKED';

export interface UdinFigures {
  turnover?: number;
  netProfit?: number;
  assessmentYear?: string;
  taxAuditSection?: string;
  [key: string]: any;
}

export interface UdinRecord {
  id: string;
  firmId: string;
  clientId?: string | null;
  udinNumber: string;
  documentType: string;
  documentDescription?: string | null;
  dateOfGeneration: string;
  financialYear?: string | null;
  figures?: UdinFigures | null;
  status: UdinStatus;
  revocationReason?: string | null;
  revokedAt?: string | null;
  generatedByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    companyName?: string;
    pan?: string;
    gstin?: string;
  };
  generatedBy?: {
    id: string;
    fullName?: string;
    email?: string;
  };
}

export interface GetUdinParams {
  page?: number;
  limit?: number;
  clientId?: string;
  status?: string;
  search?: string;
  documentType?: string;
}

export interface CreateUdinRequest {
  clientId?: string;
  udinNumber: string;
  documentType: string;
  documentDescription?: string;
  dateOfGeneration: string;
  financialYear?: string;
  figures?: UdinFigures;
}

export interface UpdateUdinRequest {
  clientId?: string;
  udinNumber?: string;
  documentType?: string;
  documentDescription?: string;
  dateOfGeneration?: string;
  financialYear?: string;
  figures?: UdinFigures;
}

export interface RevokeUdinRequest {
  reason: string;
}

export interface UdinResponse {
  success: boolean;
  message?: string;
  data: UdinRecord;
}

export interface PaginatedUdinResponse {
  success: boolean;
  message?: string;
  data: UdinRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
