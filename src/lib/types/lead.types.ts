export type LeadStatus = 'NEW' | 'CONTACTED' | 'PROPOSAL_SENT' | 'WON' | 'LOST';

export interface Lead {
  id: string;
  firmId: string;
  companyName: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  status: LeadStatus;
  estimatedValue?: number | string | null;
  dealValue?: number | string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadRequest {
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
  dealValue?: number;
  estimatedValue?: number;
  notes?: string;
}

export interface UpdateLeadStatusRequest {
  id: string;
  status: LeadStatus;
}

export interface LeadResponse {
  success: boolean;
  message?: string;
  data: Lead;
}

export interface LeadsListResponse {
  success: boolean;
  message?: string;
  data: Lead[];
}
