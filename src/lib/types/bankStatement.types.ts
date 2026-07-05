export interface BankTransaction {
  date: string;
  originalDate?: string;
  description: string;
  debit: number;
  credit: number;
  amount?: number;
  balance: number;
}

export interface BankStatementResponse {
  success: boolean;
  message?: string;
  data: {
    count: number;
    transactions: BankTransaction[];
  };
}
