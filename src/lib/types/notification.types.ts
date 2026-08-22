export interface Notification {
  id: string;
  userId?: string | null;
  firmId?: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotificationsResponse {
  success: boolean;
  message?: string;
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
  data: Notification;
}
