export interface McaDirector {
  id: string;
  firmId: string;
  mcaCompanyId: string;
  din: string;
  name: string;
  designation?: string;
  dateOfAppointment?: string;
  kycStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface McaCompany {
  id: string;
  firmId: string;
  clientId?: string;
  cin: string;
  companyName: string;
  rocCode?: string;
  registrationNumber?: string;
  companyCategory?: string;
  companySubCategory?: string;
  classOfCompany?: string;
  authorizedCapital: number | string;
  paidUpCapital: number | string;
  dateOfIncorporation?: string;
  registeredAddress?: string;
  emailId?: string;
  status: 'Active' | 'Strike Off' | string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  directors?: McaDirector[];
}

export interface PaginatedMcaCompaniesResponse {
  success: boolean;
  data: McaCompany[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface McaCompanyResponse {
  success: boolean;
  data: McaCompany;
  message?: string;
}

export interface McaDirectorsResponse {
  success: boolean;
  data: McaDirector[];
  message?: string;
}

export interface CreateMcaCompanyRequest {
  cin: string;
  companyName: string;
  clientId?: string;
  rocCode?: string;
  registrationNumber?: string;
  companyCategory?: string;
  companySubCategory?: string;
  classOfCompany?: string;
  authorizedCapital?: number;
  paidUpCapital?: number;
  dateOfIncorporation?: string;
  registeredAddress?: string;
  emailId?: string;
  status?: string;
}

export interface UpdateMcaCompanyRequest extends Partial<CreateMcaCompanyRequest> {
  id: string;
}

export interface AddMcaDirectorRequest {
  din: string;
  name: string;
  designation?: string;
  dateOfAppointment?: string;
  kycStatus?: string;
}
