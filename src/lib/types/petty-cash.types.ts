export interface PettyCashEntry {
  id: string;
  firmId: string;
  date: string;
  description: string;
  amountIn: number;
  amountOut: number;
  balance: number;
  receiptUrl?: string | null;
  loggedByUserId?: string | null;
  loggedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface CreatePettyCashPayload {
  date?: string;
  description: string;
  amountIn?: number;
  amountOut?: number;
  balance?: number;
  receiptUrl?: string;
}

export interface UpdatePettyCashPayload extends Partial<CreatePettyCashPayload> {}
