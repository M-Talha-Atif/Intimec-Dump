export interface EmailOutboxItem {
  id: string;
  recipient: string;
  workflowOrigin: string;
  status: 'sent' | 'not_sent' | 'waiting';
  timestamp: number | string;
  emailPreviewData: EmailPreviewData;
  error?: {
    message: string;
    retryCount: number;
  };
  templateId?: string;
  templateName?: string;
}

export interface EmailPreviewData {
  subject: string;
  body: string;
}

export interface EmailOutboxMetadata {
  sent: number;
  failed: number;
  waiting: number;
}