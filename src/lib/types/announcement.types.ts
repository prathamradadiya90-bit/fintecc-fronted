export type AnnouncementType = 'UPDATE' | 'MAINTENANCE' | 'NEWS' | 'ALERT';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAnnouncementsResponse {
  success: boolean;
  data: Announcement[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AnnouncementResponse {
  success: boolean;
  data: Announcement;
  message?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type?: AnnouncementType;
  isActive?: boolean;
}

export interface UpdateAnnouncementRequest {
  id: string;
  title?: string;
  content?: string;
  type?: AnnouncementType;
  isActive?: boolean;
}
