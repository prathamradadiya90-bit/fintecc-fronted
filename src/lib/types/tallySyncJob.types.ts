export type TallyJobStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type TallyEntityType = 'INVOICE' | 'BANK_STATEMENT' | 'ECOMMERCE_BATCH' | string;

export interface TallySyncJob {
  id: string;
  firmId: string;
  entityId?: string | null;
  entityType: TallyEntityType;
  xmlPayload?: string;
  status: TallyJobStatus;
  errorLog?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTallyJobsResponse {
  success: boolean;
  message?: string;
  data: TallySyncJob[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TallyJobActionResponse {
  success: boolean;
  message?: string;
  data: TallySyncJob;
}

export interface TallyRetryAllResponse {
  success: boolean;
  message?: string;
  data: {
    affected: number;
  };
}
