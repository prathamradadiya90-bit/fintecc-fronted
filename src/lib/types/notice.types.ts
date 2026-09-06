export type NoticeType = 'GST' | 'ITR';

export type NoticeStatus = 'OPEN' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED' | 'APPEALED';

export interface Notice {
  id: string;
  firmId: string;
  clientId: string;
  type: NoticeType;
  noticeNumber: string;
  // GST specific
  noticeType?: string; // SHOW_CAUSE | DEMAND | SCRUTINY | OTHER
  gstProfileId?: string;
  notes?: string;
  // ITR specific
  sectionCode?: string; // 143(1), 143(2), 148, 139(9)
  assessmentYear?: string;
  description?: string;
  // Common
  issueDate?: string;
  dueDate?: string;
  amountDemanded?: number | string;
  amountPaid?: number | string;
  status: string; // OPEN, IN_PROGRESS, RESPONDED, CLOSED, APPEALED
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    pan?: string;
    gstin?: string;
  };
}

export interface UpdateNoticeStatusRequest {
  id: string;
  type: NoticeType;
  status: string;
}

export interface NoticesResponse {
  success: boolean;
  data: Notice[];
  message?: string;
}
