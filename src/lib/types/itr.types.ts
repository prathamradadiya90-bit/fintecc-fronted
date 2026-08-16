export type ItrFormType = 'ITR1' | 'ITR2' | 'ITR3' | 'ITR4' | 'ITR5' | 'ITR6' | 'ITR7';

export type ItrReturnStatus = 
  | 'DRAFT' 
  | 'PREPARED' 
  | 'VALIDATED' 
  | 'FILED' 
  | 'E_VERIFIED'
  | 'REJECTED';

export type ItrConsentStatus = 'PENDING' | 'GRANTED' | 'EXPIRED' | 'REVOKED';

export interface ItrClient {
  id: string;
  firmId: string;
  clientId?: string;
  pan: string;
  name: string;
  email?: string;
  mobile?: string;
  phone?: string;
  consentStatus?: ItrConsentStatus;
  consentFrom?: string;
  consentTill?: string;
  eriStatus?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  client?: {
    id: string;
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
  };
}

export interface ItrPrefillPersonal {
  firstName?: string;
  lastName?: string;
  address?: string;
  pan?: string;
  [key: string]: any;
}

export interface ItrIncomeSource {
  type: string;
  amount: number;
}

export interface ItrTdsDetail {
  deductorTan: string;
  amount: number;
}

export interface ItrPrefillData {
  pan?: string;
  assessmentYear?: string;
  personalInfo?: ItrPrefillPersonal;
  incomeSources?: ItrIncomeSource[];
  tdsDetails?: ItrTdsDetail[];
  [key: string]: any;
}

export interface ItrReturn {
  id: string;
  firmId: string;
  clientId: string;
  pan?: string;
  financialYear?: string;
  assessmentYear: string;
  form?: ItrFormType;
  itrForm?: ItrFormType;
  status: ItrReturnStatus;
  prefillData?: ItrPrefillData;
  returnData?: Record<string, any>;
  validationResult?: {
    isValid?: boolean;
    message?: string;
    errors?: string[];
  };
  acknowledgementNumber?: string;
  receiptUrl?: string;
  filedAt?: string;
  submittedAt?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  client?: ItrClient;
}

export interface ItrClientsListResponse {
  success: boolean;
  data: ItrClient[];
  message?: string;
}

export interface ItrClientResponse {
  success: boolean;
  data: ItrClient;
  message?: string;
}

export interface ItrReturnResponse {
  success: boolean;
  data: ItrReturn;
  message?: string;
}

export interface AddItrClientInput {
  pan: string;
  name: string;
  email?: string;
  mobile?: string;
}

export interface PrepareReturnInput {
  clientId: string;
  assessmentYear: string;
  financialYear?: string;
  form: ItrFormType;
}

export interface PrefillDataInput {
  clientId: string;
  assessmentYear: string;
}

export interface RequestConsentResponse {
  success: boolean;
  data: {
    consentId: string;
  };
  message?: string;
}

export interface ValidateReturnResponse {
  success: boolean;
  data: {
    isValid: boolean;
    message: string;
  };
  message?: string;
}

export interface AcknowledgementResponse {
  success: boolean;
  data: {
    receiptUrl: string;
  };
  message?: string;
}
