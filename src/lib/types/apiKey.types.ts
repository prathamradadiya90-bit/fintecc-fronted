export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateApiKeyResponseData {
  id: string;
  name: string;
  keyPrefix: string;
  rawKey: string;
  createdAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
}

export interface ApiKeysListResponse {
  success: boolean;
  message?: string;
  data: ApiKey[];
}

export interface CreateApiKeyResponse {
  success: boolean;
  message?: string;
  data: CreateApiKeyResponseData;
}
