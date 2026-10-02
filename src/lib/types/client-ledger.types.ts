export type ClientLedgerTransactionType = 'INVOICE' | 'PAYMENT' | 'REFUND' | 'OPENING_BALANCE';

export interface ClientLedgerEntry {
  id: string;
  firmId: string;
  clientId: string;
  date: string;
  transactionType: ClientLedgerTransactionType;
  referenceId?: string | null;
  description: string;
  debit: number | string;
  credit: number | string;
  balance: number | string;
  createdAt: string;
  client?: {
    id: string;
    name: string;
    companyName?: string;
  };
}

export interface GetClientLedgerParams {
  clientId?: string;
  page?: number;
  limit?: number;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateClientLedgerRequest {
  clientId: string;
  date: string;
  transactionType: ClientLedgerTransactionType;
  description: string;
  debit?: number;
  credit?: number;
  balance?: number;
  referenceId?: string;
}

export interface ClientLedgerResponse {
  success: boolean;
  message?: string;
  data: ClientLedgerEntry;
}

export interface PaginatedClientLedgerResponse {
  success: boolean;
  message?: string;
  data: ClientLedgerEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
