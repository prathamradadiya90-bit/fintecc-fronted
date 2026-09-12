export type TransactionSource =
  | 'learned_exact'
  | 'rule_based'
  | 'fallback'
  | 'native-parse'
  | 'ocr'
  | 'excel-direct'
  | 'llm-assisted'
  | string;

export type TransactionStatus =
  | 'PENDING'
  | 'MAPPED'
  | 'APPROVED'
  | 'POSTED'
  | 'IGNORED'
  | 'REJECTED';

export type StatementStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'REVIEW'
  | 'COMPLETED'
  | 'FAILED'
  | 'FAILED_PASSWORD';

export type ValidationStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'PARTIAL';

export interface BankTransaction {
  date: string;
  originalDate?: string;
  description: string;
  debit: number;
  credit: number;
  amount?: number;
  balance?: number | null;
}

export interface BankStatementTransaction {
  id: string;
  statementId: string;
  date: string;
  valueDate?: string | null;
  narration: string;
  description?: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string | null;
  suggestedLedger?: string | null;
  accountId?: string | null;
  confidenceScore: number;
  source: TransactionSource;
  needsReview: boolean;
  status: TransactionStatus;
  isReviewed?: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
  isReconciled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StatementValidationReport {
  openingBalance: number;
  totalDebits: number;
  totalCredits: number;
  expectedClosing: number;
  actualClosing: number;
  difference: number;
}

export interface StatementInfo {
  id: string;
  bankName?: string | null;
  status: StatementStatus;
  validationStatus?: ValidationStatus;
  validationReport?: StatementValidationReport | null;
  sourceChannel?: string;
  parserUsed?: string | null;
}

export interface ReviewSummary {
  totalRows: number;
  pendingRows: number;
  approvedRows: number;
  isReadyForExport: boolean;
}

export interface BankStatementReviewData {
  statementInfo: StatementInfo;
  summary: ReviewSummary;
  transactions: BankStatementTransaction[];
}

export interface BankStatement {
  id: string;
  firmId: string;
  clientId: string;
  bankName?: string | null;
  accountNumberMasked?: string | null;
  periodFrom?: string | null;
  periodTo?: string | null;
  format?: string;
  sourceChannel?: string;
  sourceType?: string;
  ocrConfidence?: number | null;
  openingBalance?: number | null;
  closingBalance?: number | null;
  parserUsed?: string | null;
  status: StatementStatus;
  validationStatus?: ValidationStatus;
  validationReport?: StatementValidationReport | null;
  fileUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    businessName?: string;
  };
  transactions?: BankStatementTransaction[];
}

export interface BankStatementResponse {
  success: boolean;
  message?: string;
  data:
    | BankTransaction[]
    | {
        count?: number;
        transactions?: BankTransaction[];
      };
}

export interface BankStatementIntakeData {
  statementId: string;
  status: StatementStatus;
  message: string;
}

export interface BankStatementIntakeResponse {
  success: boolean;
  message?: string;
  data: BankStatementIntakeData;
}

export interface QueueBankStatementSyncResponse {
  success: boolean;
  message?: string;
  data: {
    jobId: string;
    count: number;
  };
}

export interface QueueBankStatementSyncInput {
  statementId?: string;
  transactions?: BankTransaction[];
  bankLedger?: string;
}

export interface UpdateReviewRowPayload {
  statementId: string;
  rowId: string;
  body: {
    date?: string;
    narration?: string;
    reference?: string | null;
    debit?: number;
    credit?: number;
    accountId?: string | null;
    suggestedLedger?: string | null;
    approve?: boolean;
    status?: TransactionStatus;
  };
}

export interface BulkApprovePayload {
  statementId: string;
  rowIds: string[];
  transactionIds: string[];
}

export interface BulkRejectPayload {
  statementId: string;
  rowIds: string[];
  transactionIds: string[];
  reason?: string;
}

export interface LedgerMappingRule {
  id: string;
  firmId: string;
  clientId?: string | null;
  narrationPattern: string;
  suggestedLedger: string;
  accountId?: string | null;
  matchType: 'EXACT' | 'CONTAINS' | 'REGEX' | string;
  source: string;
  confidence: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLedgerMappingPayload {
  narrationPattern: string;
  suggestedLedger: string;
  matchType?: 'EXACT' | 'CONTAINS' | 'REGEX' | string;
  clientId?: string;
}
