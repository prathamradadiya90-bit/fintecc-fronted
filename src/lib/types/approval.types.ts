export type ApprovalReferenceType = 'LEAVE' | 'TASK' | 'INVOICE' | 'EXPENSE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UnifiedApproval {
  id: string;
  firmId: string;
  referenceType: ApprovalReferenceType;
  referenceId: string;
  requestedByUserId: string;
  approverUserId: string;
  status: ApprovalStatus;
  comments?: string | null;
  createdAt: string;
  updatedAt: string;
  requestedBy?: {
    id: string;
    name: string;
    email: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateApprovalPayload {
  referenceType: ApprovalReferenceType;
  referenceId: string;
  approverUserId: string;
  comments?: string;
}

export interface UpdateApprovalPayload {
  status?: ApprovalStatus;
  comments?: string;
  approverUserId?: string;
}
