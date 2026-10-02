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
