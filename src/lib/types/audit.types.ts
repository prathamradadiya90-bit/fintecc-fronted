export interface AuditLogItem {
  id: string;
  firmId: string;
  userId?: string | null;
  action: string; // e.g. "CREATE", "UPDATE", "DELETE", "UPLOAD", "DOWNLOAD_PDF", etc.
  entityType: string; // e.g. "Invoice", "Client", "Task", "Settings", etc.
  entityId?: string | null;
  details?: Record<string, any> | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AuditLogsResponse {
  success: boolean;
  message?: string;
  data: AuditLogItem[];
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  limit?: number;
}
