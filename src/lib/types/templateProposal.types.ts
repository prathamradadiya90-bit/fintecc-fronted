export type ProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LayoutColumn {
  name: string;
  headerWords: string[];
  xStart?: number;
  xEnd?: number;
  required?: boolean;
  alignment?: 'left' | 'right' | 'center';
  type?: string;
}

export interface ProposedTemplateLayout {
  columns: LayoutColumn[];
  dateFormat?: string;
  amountSeparator?: string;
  [key: string]: any;
}

export interface ProposedTemplateNumberFormat {
  decimal?: string;
  thousand?: string;
  grouping?: 'indian' | 'standard' | string;
}

export interface ProposedTemplatePageFurniture {
  headerSkipLines?: number;
  footerSkipLines?: number;
  [key: string]: any;
}

export interface ProposedTemplate {
  name?: string;
  bankCode?: string;
  bankName?: string;
  version?: number;
  schemaVersion?: number;
  detectPatterns?: string[];
  headerMarkers?: string[];
  layout?: ProposedTemplateLayout;
  numberFormat?: ProposedTemplateNumberFormat;
  pageFurniture?: ProposedTemplatePageFurniture;
  fingerprint?: any;
  [key: string]: any;
}

export interface TemplateProposal {
  id: string;
  fingerprintHash: string;
  fingerprint: {
    columnCount: number;
    headerWords: string[];
    columnBoundaries?: number[];
    [key: string]: any;
  };
  headerRow?: {
    cells?: Array<{ text: string; left?: number; right?: number; [key: string]: any }>;
    y?: number;
    page?: number;
    [key: string]: any;
  } | null;
  bankCode: string | null;
  bankName: string | null;
  proposedTemplate: ProposedTemplate;
  sampleText: string | null;
  pageImageUrl: string | null;
  pageImageBase64: string | null;
  matchCount: number;
  status: ProposalStatus;
  isProvisional: boolean;
  notificationSent?: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  approvedTemplateId?: string | null;
  linkedTemplateId?: string | null;
  generationReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  firmId?: string | null;
  samplesAccessRestricted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetProposalsParams {
  status?: ProposalStatus | 'ALL';
  bankCode?: string;
  isProvisional?: boolean;
  limit?: number;
  page?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface GetProposalsResponse {
  success: boolean;
  message?: string;
  data: TemplateProposal[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProposalImageResponse {
  success: boolean;
  data: {
    proposalId: string;
    pageImage?: string | null;
    pageImageUrl?: string | null;
    pageImageBase64?: string | null;
  };
}

export interface TestProposalReport {
  success: boolean;
  matchScore: number;
  sourceUsed: string;
  extractedCount: number;
  transactions: Array<{
    date?: string;
    description?: string;
    reference?: string;
    debit?: number | null;
    credit?: number | null;
    balance?: number | null;
    amount?: number | null;
    [key: string]: any;
  }>;
  summary: {
    totalDebits?: number;
    totalCredits?: number;
    rowCount?: number;
    [key: string]: any;
  };
  validation: {
    isValid: boolean;
    status: string;
    openingBalance?: number;
    closingBalance?: number;
    totalDebits?: number;
    totalCredits?: number;
    difference?: number;
    rowErrors?: any[];
  };
  templateUsed?: {
    bankCode?: string;
    name?: string;
    columnsCount?: number;
  };
  errors?: string[];
}

export interface BankTemplate {
  id: string;
  bankCode: string;
  bankName: string;
  name: string;
  version: number;
  status: string;
  isActive: boolean;
  priority?: number;
  detectPatterns?: string[];
  headerMarkers?: string[];
  layout?: ProposedTemplateLayout;
  numberFormat?: ProposedTemplateNumberFormat;
  dateFormat?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RejectProposalPayload {
  reason: string;
}

export interface MergeVariantPayload {
  targetTemplateId: string;
  variantName?: string;
  priority?: number;
  overrides?: any;
}

export interface EditProposalPayload {
  bankCode?: string;
  bankName?: string;
  proposedTemplate?: Partial<ProposedTemplate>;
  layout?: Partial<ProposedTemplateLayout>;
  [key: string]: any;
}
