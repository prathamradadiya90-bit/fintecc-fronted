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

// ─── MCA COMPLIANCE ENGINES & VALIDATORS ─────────────────────────────────────
export interface CinValidationResult {
  isValid: boolean;
  cin?: string;
  message?: string;
  details?: {
    isListed: boolean;
    listingStatus: string;
    industryCode: string;
    stateCode: string;
    stateName: string;
    incorporationYear: number;
    companyClassCode: string;
    companyClass: string;
    registrationNo: string;
    rocJurisdiction: string;
  };
}

export interface DinValidationResult {
  isValid: boolean;
  din?: string;
  message: string;
}

export interface LlpinValidationResult {
  isValid: boolean;
  llpin?: string;
  message: string;
}

export interface CalculateMcaLateFeeInput {
  formType?: string;
  dueDate: string;
  actualFilingDate?: string;
  nominalShareCapital?: number;
}

export interface McaLateFeeResult {
  formType: string;
  isDelayed: boolean;
  delayDays: number;
  normalFee: number;
  additionalFee: number;
  totalPayable: number;
  statutoryReference?: string;
}

export interface GenerateBoardResolutionInput {
  companyName?: string;
  cin?: string;
  registeredOffice?: string;
  resolutionType?: 'ACCOUNTS_ADOPTION' | 'AUDITOR_APPOINTMENT' | 'GENERAL_AUTHORITY';
  meetingDate?: string;
  directorName?: string;
  din?: string;
  details?: Record<string, any>;
}

export interface BoardResolutionDraftResult {
  companyName: string;
  cin: string;
  registeredOffice: string;
  meetingDate: string;
  title: string;
  body: string;
  signatory: {
    directorName: string;
    din: string;
    designation: string;
  };
}

