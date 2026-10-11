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

// ─── CA TAX COMPUTATION & REGIME COMPARISON ENGINE ────────────────────────────
export interface IncomeDetails {
  salary?: number | { grossSalary?: number; professionalTax?: number };
  grossSalary?: number;
  houseProperty?: {
    propertyType?: 'SELF_OCCUPIED' | 'LET_OUT';
    annualRent?: number;
    municipalTaxes?: number;
    homeLoanInterest?: number;
  };
  businessProfession?: {
    pgbpIncome?: number;
  };
  capitalGains?: {
    stcg111A?: number;
    stcgNormal?: number;
    ltcg112A?: number;
    ltcg112?: number;
  };
  otherSources?: {
    savingsInterest?: number;
    fdInterest?: number;
    dividendIncome?: number;
    otherMiscellaneous?: number;
  };
}

export interface ChapterViaDeductions {
  section80C?: number;
  section80D?: number;
  section80CCD1B?: number;
  section80G?: number;
  section80TTA?: number;
  section80TTB?: number;
  section80E?: number;
}

export interface TaxComputationInput {
  assessmentYear?: string;
  regime?: 'NEW_REGIME' | 'OLD_REGIME';
  taxpayerCategory?: 'INDIVIDUAL' | 'SENIOR_CITIZEN' | 'SUPER_SENIOR';
  incomeDetails?: IncomeDetails;
  deductions?: ChapterViaDeductions;
  advanceTaxPaid?: number;
  tdsTcsPaid?: number;
  selfAssessmentTaxPaid?: number;
  filingDate?: string;
}

export interface TaxComputationResult {
  assessmentYear: string;
  regime: string;
  grossTotalIncome: number;
  totalTaxableIncome: number;
  totalTaxPayable: number;
  refundDue: number;
  taxBreakdown: {
    baseTax: number;
    rebate87A: number;
    taxAfterRebate: number;
    surcharge: number;
    marginalRelief: number;
    cess: number;
    totalTaxAndCess: number;
  };
  headsOfIncome?: any;
  deductions?: {
    totalDeductions: number;
    breakdown: Record<string, number>;
  };
  summary: {
    grossTotalIncome: number;
    allowedDeductions: number;
    netTaxableIncome: number;
    totalTaxBeforeRebate: number;
    rebate87A: number;
    taxAfterRebate: number;
    surcharge: number;
    marginalRelief: number;
    cess: number;
    totalTaxAndCess: number;
    interest?: number;
    totalPrepaidTaxes: number;
    balanceTaxPayable: number;
    refundDue: number;
  };
}

export interface RegimeComparisonResult {
  recommendedRegime: 'NEW_REGIME' | 'OLD_REGIME';
  savings: number;
  explanation: string;
  newRegime: TaxComputationResult;
  oldRegime: TaxComputationResult;
  comparisonSummary: {
    recommendedRegime: string;
    savingsAmount: number;
    explanation: string;
  };
  comparison: {
    newRegime: {
      grossTotalIncome: number;
      deductions: number;
      taxableIncome: number;
      rebate87A: number;
      totalTaxAndCess: number;
      balancePayable: number;
      refundDue: number;
    };
    oldRegime: {
      grossTotalIncome: number;
      deductions: number;
      taxableIncome: number;
      rebate87A: number;
      totalTaxAndCess: number;
      balancePayable: number;
      refundDue: number;
    };
  };
}

export interface GenerateCbdtJsonInput {
  assessmentYear?: string;
  itrForm?: string;
  client?: any;
  computation?: any;
  bankAccounts?: Array<{ accountNumber: string; ifsc: string; bankName: string; isPrimaryForRefund?: boolean }>;
}

