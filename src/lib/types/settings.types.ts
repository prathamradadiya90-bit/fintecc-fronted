export interface TaxRate {
  name: string;
  rate: number;
}

export interface InvoiceSettings {
  prefix?: string;
  nextNumber?: number;
  terms?: string;
}

export interface EmailSettings {
  smtpHost?: string;
  port?: number;
  user?: string;
  pass?: string;
}

export interface SmsSettings {
  provider?: string;
  apiKey?: string;
}

export interface ThemeSettings {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  currency?: string;
}

export interface FirmAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface FirmBranch {
  branchName: string;
  address?: string;
  headName?: string;
  phone?: string;
}

export interface FirmSettings {
  taxRates: TaxRate[];
  invoiceSettings: InvoiceSettings;
  emailSettings: EmailSettings;
  smsSettings: SmsSettings;
  themeSettings: ThemeSettings;
}

export interface SettingsResponse {
  success: boolean;
  message?: string;
  data: FirmSettings;
}

export interface UpdateSettingsRequest {
  taxRates?: TaxRate[];
  invoiceSettings?: InvoiceSettings;
  emailSettings?: EmailSettings;
  smsSettings?: SmsSettings;
  themeSettings?: ThemeSettings;
}
