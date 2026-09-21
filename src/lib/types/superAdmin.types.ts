// ─── Firm Admin (Firm Owner) ─────────────────────────────────────────────────

export interface FirmOwner {
  id: string;
  name: string;
  email: string;
  firmId: string | null;
  role: string;
  isActive: boolean;
  profilePic: string | null;
  createdAt: string;
}

// ─── Contact / Support Ticket ─────────────────────────────────────────────────

export type ContactStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface ContactMessage {
  id: string;
  userId: string;
  firmId: string | null;
  email: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Paginated Response ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── API Request Types ────────────────────────────────────────────────────────

export interface GetFirmOwnersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetContactMessagesParams {
  search?: string;
  status?: ContactStatus | '';
  page?: number;
  limit?: number;
}

export interface ToggleFirmOwnerStatusRequest {
  id: string;
  isActive: boolean;
}

export interface UpdateContactStatusRequest {
  id: string;
  status: ContactStatus;
}

// ─── Super Admin Module Types ────────────────────────────────────────────────

export interface SuperAdminFirm {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  plan?: string;
  userLimit?: number;
  clientLimit?: number;
  storageLimitGB?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SuperAdminAnalytics {
  totalCAs: number;
  activeCAs: number;
  inactiveCAs: number;
  totalClients: number;
  totalEmployees: number;
  totalStorageGB: string | number;
  totalDocuments: number;
  revenueThisMonth: number;
  newSignupsThisMonth: number;
}

export interface SuperAdminConfig {
  [key: string]: any;
}

export interface SuperAdminSubscription {
  id: string;
  firmId: string;
  firmName?: string;
  planId: string;
  planName?: string;
  status: string;
  billingCycle: string;
  startDate: string;
  endDate?: string;
}

