export type RequestStatus = 'draft' | 'optimized' | 'sending' | 'sent' | 'failed';

export interface UnbanRequest {
  id: string;
  clientName: string;
  phoneNumber: string;
  reason: string;
  suspensionDate: string;
  deviceType: 'android' | 'ios' | 'other';
  additionalDetails?: string;
  optimizedMessage?: string;
  status: RequestStatus;
  createdAt: string;
  sentAt?: string;
  targetEmail: string;
  attachments: {
    name: string;
    size: number;
    mimeType: string;
    data: string; // Base64 data
  }[];
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
}

export interface TelegramSupport {
  title: string;
  url: string;
}
