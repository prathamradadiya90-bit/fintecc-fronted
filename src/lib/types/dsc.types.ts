export type DscStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED';

export interface DscToken {
  id: string;
  firmId: string;
  clientId: string;
  ownerName: string;
  provider: string; // e.g., eMudhra, Capricorn, Vsign
  password?: string;
  expiryDate: string; // ISO timestamp
  status: DscStatus;
  storageLocation: string; // Physical location, e.g., "Locker 1", "Cabinet B"
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateDscRequest {
  clientId: string;
  ownerName: string;
  provider: string;
  password?: string;
  expiryDate: string;
  storageLocation: string;
  status?: DscStatus;
  assignedToId?: string;
}

export interface UpdateDscRequest {
  id: string;
  clientId?: string;
  ownerName?: string;
  provider?: string;
  password?: string;
  expiryDate?: string;
  storageLocation?: string;
  status?: DscStatus;
  assignedToId?: string;
}

export interface DscListResponse {
  items: DscToken[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
