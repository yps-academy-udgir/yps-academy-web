/**
 * Message Model - Frontend
 * Interfaces for classroom chat messages
 */

export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'document' | 'video';
  fileSize: number;
}

export interface ReadReceipt {
  userId: string;
  readAt: Date;
}

export interface Message {
  _id: string;
  classroomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'faculty' | 'admin';
  senderAvatar?: string;
  messageText: string;
  attachments: Attachment[];
  readBy: ReadReceipt[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageInput {
  classroomId: string;
  messageText: string;
  attachments?: Attachment[];
}

export interface PaginatedMessageResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCounts {
  [classroomId: string]: number;
}
