export type ClientType = 'Individual' | 'Company' | 'Partnership' | 'LLP' | 'HUF' | 'Trust';
export type ClientStatus = 'Active' | 'Inactive' | 'Blocked';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface BankDetail {
  accountName?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
}

export interface KeyPerson {
  name?: string;
  role?: string;
  pan?: string;
  din?: string;
  phone?: string;
  email?: string;
  equity?: number;
}

export interface Client {
  id: string;
  firmId: string;
  type: ClientType;
  name: string;
  companyName?: string;
  pan?: string;
  gstin?: string;
  tan?: string;
  aadhaar?: string;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  address?: Address;
  bankDetails?: BankDetail[];
  keyPersons?: KeyPerson[];
  status: ClientStatus;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  documents?: ClientDocument[];
}

export interface ClientDocument {
  id: string;
  clientId: string;
  firmId: string;
  title: string;
  filePath: string;
  fileType?: string; // "PDF", "JPG", "XLS", "DOC"
  fileSize?: number; // bytes
  createdAt: string;
  updatedAt: string;
}

export interface ClientDocumentsResponse {
  success: boolean;
  data: ClientDocument[];
  message?: string;
}

export interface CreateDocumentRequest {
  clientId: string;
  title: string;
  file: File;
}

export interface PaginatedClientsResponse {
  success: boolean;
  message?: string;
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ClientResponse {
  success: boolean;
  data: Client;
  message?: string;
}

export interface GetClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClientStatus;
  type?: ClientType;
}

export type CreateClientRequest = Omit<Client, 'id' | 'firmId' | 'createdAt' | 'updatedAt'>;
export type UpdateClientRequest = Partial<CreateClientRequest>;
