export type CommunicationChannel = 'EMAIL' | 'WHATSAPP' | 'SMS';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface MessageTemplate {
  id: string;
  firmId: string;
  name: string;
  channel: CommunicationChannel;
  subject?: string | null;
  body: string;
  variables?: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageTemplatePayload {
  name: string;
  channel: CommunicationChannel;
  subject?: string;
  body: string;
  variables?: string[];
  isActive?: boolean;
}

export interface UpdateMessageTemplatePayload extends Partial<CreateMessageTemplatePayload> {}

export interface CampaignAudience {
  clientGroup?: string;
  status?: string;
  type?: string;
  tags?: string[];
}

export interface BulkCampaign {
  id: string;
  firmId: string;
  templateId: string;
  name: string;
  targetAudience?: CampaignAudience | null;
  status: CampaignStatus;
  scheduledAt?: string | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  template?: MessageTemplate;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBulkCampaignPayload {
  name: string;
  templateId: string;
  targetAudience?: CampaignAudience;
  scheduledAt?: string | null;
}

export interface UpdateBulkCampaignPayload extends Partial<CreateBulkCampaignPayload> {}

// --- Email Broadcasts & Preview ---
export type BroadcastType = 'CIRCULAR' | 'BUDGET_UPDATE' | 'FIRM_ANNOUNCEMENT' | 'GENERAL';

export interface EmailBroadcastPayload {
  name?: string;
  type?: BroadcastType;
  subject: string;
  body: string;
  templateId?: string | null;
  segment?: CampaignAudience & {
    sendToAll?: boolean;
    city?: string;
    serviceType?: string;
  };
  complianceType?: string;
  skipFiledClients?: boolean;
}

export interface SegmentPreviewPayload {
  segment?: CampaignAudience & {
    sendToAll?: boolean;
    city?: string;
    serviceType?: string;
  };
}

export interface SegmentPreviewResponse {
  totalMatched: number;
  sampleClients?: Array<{ id: string; name: string; email?: string }>;
}

// --- Due Date Reminder Broadcasts ---
export type ComplianceReminderType = 'GSTR-1' | 'GSTR-3B' | 'ADVANCE_TAX' | 'TDS' | 'ITR' | 'ROC' | 'GST';

export interface DueReminderBroadcastPayload {
  complianceType: ComplianceReminderType;
  dueDate: string;
  period?: string;
  templateId?: string | null;
  customSubject?: string;
  customBody?: string;
  segment?: CampaignAudience & {
    sendToAll?: boolean;
    city?: string;
    serviceType?: string;
  };
  preview?: boolean;
}

export interface DueReminderResult {
  complianceType: string;
  dueDate: string;
  totalMatchedClients: number;
  skippedAlreadyFiledCount: number;
  nudgedClientsCount: number;
  skippedList: Array<{ clientId: string; clientName: string; email: string; reason: string }>;
  nudgedList: Array<{ clientId: string; clientName: string; email: string }>;
  message?: string;
  preview?: boolean;
}

// --- Notification Rules Engine ---
export type NotificationRuleReturnType = 'GSTR-1' | 'GSTR-3B' | 'ITR' | 'TDS' | 'ADVANCE_TAX' | 'ROC' | 'ALL';
export type NotificationRuleFilingStatus = 'PENDING' | 'OVERDUE' | 'ALL';
export type NotificationRuleChannel = 'EMAIL' | 'IN_APP' | 'BOTH';

export interface NotificationRule {
  id: string;
  firmId: string;
  name: string;
  description?: string;
  returnType: NotificationRuleReturnType;
  filingStatus: NotificationRuleFilingStatus;
  minAmount?: number | null;
  maxAmount?: number | null;
  clientSegment?: {
    clientGroup?: string;
    serviceType?: string;
    city?: string;
    tags?: string[];
    type?: string;
  };
  channel: NotificationRuleChannel;
  templateId?: string | null;
  customSubject?: string;
  customBody?: string;
  daysBeforeDueDate?: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRulePayload {
  name: string;
  description?: string;
  returnType?: NotificationRuleReturnType;
  filingStatus?: NotificationRuleFilingStatus;
  minAmount?: number | null;
  maxAmount?: number | null;
  clientSegment?: {
    clientGroup?: string;
    serviceType?: string;
    city?: string;
    tags?: string[];
    type?: string;
  };
  channel?: NotificationRuleChannel;
  templateId?: string | null;
  customSubject?: string;
  customBody?: string;
  daysBeforeDueDate?: number[];
  isActive?: boolean;
}

export interface UpdateNotificationRulePayload extends Partial<CreateNotificationRulePayload> {}

export interface EvaluateRuleResult {
  ruleId: string;
  ruleName?: string;
  matchedCount?: number;
  dispatchedCount?: number;
  message?: string;
}

// --- Email Delivery & Read Tracking ---
export interface TrackingRecipientLog {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  subject: string;
  channel: string;
  complianceType?: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  sentAt?: string;
  openedAt?: string;
  lastOpenedAt?: string;
  openCount: number;
  autoFollowUpSent: boolean;
}

export interface TrackingStatsData {
  summary: {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalFailed: number;
    unreadCount: number;
    readRatePercentage: number;
  };
  byChannel: Record<string, { sent: number; read: number }>;
  logs: TrackingRecipientLog[];
}

export interface AutoFollowUpPayload {
  daysUnopened?: number;
  returnType?: string;
  campaignId?: string;
}

export interface AutoFollowUpResult {
  totalUnopenedChecked: number;
  nudgesDispatched: number;
  skippedAlreadyFiled: number;
  message?: string;
}

