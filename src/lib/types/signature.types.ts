export type SignatureStatus = 'PENDING' | 'VIEWED' | 'SIGNED' | 'DECLINED';

export interface SignatureRequestClient {
  id: string;
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
}

export interface SignatureRequest {
  id: string;
  firmId: string;
  clientId: string;
  documentName: string;
  documentUrl: string;
  status: SignatureStatus;
  provider?: string;
  envelopeId?: string | null;
  signedDocumentUrl?: string | null;
  providerMetadata?: Record<string, any> | null;
  signedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: SignatureRequestClient;
}

export interface CreateSignatureRequest {
  clientId: string;
  documentName: string;
  documentUrl: string;
}

export interface UpdateSignatureStatusRequest {
  id: string;
  status?: SignatureStatus;
  signedDocumentUrl?: string;
  providerMetadata?: Record<string, any>;
}

export interface SignatureResponse {
  success: boolean;
  message?: string;
  data: SignatureRequest;
}

export interface SignaturesListResponse {
  success: boolean;
  message?: string;
  data: SignatureRequest[];
}
