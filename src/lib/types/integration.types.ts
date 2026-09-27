export type IntegrationProvider = 'RAZORPAY' | 'AWS_S3' | 'STRIPE' | 'TWILIO' | 'SENDGRID' | 'GOOGLE_DRIVE' | 'TALLY' | 'SETU';

export type IntegrationStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR_AUTH_FAILED';

export interface IntegrationSetting {
  id: string;
  firmId: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  apiKey?: string | null;
  apiSecret?: string | null;
  hasApiSecret?: boolean;
  webhookSecret?: string | null;
  metadata?: Record<string, any> | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveIntegrationRequest {
  provider: IntegrationProvider;
  status?: IntegrationStatus;
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
  metadata?: Record<string, any>;
}

export interface IntegrationsListResponse {
  success: boolean;
  message?: string;
  data: IntegrationSetting[];
}

export interface IntegrationResponse {
  success: boolean;
  message?: string;
  data: IntegrationSetting;
}
