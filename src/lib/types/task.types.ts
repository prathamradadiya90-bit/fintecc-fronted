export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'PENDING_APPROVAL';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const COMPLIANCE_TYPES = [
  'GST Returns (GSTR-1, GSTR-3B)',
  'Income Tax Returns (ITR-1 to ITR-7)',
  'Tax Audits & Statutory Audits',
  'ROC Filings',
  'TDS Returns',
  'Accounting & Bookkeeping work',
  'Advance Tax Estimation',
  'Custom / Other',
] as const;

export type ComplianceType = (typeof COMPLIANCE_TYPES)[number] | string;

export interface TaskComment {
  userId?: string;
  userName?: string;
  text: string;
  timestamp: string;
}

export interface TaskAttachment {
  fileUrl: string;
  fileName: string;
  uploadedBy?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  firmId: string;
  clientId: string;
  assigneeId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  complianceType?: string | null;
  overdueAlertSent?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null;
  nextRunDate?: string | null;
  comments?: TaskComment[] | null;
  attachments?: TaskAttachment[] | null;
  client?: {
    id: string;
    name: string;
    pan?: string;
    gstin?: string;
    email?: string;
    phone?: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTasksResponse {
  success: boolean;
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  message?: string;
}

export interface TaskResponse {
  success: boolean;
  data: Task;
  message?: string;
}

export interface GetTasksParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  clientId?: string;
  assigneeId?: string;
  complianceType?: string;
  search?: string;
  isOverdue?: boolean | string;
}

export interface CreateTaskRequest {
  clientId: string;
  assigneeId?: string | null;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  complianceType?: string | null;
  comments?: TaskComment[] | null;
  attachments?: TaskAttachment[] | null;
}

export interface UpdateTaskRequest {
  clientId?: string;
  assigneeId?: string | null;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  complianceType?: string | null;
  comments?: TaskComment[] | null;
  attachments?: TaskAttachment[] | null;
}

export interface BulkUpdateTasksRequest {
  taskIds: string[];
  updates: {
    assigneeId?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    complianceType?: string | null;
  };
}

export interface MasterExcelImportResponse {
  success: boolean;
  message: string;
  data?: {
    processedCount: number;
    newClientsCount: number;
    newTasksCount: number;
    updatedTasksCount: number;
    skippedRows?: Array<{ row: number; reason: string }>;
  };
}
