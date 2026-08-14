export type RegistrationType = 'REGULAR' | 'COMPOSITION';
export type FilingFrequency = 'MONTHLY' | 'QRMP';

export type ReturnType = 'GSTR1' | 'GSTR3B';
export type ReturnStatus = 
  | 'DRAFT' 
  | 'READY_FOR_REVIEW' 
  | 'CLIENT_APPROVED' 
  | 'FILED' 
  | 'REJECTED' 
  | 'NEEDS_REVISION';

export type InvoiceType = 'SALES' | 'PURCHASE';
export type InvoiceStatus = 'PENDING' | 'PROCESSED' | 'FILED';

export interface GstProfile {
  id: string;
  firmId: string;
  clientId: string;
  gstin: string;
  legalName: string;
  tradeName?: string;
  registrationType: RegistrationType;
  stateCode: string;
  filingFrequency: FilingFrequency;
  authorizedSignatory?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
  };
}

export interface GstReturn {
  id: string;
  firmId: string;
  gstProfileId: string;
  returnType: ReturnType;
  period: string; // YYYY-MM or YYYY-QN
  status: ReturnStatus;
  data?: Record<string, any>;
  taxPayable?: number;
  itcClaimed?: number;
  preparedByUserId?: string;
  clientApprovedAt?: string;
  filedVia?: string;
  arn?: string;
  filedAt?: string;
  createdAt: string;
  updatedAt: string;
  gstProfile?: GstProfile;
}

export interface GstInvoice {
  id: string;
  firmId: string;
  clientId: string;
  gstProfileId?: string;
  gstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceType: InvoiceType;
  sellerGSTIN?: string;
  buyerGSTIN?: string;
  taxableValue: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  cess?: number;
  totalAmount: number;
  hsnSac?: string;
  sourceDocumentId?: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GstCredential {
  id: string;
  firmId: string;
  clientId: string;
  gstin: string;
  provider?: string;
  tokenExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedGstProfilesResponse {
  success: boolean;
  data: GstProfile[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GstProfileResponse {
  success: boolean;
  data: GstProfile;
  message?: string;
}

export interface PaginatedGstReturnsResponse {
  success: boolean;
  data: GstReturn[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GstReturnResponse {
  success: boolean;
  data: GstReturn;
  message?: string;
}

export interface VerifyGstinResponse {
  success: boolean;
  data: {
    verified: boolean;
    gstin: string;
    message?: string;
    tradeName?: string;
    legalName?: string;
    status?: string;
  };
  message?: string;
}

export interface GetGstProfilesParams {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
}

export interface CreateGstProfileInput {
  clientId: string;
  gstin: string;
  legalName: string;
  tradeName?: string;
  registrationType?: RegistrationType;
  stateCode: string;
  filingFrequency?: FilingFrequency;
  authorizedSignatory?: string;
}

export type UpdateGstProfileInput = Partial<CreateGstProfileInput>;

export interface VerifyGstinInput {
  gstin: string;
}
