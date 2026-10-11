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
  branchId?: string | null;
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
  branchId?: string;
  assigneeId?: string;
  complianceType?: string;
  search?: string;
  isOverdue?: boolean | string;
}

export interface CreateTaskRequest {
  clientId: string;
  branchId?: string | null;
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

export interface ReviewHistoryItem {
  action: 'SUBMIT' | 'APPROVE' | 'REJECT';
  userId: string;
  notes?: string;
  timestamp: string;
}

export interface TimeLogEntry {
  id: string;
  userId: string;
  userName: string;
  minutes: number;
  description: string;
  timestamp: string;
}

export interface Task {
  id: string;
  firmId: string;
  clientId: string;
  branchId?: string | null;
  assigneeId?: string | null;
  preparerId?: string | null;
  reviewerId?: string | null;
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
  reviewNotes?: string | null;
  reviewHistory?: ReviewHistoryItem[] | null;
  workingUserIds?: string[] | null;
  timeAllocated?: number | null;
  timeTaken?: number | null;
  timeLogs?: TimeLogEntry[] | null;
  filingVerified?: boolean | null;
  arn?: string | null;
  completedAt?: string | null;
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

export interface UpdateTaskRequest {
  clientId?: string;
  branchId?: string | null;
  assigneeId?: string | null;
  reviewerId?: string | null;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  complianceType?: string | null;
  arn?: string | null;
  comments?: TaskComment[] | null;
  attachments?: TaskAttachment[] | null;
}

export interface BulkUpdateTasksRequest {
  taskIds: string[];
  updates: {
    branchId?: string | null;
    assigneeId?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    complianceType?: string | null;
    arn?: string | null;
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

export interface KanbanBoardData {
  NOT_STARTED: Task[];
  IN_PROGRESS: Task[];
  REVIEW: Task[];
  DONE: Task[];
}

export interface KanbanBoardResponse {
  success: boolean;
  data: KanbanBoardData;
  message?: string;
}

export interface CalendarViewResponse {
  success: boolean;
  data: {
    period: { start: string; end: string };
    totalTasks: number;
    tasks: Task[];
  };
  message?: string;
}

export interface ComplianceAnalyticsSummary {
  total: number;
  completed: number;
  pending: number;
  inReview: number;
  overdue: number;
  completionRate: number;
}

export interface StaffBottleneck {
  assigneeId: string;
  activeTasks: number;
  overdueTasks: number;
  completedTasks: number;
  totalAllocatedMinutes: number;
  totalLoggedMinutes: number;
}

export interface ComplianceAnalyticsData {
  summary: ComplianceAnalyticsSummary;
  byReturnType: Record<string, { total: number; completed: number; pending: number; overdue: number }>;
  bottlenecks: StaffBottleneck[];
}

export interface ComplianceAnalyticsResponse {
  success: boolean;
  data: ComplianceAnalyticsData;
  message?: string;
}

export interface SubmitReviewRequest {
  reviewerId?: string;
  notes?: string;
}

export interface ReviewTaskRequest {
  action: 'APPROVE' | 'REJECT';
  notes: string;
}

export interface LogTimeRequest {
  minutes: number;
  description?: string;
}

export interface RescheduleTaskRequest {
  newDueDate: string;
}

export interface AiFilterRequest {
  prompt: string;
}

export interface VerifyGstPortalData {
  taskId: string;
  gstin: string;
  returnType: string;
  period: string;
  isFiled: boolean;
  arn?: string;
  filingDate?: string;
  message: string;
}

export interface VerifyGstPortalResponse {
  success: boolean;
  data: VerifyGstPortalData;
  message?: string;
}

export interface ProcessRecurringResponse {
  success: boolean;
  data: {
    processedCount: number;
    generatedTasks: Task[];
  };
  message?: string;
}

