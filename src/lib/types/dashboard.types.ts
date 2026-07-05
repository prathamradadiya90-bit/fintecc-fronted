export interface PendingCompliances {
  gst: number;
  itr: number;
  roc: number;
}

export interface Revenue {
  currentMonth: number;
}

export interface StaffPerformance {
  topPerformer: string;
  tasksCompletedThisWeek: number;
}

export interface ClientMessages {
  unread: number;
}

export interface DashboardData {
  totalClients: number;
  pdfsConverted: number;
  todaysTasks: any[]; // Or define proper type if known
  upcomingDueDates: any[];
  pendingCompliances: PendingCompliances;
  revenue: Revenue;
  notifications: any[];
  aiInsights: string[];
  staffPerformance: StaffPerformance;
  clientMessages: ClientMessages;
}

export interface DashboardStatsResponse {
  success: boolean;
  message?: string;
  data: DashboardData;
}
