export interface VaultItem {
  id: string;
  firmId: string;
  clientId?: string | null;
  title: string;
  username?: string | null;
  encryptedPass?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    companyName?: string;
    pan?: string;
    gstin?: string;
  };
}

export interface PaginatedVaultResponse {
  success: boolean;
  message?: string;
  data: VaultItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VaultItemResponse {
  success: boolean;
  message?: string;
  data: VaultItem;
}

export interface CreateVaultRequest {
  clientId?: string | null;
  title: string;
  username?: string | null;
  encryptedPass: string;
}

export type UpdateVaultRequest = Partial<CreateVaultRequest>;

export interface GetVaultParams {
  page?: number;
  limit?: number;
  clientId?: string;
}
