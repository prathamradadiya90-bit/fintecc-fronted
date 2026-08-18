export interface ChatMessage {
  id: string;
  firmId: string;
  clientId: string;
  senderId: string;
  message: string;
  attachmentUrl: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessagesResponse {
  success: boolean;
  data: ChatMessage[];
  message?: string;
}

export interface SendMessageRequest {
  clientId: string;
  message: string;
  attachmentUrl?: string | null;
}

export interface SendMessageResponse {
  success: boolean;
  data: ChatMessage;
  message?: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  data: { affected: number };
  message?: string;
}

export interface UploadFileResponse {
  success: boolean;
  data: {
    filePath: string;
    originalName: string;
    mimeType: string;
    size: number;
  };
  message?: string;
}
